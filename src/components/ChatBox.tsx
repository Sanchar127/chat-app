"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";

const socket = io("http://localhost:4000");

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  selectedContact: { name: string; email: string } | null;
}

const ChatBox = ({ selectedContact }: ChatBoxProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderEmail = user?.primaryEmailAddress?.emailAddress;

  // ✅ Connect user to WebSocket
  useEffect(() => {
    if (senderEmail) {
      socket.emit("setUsername", senderEmail);
    }

    socket.on("receiveMessage", (message: Message) => {
      console.log("📥 New message received:", message);

      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        return exists ? prev : [...prev, message];
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [senderEmail]);

  // ✅ Fetch chat history when a contact is selected
  useEffect(() => {
    if (selectedContact && senderEmail) {
      fetch(`http://localhost:4000/messages?sender=${senderEmail}&recipient=${selectedContact.email}`)
        .then((res) => res.json())
        .then(setMessages)
        .catch((err) => console.error("❌ Fetch error:", err));
    }
  }, [selectedContact, senderEmail]);

  // ✅ Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !senderEmail || !selectedContact) return;

    const message = {
      sender: senderEmail,
      recipient: selectedContact.email,
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      // ✅ Send to backend
      const response = await fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error("❌ Failed to send message");

      const savedMessage = await response.json();

      // ✅ Emit message via WebSocket (Backend will handle appending)
      socket.emit("sendMessage", savedMessage);
      console.log("📤 Message sent:", savedMessage);

      setInputMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div className="w-3/4 flex flex-col">
      {selectedContact ? (
        <>
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="font-bold">{selectedContact.name}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
            {messages.map((msg) => (
              <div key={msg._id} className={`flex ${msg.sender === senderEmail ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`p-3 rounded-lg ${msg.sender === senderEmail ? "bg-green-600" : "bg-gray-700"} text-white shadow-md`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-800 flex border-t border-gray-700">
            <input
              type="text"
              className="flex-1 p-2 bg-gray-700 text-white rounded"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="ml-2 bg-green-500 p-2 rounded-lg text-white hover:bg-green-600" onClick={sendMessage}>
              <Send size={20} />
            </button>
          </div>
        </>
      ) : (
        <p className="text-lg text-gray-400">Select a contact to start chatting</p>
      )}
    </div>
  );
};

export default ChatBox;
