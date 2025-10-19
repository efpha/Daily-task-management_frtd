import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
  return (
    <div className="home_container">
      <div className="login_section">
        <Link className="login_link" to="/login">Login</Link>  
      </div>

      <div className="landing_center">
        <h1>Manage Daily Task</h1>
        <p>Organize your daily tasks efficiently.</p>
        <p>Minimize task wastage.</p>
        <a className="get_started_link" href="/register">Get started</a>
      </div>
    </div>
  );
};

export default Home;
