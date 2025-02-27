"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Hero = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/chat");
    } else {
      // Redirect to Clerk's sign-in page with the specified redirect URL
      window.location.href =
        "https://evolved-piranha-52.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F";
    }
  };

  return (
    <section className="bg-gradient-to-r from-sky-400 to-sky-800 text-white py-32 h-screen bg-cover bg-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between h-full">
        {/* Left side: Text Content */}
        <div className="text-center lg:text-left lg:w-1/2 space-y-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-wide leading-tight">
            Welcome to ChatApp
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-80">
            Connect with your friends, share moments, and stay in touch with ease.
          </p>
          <div className="flex justify-center lg:justify-start space-x-6">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl text-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right side: Image for Larger Screens */}
        <div className="hidden lg:block lg:w-1/2 mt-12 lg:mt-0">
          <img
            src="/banner.avif"
            alt="App Screenshot"
            className="rounded-xl shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
