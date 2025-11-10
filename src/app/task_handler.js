import api from "../axiosConfig.js";

const getToken = () => localStorage.getItem("accessToken");

const task_handler = {
  /**
   * Fetch all tasks for the current user
   * @returns {Promise<Array>} Array of task objects
   */
  fetchAllTasks: async () => {
    try {
      const token = getToken();
      const response = await api.get("tasks/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data object
   * @param {string} taskData.title - Task title (required)
   * @param {string} taskData.description - Task description (optional)
   * @returns {Promise<Object>} Created task object
   */
  createTask: async (taskData) => {
    try {
      const token = getToken();
      const response = await api.post(
        "tasks/create/",
        {
          title: taskData.title,
          description: taskData.description || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param {number|string} taskId - Task ID to update
   * @param {Object} taskData - Updated task data
   */
  updateTask: async (taskId, taskData) => {
    try {
      const token = getToken();
      const response = await api.put(
        `tasks/update/${taskId}/`,
        {
          title: taskData.title,
          description: taskData.description,
          completed: taskData.completed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  /**
   * Delete a task by ID
   * @param {number|string} taskId - Task ID to delete
   */
  deleteTask: async (taskId) => {
    try {
      const token = getToken();
      const response = await api.delete(`tasks/delete/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  /**
   * Toggle task completion status (helper)
   * @param {number|string} taskId - Task ID
   * @param {boolean} completed - Current completion status
   */
  toggleTaskCompletion: async (taskId, completed) => {
    try {
      const token = getToken();
      const response = await api.put(
        `tasks/update/${taskId}/`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  },

  /**
   * Mark a task as completed
   * @param {number|string} taskId - Task ID to mark as complete
   * @returns {Promise<Object>} Updated task
   */

  // 
  handleMarkComplete: async (taskId) => {
    try {
      const token = getToken();
      const response = await api.patch(
        `tasks/complete/${taskId}/`,
        {}, // no body needed
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking task as completed:", error.response?.data || error.message);
      throw error;
    }
  },


  /**
   * Get a single task by ID
   */
  getTaskById: async (taskId) => {
    try {
      const token = getToken();
      const response = await api.get(`tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  },
};

export default task_handler;
