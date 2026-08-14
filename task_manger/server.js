const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// JSON validation middleware
app.use((req, res, next) => {
    if ((req.method === "POST" || req.method === "PUT") &&
        !req.is("application/json")) {
        return res.status(400).json({
            error: "Content-Type must be application/json"
        });
    }
    next();
});

// In-memory tasks
let tasks = [
    { id: 1, title: "Complete React Practical", completed: false },
    { id: 2, title: "Learn Express.js", completed: false }
];

// GET all tasks
app.get("/tasks", (req, res) => {
    res.status(200).json(tasks);
});

// POST create task
app.post("/tasks", (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
        title: title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find((task) => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, completed } = req.body;

    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;

    res.status(200).json(task);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const deletedTask = tasks.splice(index, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: "Something went wrong"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});