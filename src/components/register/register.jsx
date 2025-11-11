import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../axiosConfig.js";

import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const Register = () => {
  const [formData, setFormData] = useState(
    {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    }
);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await api.post(`users/register/`, 
        {
            name: formData.name,
            email: formData.email,
            password: formData.password,
        }, 
      {
        headers: {
          "Content-Type": "application/json"
        }
      });

      navigate("/home/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-16">
      <div className="max-w-lg p-12 rounded-2xl shadow-lg">
        <h1 className="flex text-3xl font-semibold text-center text-white mb-10">
          Create Account
        </h1>

        <form className="flex flex-col gap-3 justify-center" onSubmit={handleSubmit}>
          <section className="flex flex-col gap-10">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Firstname e.g. John"
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email e.g. john@example.com"
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition"
            />
          </section>

          <div className="flex justify-center mt-4">
            <Link to="/home/login" className="text-sm text-slate-300 font-medium hover:text-white transition">
              Have an existing account?
            </Link>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-72 bg-white hover:bg-white text-[#40404f] py-4 rounded-md transition flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Spinner /> processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;