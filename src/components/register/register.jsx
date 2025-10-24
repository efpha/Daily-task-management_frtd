import './register.css';
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../axiosConfig.js";

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

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Send registration data to Django backend
      await axios.post("https://daily-task-management-backend.onrender.com/api/users/register/", 
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
    }
  };

  return (
    <div className="register_container">
      <div className="card-container">
        <div className="create_acc">
          <h1>Create Account</h1>
        </div>
        <form className="form_section" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Firstname e.g. John"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
          />
          <div>
            <Link className="exist_link" to="/home/login">
              Have an existing account?
            </Link>
          </div>
          <button className="continue_btn" type="submit">Continue</button>
          {error && <p className="error_message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
