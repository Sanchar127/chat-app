require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Store online users (mapping emails to socket IDs)
const users = {};

io.on("connection", (socket) => {
  console.log(`🔵 New connection: ${socket.id}`);

  socket.on("setUsername", (email) => {
    users[email] = socket.id;
    console.log(`✅ User ${email} connected with ID ${socket.id}`);
    io.emit("userList", Object.keys(users)); // Broadcast online users
  });

  socket.on("sendMessage", async (message) => {
    try {
      console.log("📩 Received message:", message);
  
      // Remove _id if it exists (MongoDB will generate one automatically)
      const { _id, ...messageData } = message;
  
      // Save to database
      const savedMessage = await Message.create(messageData);
  
      // Emit message to recipient if online
      if (users[message.recipient]) {
        console.log(`📤 Sending message to recipient ${message.recipient}`);
        io.to(users[message.recipient]).emit("receiveMessage", savedMessage);
      }
  
      // Emit to sender
      io.to(users[message.sender]).emit("receiveMessage", savedMessage);
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });
  

  // ✅ Handle disconnection
  socket.on("disconnect", () => {
    const email = Object.keys(users).find((key) => users[key] === socket.id);
    if (email) {
      delete users[email];
      io.emit("userList", Object.keys(users)); // Update user list
    }
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// ✅ Fetch messages API
app.get("/messages", async (req, res) => {
  try {
    const { sender, recipient } = req.query;
    if (!sender || !recipient) {
      return res.status(400).json({ error: "Sender and recipient required" });
    }

    const messages = await Message.find({
      $or: [{ sender, recipient }, { sender: recipient, recipient: sender }],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Store messages API
app.post("/messages", async (req, res) => {
  try {
    const { sender, recipient, text, timestamp } = req.body;

    if (!sender || !recipient || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = new Message({ sender, recipient, text, timestamp });
    const savedMessage = await message.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("❌ Error saving message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
