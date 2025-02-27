"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import ChatBox from "../../components/ChatBox";

interface Contact {
  _id: string;
  name: string;
  email: string;
}

const Chat = () => {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!user || !user.emailAddresses) return;
        
        const userEmail = user.emailAddresses[0].emailAddress; // Clerk email
        
        console.log("Fetching contacts for user:", userEmail);
  
        const res = await fetch(`/api/contacts?userEmail=${encodeURIComponent(userEmail)}`);
  
        if (!res.ok) {
          throw new Error(`Failed to fetch contacts: ${res.statusText}`);
        }
  
        const data = await res.json();
        console.log("Contacts received:", data);
        
        setContacts(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("Error fetching contacts:", error.message);
        setContacts([]); // Ensure contacts is always an array
      }
    };
  
    fetchContacts();
  }, [user]);
  

  if (!user) return <p>Please log in to chat.</p>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        
        {/* Error Message */}
        {error && <p className="text-red-400">{error}</p>}

        {/* Ensure contacts is an array before mapping */}
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => setSelectedContact(contact)}
              className="p-3 cursor-pointer hover:bg-gray-700"
            >
              {contact.name}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No contacts available.</p>
        )}
      </div>
      <ChatBox selectedContact={selectedContact} />
    </div>
  );
};

export default Chat;
