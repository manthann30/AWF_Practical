const BASE_URL = 'http://localhost:5000';

// Token Storage Helpers
export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function removeToken() {
  localStorage.removeItem('token');
}

// Global 401 listener for frontend state sync
let onUnauthorizedCallback = null;

export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

function handleAuthFailure() {
  removeToken();
  if (typeof onUnauthorizedCallback === 'function') {
    onUnauthorizedCallback();
  }
}

/**
 * Helper to build auth headers
 */
function getAuthHeaders(includeContentType = true) {
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>}
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || `Registration failed (Status ${response.status})`;
    if (data.errors && Array.isArray(data.errors)) {
      errorMsg = data.errors.join('. ');
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Login user and receive JWT
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { token, user, message }
 */
export async function loginUser(credentials) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || `Login failed (Status ${response.status})`;
    if (data.errors && Array.isArray(data.errors)) {
      errorMsg = data.errors.join('. ');
    }
    throw new Error(errorMsg);
  }

  if (data.token) {
    setToken(data.token);
  }

  return data;
}

/**
 * Fetch authenticated user profile
 * @returns {Promise<Object>} - { id, name, email }
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders(false),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch user profile (Status ${response.status})`);
  }

  return data;
}

/**
 * Fetch tasks for authenticated user
 * @returns {Promise<Array>}
 */
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: getAuthHeaders(false),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || `Failed to fetch tasks (Status ${response.status})`;
    if (data.errors && Array.isArray(data.errors)) {
      errorMsg = data.errors.join('. ');
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Fetch single task by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders(false),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch task (Status ${response.status})`);
  }

  return data;
}

/**
 * Create a new task (attached to authenticated user)
 * @param {Object} task - { title, description, priority, completed }
 * @returns {Promise<Object>}
 */
export async function createTask(task) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(task),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || `Failed to create task (Status ${response.status})`;
    if (data.errors && Array.isArray(data.errors)) {
      errorMsg = data.errors.join('. ');
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Update a task owned by authenticated user
 * @param {string} id 
 * @param {Object} task 
 * @returns {Promise<Object>}
 */
export async function updateTask(id, task) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(task),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || `Failed to update task (Status ${response.status})`;
    if (data.errors && Array.isArray(data.errors)) {
      errorMsg = data.errors.join('. ');
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Delete a task owned by authenticated user
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
  });

  if (response.status === 401) {
    handleAuthFailure();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to delete task (Status ${response.status})`);
  }

  return data;
}

export default {
  getToken,
  setToken,
  removeToken,
  setOnUnauthorized,
  registerUser,
  loginUser,
  getCurrentUser,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
