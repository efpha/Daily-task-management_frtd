import React, { useState, useEffect } from "react";
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
  LogOut,
} from "lucide-react";
import task_handler from "../task_handler.js";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

// Fetch all tasks
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await task_handler.fetchAllTasks();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);


  //create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createdTask = await task_handler.createTask(newTask);
      setTasks((prev) => [createdTask, ...prev]);
      setNewTask({ title: "", description: "" });
      setShowPopup(false);
    } catch (err) {
      console.log("Task creation failed:", err);
    } finally {
      setLoading(false);
    }
  };


//delete task
const handleTaskDelete = async (id) => {
  try {
    await task_handler.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id))
  } catch (err) {
    console.log("Error while deleting task: ", err)
  }
}

// Update tasks
const handleUpdateTask = async (taskId) => {
  const updatedTask = {
    title: selectedTask.title,
    description: selectedTask.description,
    completed: selectedTask.completed,
  };

  try {
    const updated = await task_handler.updateTask(taskId, updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
    );
    setShowTaskPopup(false);
    console.log("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error);
  }
};


  const toggleCompleted = () => {
    setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const formatWeekday = (date) => new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full z-50 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl 
        ${sidebarOpen ? "w-64" : "w-0 md:w-64"} overflow-hidden`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold whitespace-nowrap">TaskFlow</h1>
            <button onClick={() => setSidebarOpen(false)} className="hover:bg-slate-700 p-1 rounded transition md:hidden">
              <PanelLeftClose size={20} />
            </button>
          </div>

          <button
            onClick={() => setShowPopup(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg font-medium transition transform hover:scale-105 mb-4"
          >
            <CirclePlus size={20} /> Add Task
          </button>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 py-2">Filters</p>
            <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium">
              All Tasks <span className="text-xs bg-slate-700 px-2 py-1 rounded ml-2">{tasks.length}</span>
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition">
              Pending <span className="text-xs bg-slate-700 px-2 py-1 rounded ml-2">{pendingCount}</span>
            </button>
            <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition">
              Completed <span className="text-xs bg-slate-700 px-2 py-1 rounded ml-2">{completedCount}</span>
            </button>
          </nav>

          <button className="mt-auto w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg font-medium transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition md:hidden"
        >
          <PanelRightClose size={20} />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Tasks</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {tasks.length} total tasks • {completedCount} completed
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 sm:px-6 rounded-lg font-medium transition transform hover:scale-105"
            >
              <CirclePlus size={20} /> New Task
            </button>
          </header>

          {/* Tasks Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
            {tasks.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <NotebookTabs size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">No tasks yet. Create one to get started</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setShowTaskPopup(true) || setSelectedTask(task)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-5 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    task.completed ? "border-green-200 bg-green-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 w-70">
                    <p className={`font-medium truncate ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{task.description || "No description"}</p>
                  </div>

                  <div className="flex gap-2 sm:self-center mt-2 sm:mt-0 ">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        setSelectedTask(task);
                        setShowTaskPopup(true); // just show popup
                      }}
                      className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition"
                    >
                      <PencilLine size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskDelete(task.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Create Task Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[.1px] flex items-center justify-center p-2 sm:p-4 z-99">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BadgePlus className="text-blue-600" /> Create Task
              </h2>
              <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-gray-700 transition">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition transform hover:scale-105"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Task Details Modal */}
      {showTaskPopup && selectedTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[.01px] flex items-center justify-center p-2 sm:p-4 z-99">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <PencilLine size={24} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
              </div>
              <button onClick={() => setShowTaskPopup(false)} className="text-gray-500 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Activity Section */}
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Added on</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedTask.created_at)} {formatTime(selectedTask.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Date</p>
                    <p className="font-medium text-gray-900">{formatWeekday(selectedTask.created_at)}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                    <p className={`font-semibold text-lg ${selectedTask.completed ? "text-green-600" : "text-amber-600"}`}>
                      {selectedTask.completed ? "✓ Completed" : "⟳ Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Section */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Current Title</p>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h4>
                  <p className="text-sm text-gray-600 mt-3 mb-1">Current Description</p>
                  <h4 className="text-gray-700">{selectedTask.description || "No description"}</h4>
                </div>

                <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateTask(selectedTask.id);
                    }}
                    className="space-y-4"
                  >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edit Title</label>
                    <input 
                      type="text" 
                      value={selectedTask.title}
                      onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edit Description</label>
                    <textarea 
                      value={selectedTask.description}
                      onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
                      rows="4"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <input 
                        type="checkbox" 
                        checked={selectedTask.completed}
                        onChange={toggleCompleted}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Mark as completed</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowTaskPopup(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition transform hover:scale-105">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
