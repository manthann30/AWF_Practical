import React, { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import ToastContainer from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for creating a new task
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  // Edit task modal/state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editCompleted, setEditCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [filterPriority, setFilterPriority] = useState("all"); // all, low, medium, high

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tasks from server");
      addToast(err.message || "Error loading tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast("Please enter a task title", "error");
      return;
    }

    setSubmitting(true);
    try {
      const newTask = await createTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        completed: false,
      });

      setTasks((prev) => [newTask, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      addToast("Task created successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to create task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Complete
  const handleToggleComplete = async (task) => {
    const originalTasks = [...tasks];
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      const updated = await updateTask(task._id, {
        completed: !task.completed,
      });
      // Sync back response
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? updated : t))
      );
      addToast(
        updated.completed
          ? "Task marked as completed!"
          : "Task marked as active",
        "success"
      );
    } catch (err) {
      // Rollback on error
      setTasks(originalTasks);
      addToast(err.message || "Failed to update task status", "error");
    }
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditCompleted(task.completed || false);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      addToast("Task title cannot be empty", "error");
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateTask(editingTask._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        completed: editCompleted,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? updated : t))
      );
      setEditingTask(null);
      addToast("Task updated successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to update task", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Trigger Delete Confirmation Modal
  const promptDelete = (task) => {
    setDeletingTask(task);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    setIsDeleting(true);
    try {
      await deleteTask(deletingTask._id);
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      addToast("Task deleted successfully!", "success");
      setDeletingTask(null);
    } catch (err) {
      addToast(err.message || "Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "completed"
        ? task.completed
        : !task.completed;

    const matchesPriority =
      filterPriority === "all" ? true : task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="tasks-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Practical 6 Header / Badge */}
      <section className="tasks-hero-card">
        <div className="card-header-row">
          <div>
            <h2>Task Manager</h2>
            <p className="subtitle">
              Practical 6: Full Stack Integration (React + Node.js + Express + MongoDB)
            </p>
          </div>
          <div className="stats-badges">
            <span className="stat-pill total">Total: {tasks.length}</span>
            <span className="stat-pill active">Pending: {pendingCount}</span>
            <span className="stat-pill completed">Completed: {completedCount}</span>
          </div>
        </div>
      </section>

      {/* Create Task Form */}
      <section className="task-form-card">
        <h3>Create New Task</h3>
        <form onSubmit={handleCreateTask} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Complete Practical 6 integration..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Provide additional details or notes..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="custom-select"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                disabled={submitting}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group form-group-half form-btn-container">
              <button
                type="submit"
                id="create-task-btn"
                className="submit-task-btn"
                disabled={submitting}
              >
                {submitting ? "Adding Task..." : "+ Add Task"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Filter and Search Bar */}
      <section className="task-controls-card">
        <div className="controls-row">
          <div className="search-box">
            <input
              type="text"
              id="task-search-input"
              placeholder="🔍 Search tasks by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              id="status-filter"
              className="custom-select filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              id="priority-filter"
              className="custom-select filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </section>

      {/* Task List Section */}
      <section className="task-list-card">
        <div className="task-list-header">
          <h3>
            Tasks List ({filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"})
          </h3>
          <button
            type="button"
            className="secondary refresh-btn"
            onClick={fetchTasks}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-notice loading-notice">
            <div className="spinner"></div>
            <p>Loading tasks from MongoDB server...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-notice error-notice">
            <p>
              <strong>Connection Error:</strong> {error}
            </p>
            <p>
              Make sure the backend server is running on{" "}
              <code>http://localhost:5000</code> and MongoDB is active.
            </p>
            <button type="button" onClick={fetchTasks} className="retry-btn">
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="state-notice empty-notice">
            <p>
              {tasks.length === 0
                ? "No tasks found in MongoDB. Create your first task using the form above!"
                : "No tasks match your search and filter criteria."}
            </p>
          </div>
        )}

        {/* Task Items List */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="task-items-container">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-item-card ${
                  task.completed ? "task-completed" : ""
                } priority-${task.priority || "medium"}`}
              >
                <div className="task-item-left">
                  <input
                    type="checkbox"
                    id={`checkbox-${task._id}`}
                    className="task-checkbox"
                    checked={Boolean(task.completed)}
                    onChange={() => handleToggleComplete(task)}
                    title={
                      task.completed
                        ? "Mark as pending"
                        : "Mark as completed"
                    }
                  />
                  <div className="task-details">
                    <div className="task-title-row">
                      <h4 className="task-title">{task.title}</h4>
                      <span
                        className={`priority-tag priority-tag-${
                          task.priority || "medium"
                        }`}
                      >
                        {task.priority || "medium"}
                      </span>
                      {task.completed && (
                        <span className="badge-completed">✓ Done</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <small className="task-date">
                      Created:{" "}
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Recently"}
                    </small>
                  </div>
                </div>

                <div className="task-item-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => handleOpenEdit(task)}
                    title="Edit task"
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={() => promptDelete(task)}
                    title="Delete task"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => !updating && setEditingTask(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h3>Edit Task</h3>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Task Title *</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    disabled={updating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={updating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-priority">Priority</label>
                  <select
                    id="edit-priority"
                    className="custom-select"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    disabled={updating}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="form-group checkbox-form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editCompleted}
                      onChange={(e) => setEditCompleted(e.target.checked)}
                      disabled={updating}
                    />
                    <span>Mark as completed</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary modal-btn"
                  onClick={() => setEditingTask(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Confirm Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to delete "${deletingTask.title}"? This will permanently remove it from MongoDB.`
            : ""
        }
        confirmText="Delete Task"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeletingTask(null)}
      />
    </div>
  );
}
