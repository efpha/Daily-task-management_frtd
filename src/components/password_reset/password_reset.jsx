import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { Spinner } from "../ui/spinner.jsx";
import { usePasswordReset } from "../../hooks/usePasswordReset.js";

const PasswordReset = () => {
  const { email, loading, error, success, handleEmailChange, handleSubmit } =
    usePasswordReset();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-16">
      <div className="max-w-lg p-12 rounded-2xl shadow-lg">
        <h1 className="flex text-3xl font-semibold text-center text-white mb-10">
          Reset your password
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="email"
            name="email"
            placeholder="Email e.g. john@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            className="w-full border border-gray-300 rounded-md px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition"
            aria-label="Email address"
            disabled={loading}
          />

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="w-72 bg-white hover:bg-white text-[#40404f] py-4 rounded-md transition flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </div>

          <div className="flex justify-center text-sm text-slate-300 font-medium">
            <Link to="/home/login" className="hover:text-white transition">
              Back to login
            </Link>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-500 text-sm text-center" role="status">
              {success}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;