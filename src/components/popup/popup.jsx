import React, { useState } from "react";

const TaskPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [task, setTask] = useState({ title: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    setTask({ title: "", description: "" });
    alert("Task deleted!");
  };

  return (
    <div className="popup-container">
      <button className="add-task-btn" onClick={() => setShowPopup(true)}>
        Add Task
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h2>Add New Task</h2>
            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={task.title}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              placeholder="Enter task description"
              value={task.description}
              onChange={handleInputChange}
            ></textarea>

            <div className="popup-buttons">
              <button className="delete-btn" onClick={handleDelete}>
                Delete Task
              </button>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPopup;
