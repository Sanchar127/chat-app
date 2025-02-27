import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../utils/db";
import User from "../../models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // Ensure database is connected

    const users = await User.find().select("username profilePic");

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
