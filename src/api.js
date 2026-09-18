const BASE_URL = 'http://localhost:5000';

/**
 * Fetch all tasks
 * @returns {Promise<Array>} Array of task objects
 */
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) {
    let errorMsg = `Failed to fetch tasks (Status ${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Fetch a single task by ID
 * @param {string} id 
 * @returns {Promise<Object>} Task object
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`);
  if (!response.ok) {
    let errorMsg = `Failed to fetch task (Status ${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Create a new task
 * @param {Object} task - { title, description, priority, completed }
 * @returns {Promise<Object>} Created task object
 */
export async function createTask(task) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    let errorMsg = `Failed to create task (Status ${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
      if (data && data.details) errorMsg += `: ${data.details.join(', ')}`;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Update an existing task by ID
 * @param {string} id - Task ID
 * @param {Object} task - Partial or complete updated task fields
 * @returns {Promise<Object>} Updated task object
 */
export async function updateTask(id, task) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    let errorMsg = `Failed to update task (Status ${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
      if (data && data.details) errorMsg += `: ${data.details.join(', ')}`;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Delete a task by ID
 * @param {string} id - Task ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMsg = `Failed to delete task (Status ${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
