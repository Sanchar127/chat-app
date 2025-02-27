import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "../../../utils/db"; // Ensure this connects to MongoDB
import Message from "../../models/Message"; // Import Message model

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // Ensure database connection

    const { searchParams } = new URL(req.url);
    const sender = searchParams.get("sender");
    const recipient = searchParams.get("recipient");

    if (!sender || !recipient) {
      return NextResponse.json(
        { error: "Sender and recipient are required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort({ timestamp: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
