import { NextResponse } from "next/server";
import Contact from "../../models/Contact"; // Ensure correct path
import {dbConnect} from "../../../utils/db"; // Ensure correct path

// Handle POST request - Create a new contact
export async function POST(req: Request) {
  try {
    console.log("🔹 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    const { name, email, userEmail } = await req.json();
    console.log("Received contact data:", { name, email, userEmail });

    if (!name || !email || !userEmail) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    console.log("🔹 Creating contact...");
    
    const newContact = await Contact.create({ name, email, userEmail }); // Store the created contact

    console.log("✅ Contact saved:", newContact);
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating contact:", error);
    return NextResponse.json({ error: "Failed to create contact." }, { status: 500 });
  }
}




export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

    console.log("Received userEmail:", userEmail); // Debugging

    if (!userEmail) {
      console.error("❌ Missing userEmail in request");
      return NextResponse.json({ error: "User email is required." }, { status: 400 });
    }

    const contacts = await Contact.find({ userEmail });
    
    console.log("Fetched contacts:", contacts);
    
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts." }, { status: 500 });
  }
}

