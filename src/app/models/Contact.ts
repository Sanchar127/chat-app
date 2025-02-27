import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  userEmail: string; // Add this field
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true }, // Ensure userEmail is stored
});

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
