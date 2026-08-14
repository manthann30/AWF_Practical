const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = 5000;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Content-Type middleware
app.use((req, res, next) => {
    if (
        (req.method === "POST" || req.method === "PUT") &&
        !req.is("application/json")
    ) {
        return res.status(400).json({
            error: "Content-Type must be application/json"
        });
    }

    next();
});

// GET all tasks
app.get("/tasks", async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

// GET task by ID
app.get("/tasks/:id", async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// POST create task
app.post("/tasks", async (req, res, next) => {
    try {
        const task = await Task.create(req.body);

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

// PUT update task
app.put("/tasks/:id", async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE task
app.delete("/tasks/:id", async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully",
            task: task
        });
    } catch (err) {
        next(err);
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.message);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: "Validation failed",
            details: Object.values(err.errors).map(
                (error) => error.message
            )
        });
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        return res.status(400).json({
            error: "Invalid task ID"
        });
    }

    res.status(500).json({
        error: "Something went wrong"
    });
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });