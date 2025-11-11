import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-slate-700">
        <h2 className="text-2xl text-white font-bold tracking-wide">Task Manager</h2>
        <div className="space-x-4">
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
      </header>

      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row flex-1 items-center justify-center px-8 md:px-20 gap-10 text-center lg:text-left">
        {/* Text */}
        <div className="lg:w-3/4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Manage Your Daily Tasks Effortlessly
          </h1>
          <p className="text-lg text-slate-300">
            Stay organized, improve productivity, and focus on what truly matters.
          </p>
          <p className="text-slate-400">
            Track progress. Reduce clutter. Simplify your day.
          </p>
          <div className="pt-6">
            <Link
              to="/home/register"
              className="px-6 py-3 text-lg rounded-xl text-slate-900 bg-white transition"
            >
              Start Now It is Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
