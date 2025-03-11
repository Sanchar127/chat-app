"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { Send, Paperclip } from "lucide-react";

// Initialize socket connection
const socket: Socket = io("http://localhost:4000", { autoConnect: false });

interface Message {
  _id?: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
  attachment?: string; // Optional attachment field
}

interface ChatBoxProps {
  selectedContact: { name: string; email: string } | null;
}

const ChatBox = ({ selectedContact }: ChatBoxProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderEmail = user?.primaryEmailAddress?.emailAddress;

  // Connect WebSocket and set up listeners
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
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  // Set user's socket ID
  useEffect(() => {
    if (senderEmail) {
      socket.emit("setUsername", senderEmail);
    }
  }, [senderEmail]);

  // Fetch chat history when contact changes
  useEffect(() => {
    if (selectedContact && senderEmail) {
      fetch(
        `http://localhost:4000/messages?sender=${senderEmail}&recipient=${selectedContact.email}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch messages");
          return res.json();
        })
        .then((data) => {
          console.log("📥 Messages received:", data);
          setMessages(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("❌ Fetch error:", err);
          setMessages([]);
        });
    }
  }, [selectedContact, senderEmail]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if ((!inputMessage.trim() && !file) || !senderEmail || !selectedContact) return;

    let attachmentPath = "";

    // Upload file if selected
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`❌ Failed to upload file: ${errorText}`);
        }

        const { filePath } = await response.json();
        attachmentPath = filePath;
        console.log("📤 File uploaded successfully:", filePath);
      } catch (error) {
        console.error("❌ Error uploading file:", error);
        return;
      }
    }

    const message: Message = {
      sender: senderEmail,
      recipient: selectedContact.email,
      text: inputMessage,
      timestamp: new Date().toISOString(),
      attachment: attachmentPath,
    };

    try {
      socket.emit("sendMessage", message);
      console.log("📤 Message sent:", message);

      // Clear input fields
      setInputMessage("");
      setFile(null); // Reset file input
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
                key={msg._id || `${msg.timestamp}-${msg.sender}`} // Unique key
                className={`flex ${
                  msg.sender === senderEmail ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    msg.sender === senderEmail ? "bg-green-600" : "bg-gray-700"
                  } text-white shadow-md`}
                >
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {msg.attachment && (
                    <div className="mt-2">
                      {msg.attachment.endsWith(".jpg") ||
                      msg.attachment.endsWith(".png") ||
                      msg.attachment.endsWith(".jpeg") ? (
                        <img
                          src={`http://localhost:4000${msg.attachment}`}
                          alt="Attachment"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <a
                          href={`http://localhost:4000${msg.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  )}
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
            <label className="ml-2 p-2 bg-gray-700 text-white rounded cursor-pointer">
              <Paperclip size={20} />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
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