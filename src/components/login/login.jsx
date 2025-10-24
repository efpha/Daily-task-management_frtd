import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";
import { AuthContext } from "../../authcontext.jsx";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://daily-task-management-backend.onrender.com/api/users/login/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token, refresh_token } = response.data;

      // call context login
      login(access_token, refresh_token);

      // redirect
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="card-container">
        <h1>Provide your details to proceed</h1>
        <form className="form_section" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email e.g. john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <div className="links_container">
            <Link to="#">Forgot password</Link>
            <Link to="/home/register">Create Account</Link>
          </div>

          <button className="continue_btn" type="submit">Continue</button>
          {error && <p className="error_message">{error}</p>}

        </form>
      </div>
    </div>
  );
};

export default Signin;
