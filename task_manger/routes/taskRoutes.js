const express = require("express");
const Task = require("../models/task");
const authMiddleware = require("../middleware/authMiddleware");
const { validateTask, validateTaskUpdate } = require("../middleware/validationMiddleware");

const router = express.Router();

// All task routes are protected with authMiddleware
router.use(authMiddleware);

// GET /tasks - Read only the authenticated user's tasks
router.get("/", async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

// GET /tasks/:id - Read single task by ID if owned by user
router.get("/:id", async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                status: 404,
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// POST /tasks - Create task attached to the authenticated user
router.post("/", validateTask, async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id - Update task only if owned by authenticated user
router.put("/:id", validateTaskUpdate, async (req, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                status: 404,
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id - Delete task only if owned by authenticated user
router.delete("/:id", async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                status: 404,
                message: "Task not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Task deleted successfully",
            task
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
