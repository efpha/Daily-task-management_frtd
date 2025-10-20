import React, { useEffect, useState } from "react";
import {CirclePlus, BadgePlus, Tag, Trash2, PencilLine, NotebookTabs } from "lucide-react";
import axios from "axios";
import "./dashboard.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://127.0.0.1:8000/api/tasks/";

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}all`, {
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

  // Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await axios.post(
        `${API_URL}create/`,
        { title: newTask.title, description: newTask.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask({ title: "", description: "" });
      setShowPopup(false);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error.message);
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Logout
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  return (
    <div className="dash_container">
      {/* Sidebar */}
      <div className="side_bar">
        <div className="side_bar_container">
          <div className="user_profile">
            <button className="all_btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="tasks_overview">
            <h3>Tasks Overview</h3>
            <p>Total Tasks: {tasks.length}</p>
          </div>

          <div className="side_link_list">
            <ul>
              <li>
                <CirclePlus size={24}/>
                <button onClick={() => setShowPopup(true)} className="all_btn">
                  Add Task
                </button>
              </li>
              <li><a href="#">All Tasks</a></li>
              <li><a href="#">Pending</a></li>
              <li><a href="#">In Progress</a></li>
              <li><a href="#">Completed</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content_center">
        <div className="content_center_container">

          <div className="title">My Tasks</div>
          <hr />
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div>
              {/* Add Task button once at the top */}
              <div className="task_header">
                <button onClick={() => setShowPopup(true)} className="all_btn">
                  New Task
                  <CirclePlus />
                </button>
               
              </div>

              {/* Task List */}
              <ul className="task_list">
                {tasks.length === 0 ? (
                  <span className="no_tasks">
                    <p>No tasks yet. Add some</p>
                  </span>
                ) : (
                  tasks.map((task) => (
                    <li key={task.id}>
                      <div className="title_section">
                        <span>{task.title}</span>
                      </div>
                      <div className="manipulators">
                        <button><PencilLine /></button>
                        <button onClick={() => handleDelete(task.id)}>
                          <Trash2 size={24}/>
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="popup_overlay">
          <div className="popup_card">
            <div className="heading">
              <BadgePlus size={24}/>
              <h2> Create task</h2>
            </div>
            <hr />
            <form onSubmit={handleAddTask}>
              <div className="mini_input_container">
                <input type="text" name="title" placeholder="Enter task title" value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Tag />
              </div>
              <div className="mini_input_container">
                <textarea
                  name="description"
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  
                ></textarea>
                <NotebookTabs />
              </div>


              <div className="popup_buttons">
                <button type="submit" className="save_btn">Save Task</button>
                <button type="button" className="close_btn" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
