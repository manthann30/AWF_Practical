const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Pipeline
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Content-Type validation middleware for mutation requests
app.use((req, res, next) => {
    if (
        (req.method === "POST" || req.method === "PUT") &&
        !req.is("application/json")
    ) {
        return res.status(400).json({
            status: 400,
            message: "Content-Type must be application/json"
        });
    }
    next();
});

// Mount Routes
// Support both direct paths (/register, /login, /me) and prefixed (/auth/register, /auth/login, /auth/me)
app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// 404 Catch-All Handler
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: "Route not found"
    });
});

// Centralized Consistent Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.name || "Error"}: ${err.message}`);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: Object.values(err.errors).map((error) => error.message)
        });
    }

    // Invalid MongoDB ObjectId (CastError)
    if (err.name === "CastError") {
        return res.status(400).json({
            status: 400,
            message: "Invalid ID format"
        });
    }

    // Duplicate key error (e.g. unique email)
    if (err.code === 11000) {
        return res.status(400).json({
            status: 400,
            message: "Email is already registered"
        });
    }

    // JSON syntax error
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            status: 400,
            message: "Malformed JSON payload"
        });
    }

    // Generic Internal Server Error without leaking internal stack traces
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        status: statusCode,
        message: err.message || "Internal server error"
    });
});

// Connect to MongoDB & Start Server
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/task_manager";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });