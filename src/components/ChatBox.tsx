"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";

// ✅ Initialize socket only once
const socket: Socket = io("http://localhost:4000", { autoConnect: false });

interface Message {
  _id?: string;
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

  // ✅ Ensure WebSocket connection is established once
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleReceiveMessage = (message: Message) => {
      console.log("📥 New message received:", message);
      setMessages((prev) => {
        if (!prev.some((msg) => msg._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage); // Cleanup listener
    };
  }, []);

  // ✅ Set the user's socket ID
  useEffect(() => {
    if (senderEmail) {
      socket.emit("setUsername", senderEmail);
    }
  }, [senderEmail]);

  // ✅ Fetch chat history when contact changes
  useEffect(() => {
    if (selectedContact && senderEmail) {
      fetch(
        `http://localhost:4000/messages?sender=${senderEmail}&recipient=${selectedContact.email}`
      )
        .then((res) => res.json())
        .then(setMessages)
        .catch((err) => console.error("❌ Fetch error:", err));
    }
  }, [selectedContact, senderEmail]);

  // ✅ Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !senderEmail || !selectedContact) return;

    const message: Message = {
      sender: senderEmail,
      recipient: selectedContact.email,
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      // ✅ Emit the message via WebSocket (this will trigger the backend to save it)
      socket.emit("sendMessage", message);
      console.log("📤 Message sent:", message);

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
              <div
                key={msg._id}
                className={`flex ${
                  msg.sender === senderEmail ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    msg.sender === senderEmail ? "bg-green-600" : "bg-gray-700"
                  } text-white shadow-md`}
                >
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
            <button
              className="ml-2 bg-green-500 p-2 rounded-lg text-white hover:bg-green-600"
              onClick={sendMessage}
            >
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