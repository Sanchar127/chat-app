"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, User, Mail, Search, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // Clerk Authentication

interface Contact {
  _id: string;
  name: string;
  email: string;
}

const Contacts = () => {
  const { user, isLoaded } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Tracks API call
  const [error, setError] = useState<string | null>(null); // Tracks errors
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user?.emailAddresses[0]?.emailAddress) {
      fetchContacts(user.emailAddresses[0].emailAddress);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const fetchContacts = async (userEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/contacts?userEmail=${userEmail}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");

      const data = await res.json();
      console.log("Fetched contacts:", data); // Debugging log

      if (Array.isArray(data)) {
        setContacts(data);
        setFilteredContacts(data);
      } else {
        throw new Error("API response is not an array");
      }
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      setError(error.message);
      setContacts([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      return alert("Name and email are required.");
    }

    if (!user?.emailAddresses[0]?.emailAddress) {
      return alert("You must be logged in to add a contact.");
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          userEmail: user.emailAddresses[0].emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact");
      }

      const newContact = await response.json();
      setContacts((prevContacts) => [...prevContacts, newContact]);
      setNewName("");
      setNewEmail("");
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("Error adding contact. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="w-full max-w-lg bg-gray-900 bg-opacity-90 shadow-lg rounded-2xl p-6 backdrop-blur-lg border border-gray-700">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-400">Contacts</h2>

        {/* Add Contact Form */}
        <form onSubmit={addContact} className="flex flex-col gap-4 mb-6">
          <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
            <User size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name"
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
            <Mail size={20} className="text-gray-400 mr-3" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition shadow-md"
          >
            <Plus size={18} /> Add Contact
          </button>
        </form>

        {/* Search Box */}
        <div className="flex items-center bg-gray-800 p-3 rounded-lg border border-gray-700 mb-4">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Contact List */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Saved Contacts</h3>

          {loading ? (
            <p className="text-gray-400 text-center">Loading contacts...</p>
          ) : error ? (
            <p className="text-red-400 text-center">Error: {error}</p>
          ) : contacts.length > 0 ? (
            <ul className="space-y-4">
              {contacts.map((contact) => (
                <li
                  key={contact._id}
                  className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-700 transition hover:bg-gray-800"
                >
                  <div>
                    <p className="font-semibold text-lg">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No contacts found.</p>
          )}
        </div>

        {/* Back Button */}
        <button
          className="mt-6 w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold transition shadow-md"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Chat
        </button>
      </div>
    </div>
  );
};

export default Contacts;
