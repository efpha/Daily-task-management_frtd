// import './register.css';
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

    setLoading(true); //for spinner

    try {
      // Send registration data to Django backend
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
<div className="min-h-screen flex items-center justify-center bg-white px-16">
  <div className="max-w-lg py-5 px-8 bg-white rounded-2xl shadow-lg">
    <div className="mb-6">
      <h1 className="flex text-3xl font-semibold text-center text-[#40404f]">
        Create Account
      </h1>
    </div>

    <form className="flex flex-col gap-3 justify-center" onSubmit={handleSubmit}>
      <section className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Firstname e.g. John"
          required
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. john@example.com"
          required
          className="w-full border border-gray-300 rounded-md px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full border border-gray-300 rounded-md px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          required
          className="w-full border border-gray-300 rounded-md px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
        />
      </section>

      <div className="flex justify-center mt-4">
        <Link to="/home/login" className="text-xs text-[#40404f] font-medium hover:text-gray-700">
          Have an existing account?
        </Link>
      </div>

      <div className="flex justify-center mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-72 bg-[#40404f] text-white py-4 rounded-md hover:bg-[#353540] transition flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Spinner className="text-white" /> processing...
                </>
              ) : (
                "continue"
              )}
            </Button>
          </div>

      {error && (
        <p className="text-red-600 text-xs text-center mt-3">{error}</p>
      )}
    </form>
  </div>
</div>
  );
};

export default Register;
