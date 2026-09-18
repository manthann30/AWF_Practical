const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");

const router = express.Router();

// POST /register (or /auth/register)
router.post("/register", validateRegister, async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            status: 201,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST /login (or /auth/login)
router.post("/login", validateLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Invalid email or password"
            });
        }

        // Compare password hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token (expires in 1h)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: 200,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /me (or /auth/me) - Protected profile endpoint
router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
