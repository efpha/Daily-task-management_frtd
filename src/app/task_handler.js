import api from "../axiosConfig.js";

const getToken = () => localStorage.getItem("accessToken");

/**
 * Parse structured metadata (priority, category, clean description) from task object
 */
export const parseTaskMetadata = (task) => {
  if (!task) return task;
  let description = task.description || "";
  let priority = "medium";
  let category = "Work";

  const priorityMatch = description.match(/\[Priority:\s*(high|medium|low)\]/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase();
    description = description.replace(priorityMatch[0], "");
  }

  const categoryMatch = description.match(/\[Category:\s*([\w\s]+)\]/i);
  if (categoryMatch) {
    category = categoryMatch[1].trim();
    description = description.replace(categoryMatch[0], "");
  }

  description = description.trim();

  return {
    ...task,
    cleanDescription: description,
    priority,
    category,
    due_date: task.due_date || null,
  };
};

/**
 * Format description string containing metadata markers for Priority and Category
 */
export const formatTaskDescription = (description, priority = "medium", category = "Work") => {
  const metaParts = [];
  if (priority) metaParts.push(`[Priority: ${priority}]`);
  if (category) metaParts.push(`[Category: ${category}]`);
  const metaString = metaParts.join(" ");
  const cleanDesc = (description || "").trim();
  return metaString ? `${metaString} ${cleanDesc}`.trim() : cleanDesc;
};

const task_handler = {
  /**
   * Fetch all tasks for the current user and parse metadata
   */
  fetchAllTasks: async () => {
    try {
      const token = getToken();
      const response = await api.get("tasks/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasks = Array.isArray(response.data) ? response.data : [];
      return tasks.map(parseTaskMetadata);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  /**
   * Create a new task with metadata (priority, category, due_date, status)
   */
  createTask: async (taskData) => {
    try {
      const token = getToken();
      const formattedDescription = formatTaskDescription(
        taskData.description,
        taskData.priority || "medium",
        taskData.category || "Work"
      );

      const payload = {
        title: taskData.title,
        description: formattedDescription,
        status: taskData.status || "pending",
      };

      if (taskData.due_date) {
        payload.due_date = taskData.due_date;
      }

      const response = await api.post("tasks/create/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return parseTaskMetadata(response.data);
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update an existing task
   */
  updateTask: async (taskId, taskData) => {
    try {
      const token = getToken();
      const formattedDescription = formatTaskDescription(
        taskData.description,
        taskData.priority || "medium",
        taskData.category || "Work"
      );

      const payload = {
        title: taskData.title,
        description: formattedDescription,
        status: taskData.status || "pending",
      };

      if (taskData.due_date !== undefined) {
        payload.due_date = taskData.due_date;
      }

      const response = await api.put(`tasks/update/${taskId}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return parseTaskMetadata(response.data);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  /**
   * Delete a task by ID
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
   * Mark a task as completed
   */
  handleMarkComplete: async (taskId) => {
    try {
      const token = getToken();
      const response = await api.patch(
        `tasks/complete/${taskId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return parseTaskMetadata(response.data);
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
      return parseTaskMetadata(response.data);
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  },
};

export default task_handler;
