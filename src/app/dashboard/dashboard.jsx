import React, { useEffect, useState } from "react";
import {
  PanelLeftClose,
  PanelRightClose,
  X,
  GripVertical,
  CirclePlus,
  BadgePlus,
  Tag,
  Trash2,
  PencilLine,
  NotebookTabs,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import axios from "../../axiosConfig.js";
import "./dashboard.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false); 
  const [showTaskPopup, setShowTaskPopup] = useState(false); 
  const [selectedTask, setSelectedTask] = useState(null); 
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const token = localStorage.getItem("accessToken");

  const  base_live_URL=import.meta.VITE_BASE_LIVE_URL
  const  base_local_URL= import.meta.VITE_BASE_LOCAL_URL

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_live_URL}all`, {
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
        `${base_live_URL}tasks/create/`,
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
      await axios.delete(`${base_live_URL}tasks/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      setShowTaskPopup(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Update a task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${base_live_URL}tasks/update/${selectedTask.id}/`,
        {
          title: selectedTask.title,
          description: selectedTask.description,
          completed: selectedTask.completed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTaskPopup(false);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Mark task done toggle
  const handleMarkDone = () => {
    setSelectedTask({
      ...selectedTask,
      completed: !selectedTask.completed,
    });
  };

  // Show task details popup
  const handleShowTaskPopup = (task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  // Logout
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/home/login";
  };

  //side_bar close
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
};

  return (
    <div className="dash_container">
      {/* This one Sidebar */}
      <div className={`side_bar ${sidebarOpen ? "open" : "closed"}`} title="Toggle Sidebar">
        <div className="side_bar_container">
          <div className="user_profile">
            <button className="all_btn" onClick={handleLogout} title="end session">
              Logout
            </button>
            <span className="close_panel" onClick={handleToggleSidebar} title="Toggle Sidebar">
              <PanelLeftClose />
            </span>
          </div>
          <div className="create">
            <span onClick={() => setShowPopup(true)} className="create_task" title="Create New Task">
             <CirclePlus />   Add task
            </span>
          </div>

          <div className="side_link_list">
            <ul>
              <li>
                <div className="tasks_overview">
                  <h3>Tasks Filters</h3>
                </div>
              </li>
              <li><a href="#">All Tasks {tasks.length}</a></li>
              <li><a href="#">Pending</a></li>
              <li><a href="#">In Progress</a></li>
              <li><a href="#">Completed</a></li>
            </ul>
          </div>
        </div>
      </div>
      {!sidebarOpen && (
        <span className="open_panel" onClick={handleToggleSidebar}>
          <PanelRightClose />
        </span>
      )}

      <div className="content_center">
        <div className="content_center_container">
          <div className="tasks_heading">
            <div className="title_and_btn">
              <div className="title">My Tasks</div>
              <button onClick={() => setShowPopup(true)} className="all_btn create_task" title="Create New Task">
                <CirclePlus />  New Task
              </button>
            </div>
            <hr />
          </div>
          {loading ? (
            <p className="loading">Loading tasks...</p>
          ) : (
            <div>
              <div className="task_header">

              </div>

              <ul className="task_list">
                {tasks.length === 0 ? (
                  <span className="no_tasks">
                    <p>No tasks yet. Add some</p>
                  </span>
                ) : (
                  tasks.map((task) => (
                    <li key={task.id}>
                      <div className="title_section">
                        <div className="row_1">
                          <div className="grip_icon">
                            <GripVertical size="24" />
                          </div>
                          <input type="checkbox" title="Mark done" checked={task.completed} readOnly/>
                          <div className="task_label" onClick={() => handleShowTaskPopup(task)} >
                            <span className="title_view">
                              {task.title.length > 50
                                ? `${task.title.substring(0, 50)}...`
                                : task.title}
                            </span>
                          </div>
                        </div>
                        
                        <div className="manipulators row_2">
                          <button
                            title="edit"
                            onClick={() => handleShowTaskPopup(task)}
                          >
                            <PencilLine />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            title="delete"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Popup for Creating New Task */}
      {showPopup && (
        <div className="popup_overlay">
          <div className="popup_card">
            <button className="popup_close_top" type="button" onClick={() => setShowPopup(false)}>
              <X />
            </button>
            <div className="heading">
              <BadgePlus size={24} />
              <h2>Create Task</h2>
            </div>
            <hr />
            <form onSubmit={handleAddTask}>
              <div className="mini_input_container">
                <input type="text" name="title" placeholder="Enter task title" value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                autoFocus/>
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
                <button type="submit" className="save_btn">
                  Save Task
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup for Viewing/Editing a Task */}
      {showTaskPopup && selectedTask && (
        <div className="popup_overlay">
          <div className="popup_card">
            <button className="popup_close_top" type="button" onClick={() => setShowTaskPopup(false)}>
              <X />
            </button>
            <div className="heading">
              <PencilLine size={24} />
              <h2>Task Details</h2>
              <div className="close">
                
              </div>
            </div>
            <hr />
            <div className="divider">

              {/* Div 1 */}
              <section className="edit_section">
                <div className="activity_box">
                  <div className="activity_box_header">
                    <p>Title:</p>
                    <h4>{selectedTask.title}</h4>
                  </div>
                  <div className="activity_box_description">
                    <p>Description:</p>
                    <h4>
                      {selectedTask.description
                        ? selectedTask.description
                        : "No description"}
                    </h4>
                  </div>
                </div>
                <form onSubmit={handleUpdateTask}>
                  <div className="mini_input_container">
                    <input
                      type="text"
                      value={selectedTask.title}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                <div className="mini_input_container">
                  <textarea value={selectedTask.description} onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div className="popup_buttons">
                  <div className="check">
                    <input type="checkbox" name="done" id="done" title="Mark done"/>
                    <label htmlFor="done">Mark done</label>
                  </div>
                  
                  <div className="check">
                    <input type="checkbox" name="pending" id="pending" title="pending"/>
                    <label htmlFor="pending">Mark pending</label>
                  </div>

                  {/* <button type="submit" > </button> */}
                  <Button 
                    className="save_btn"
                    disabled={loading}
                    type="submit" 
                  >
                    {loading ? (
                    <>
                      <Spinner className="text-white" /> Saving ...
                    </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
              </section>

              {/* Div 2 */}
              <div className="task_activity">
              {(() => {
                const createdAt = selectedTask.created_at
                  ? new Date(selectedTask.created_at)
                  : new Date();
                const formattedDate = createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = createdAt.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const weekday = createdAt.toLocaleDateString("en-US", {
                  weekday: "long",
                });

                return (
                  <>
                    <div className="task_date">
                      <p className="added_on">
                        Added on {formattedDate} {formattedTime}
                      </p>
                      <p className="day_info">
                        {formattedDate} {weekday}
                      </p>
                      <p className="task_status">
                        Status: 
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            </div>            
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
