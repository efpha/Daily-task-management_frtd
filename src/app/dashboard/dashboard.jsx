import React from "react";
import "./dashboard.css";

const Dashboard = () => {
  const handleLogout = (e) => {
    e.preventDefault();
    // Example: logout logic here

    try{
        // Remove JWT token from localStorage
        localStorage.removeItem("jwt");

        // Redirect to login page
        window.location.href = "/";
    }
    catch(err){
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dash_container">
      <div className="side_bar">
          <div className="side_bar_container">
              <div className="user_profile">
                <button className="all_btn">Profile</button>
              </div>
              <div className="side_link_list">
                  <ul>
                      <li><a href="http://">Add task</a></li>
                      <li><a href="http://">All</a></li>
                      <li><a href="http://">Pending</a></li>
                      <li><a href="http://">In Progress</a></li>
                      <li><a href="http://">Completed</a></li>
                  </ul>
              </div>
              <div className="logout">
                    <button className="all_btn" type="submit" onClick={handleLogout}>Logout</button>
              </div>
          </div>
      </div>

      <div className="content_center">
          <div className="content_center_container">
              <div className="title">Task</div>
              <div className="tasks_field">
                  <div className="empty_tasks">
                      <h2>Create task</h2>
                      <button className="all_btn" type="submit">Add task</button>
                  </div>
              </div>
          </div>
      </div>

  </div>
  );
};

export default Dashboard;
