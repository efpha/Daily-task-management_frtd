import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../axiosConfig.js";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { AuthContext } from "../../authcontext.jsx";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const  base_live_URL=import.meta.VITE_BASE_LIVE_URL
  const  base_local_URL= import.meta.VITE_BASE_LOCAL_URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('users/login/', formData);

      const { access_token, refresh_token } = response.data;
      login(access_token, refresh_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      console.error("Error response:", err.response?.data);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff] px-16">
      <div className="w-3/4 h-1/2 max-w-lg py-5 px-8 bg-white rounded-2xl shadow-lg">
        <h1 className="flex text-3xl font-semibold text-center text-[#40404f] mb-10">
          Provide your details to proceed
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 justify-center ">
          <section className="flex flex-col gap-10">
            <input
              type="email"
              name="email"
              placeholder="Email e.g. john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#40404f] transition"
            />
          </section>

          <div className="flex flex-row justify-center gap-5 text-sm text-[#40404f] font-medium">
            <Link to="#" className="hover:text-gray-700">
              Forgot password?
            </Link>
            <Link to="/home/register" className="hover:text-gray-700">
              Create Account
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
                  <Spinner className="text-white" /> Logging in...
                </>
              ) : (
                "Login"
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

export default Signin;