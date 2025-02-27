"use client";
import { useState, useEffect } from "react";

interface Contact {
  _id: string;
  name: string;
  email: string;
}

interface ContactListProps {
  setSelectedContact: (contact: Contact) => void;
  selectedContact: Contact | null;
}

const ContactList = ({ setSelectedContact, selectedContact }: ContactListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts");
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const data: Contact[] = await res.json();
        setContacts(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="w-1/4 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Contacts</h2>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          onClick={() => setSelectedContact(contact)}
          className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-all ${
            selectedContact?._id === contact._id ? "bg-gray-700" : ""
          }`}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${contact.name}&background=random`}
            alt={contact.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-medium">{contact.name}</h3>
            <p className="text-sm text-gray-400">Tap to chat</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
