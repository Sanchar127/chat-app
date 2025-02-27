"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiMenu, FiSettings, FiUser } from "react-icons/fi";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"; // Import Clerk authentication components

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-sky-400 to-sky-800 text-white p-6 shadow-lg hover:bg-gradient-to-r hover:from-sky-500 hover:to-sky-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side: Logo and Search Bar */}
        <div className="flex items-center space-x-6 gap-8">
          <div className="text-2xl font-bold">
            <Link href="/" className="text-white hover:text-gray-300">
              ChatApp
            </Link>
          </div>

          {/* Search Bar for Larger Screens */}
          <div className="hidden sm:flex items-center space-x-3 w-full sm:w-2/3">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full px-6 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <FiSearch size={30} className="text-white cursor-pointer" />
          </div>
        </div>

        {/* Right side: Authentication & Icons */}
        <div className="flex items-center space-x-6 ml-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>

          <SignedIn>
            <UserButton />
            <Link href="/chats" className="text-white hover:text-gray-300 sm:block hidden">
              <FiUser size={26} />
            </Link>
            <Link href="/settings" className="text-white hover:text-gray-300 sm:block hidden">
              <FiSettings size={26} />
            </Link>
          </SignedIn>

          {/* Mobile Menu (Hamburger Icon) */}
          <button
            className="text-white hover:text-gray-300 sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FiMenu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-blue-600 text-black p-6 gap-5">
          <Link href="/chats" className="block py-3 hover:text-blue-400">
            Chats
          </Link>
          <Link href="/contacts" className="block py-3 hover:text-blue-400">
            Contacts
          </Link>
          <Link href="/settings" className="block py-3 hover:text-blue-400">
            Settings
          </Link>
        </div>
      )}
    </nav>
  );
}
