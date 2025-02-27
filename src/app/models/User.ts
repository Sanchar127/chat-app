import mongoose, { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  profilePic?: string;
  contacts: mongoose.Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  profilePic: { type: String, default: "" },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Fix for Next.js: Prevent multiple model registrations
const User = models.User || model<IUser>("User", UserSchema);

export default User;
