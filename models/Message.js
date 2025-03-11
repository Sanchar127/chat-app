const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  text: { type: String },
  timestamp: { type: Date, default: Date.now },
  attachment: { type: String }, // Store file path or URL
});

module.exports = mongoose.model("Message", MessageSchema);