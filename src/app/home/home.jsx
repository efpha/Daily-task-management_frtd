import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-4 sm:px-8 py-4 border-b border-slate-700">
        <h2 className="text-2xl text-white font-bold tracking-wide">Task Manager</h2>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-4">
          <Link
            to="/home/login"
            className="px-4 py-2 text-white rounded-lg bg-[#40404f] hover:bg-slate-700 transition"
          >
            Login
          </Link>
          <Link
            to="/home/register"
            className="px-4 py-2 rounded-lg text-white bg-blue-500 hover:text-white transition"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-white hover:text-blue-400 transition"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-slate-800 border-b border-slate-700 px-4 py-4 flex flex-col gap-3">
          <Link
            to="/home/login"
            className="px-4 py-2 text-white rounded-lg bg-[#40404f] hover:bg-slate-700 transition"
          >
            Login
          </Link>
          <Link
            to="/home/register"
            className="px-4 py-2 rounded-lg text-white bg-blue-500 hover:text-white transition"
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row flex-1 items-center justify-center px-4 md:px-20 gap-10 text-center lg:text-left">
        {/* Text */}
        <div className="lg:w-3/4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Manage Your Daily Tasks Effortlessly
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-4">
            Stay organized, improve productivity, and focus on what truly matters.
          </p>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Track progress. Reduce clutter. Simplify your day.
          </p>
          <div className="pt-6">
            <button className="inline-block px-6 py-3 text-base sm:text-lg rounded-xl text-slate-900 bg-white hover:bg-slate-100 transition">
              Start Now It is Free
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;