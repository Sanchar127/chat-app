import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  recipient: string;
  text?: string;
  timestamp: Date;
  attachment?: string; // Store file path or URL
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  text: { type: String },
  timestamp: { type: Date, default: Date.now },
  attachment: { type: String }, // Optional field for attachments
});

// Prevent recompiling model on hot reload
const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
