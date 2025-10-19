import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://127.0.0.1:8000/api/tasks/"; 

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

 const handleAddTask = async (e) => {
  e.preventDefault();
  if (!newTask.trim()) return;

  try {
    await axios.post(
      "http://127.0.0.1:8000/api/tasks/create/",
      { title: newTask },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewTask("");
    fetchTasks(); // refresh the list
  } catch (error) {
    console.error("Error adding task:", error.response?.data || error.message);
  }
};

  // Delete a task
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Logout user
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
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
              <li><a href="#">All Tasks</a></li>
              <li><a href="#">Pending</a></li>
              <li><a href="#">In Progress</a></li>
              <li><a href="#">Completed</a></li>
            </ul>
          </div>

          <div className="logout">
            <button className="all_btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="content_center">
        <div className="content_center_container">
          <div className="title">Task Manager</div>

          <div className="add_task_form">
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task title"
              />
              <button className="all_btn" type="submit">Add Task</button>
            </form>
          </div>

          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <ul className="task_list">
              {tasks.length === 0 ? (
                <p>No tasks yet. Add one!</p>
              ) : (
                tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
