import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  recipient: string;
  text: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Prevent model recompilation
export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
