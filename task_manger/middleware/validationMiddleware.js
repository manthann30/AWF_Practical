const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation and sanitization for Registration
const validateRegister = (req, res, next) => {
    let { name, email, password } = req.body || {};
    const errors = [];

    // Sanitize
    if (typeof name === "string") name = name.trim();
    if (typeof email === "string") email = email.trim().toLowerCase();

    // Validate Name
    if (!name || typeof name !== "string" || name.length === 0) {
        errors.push("Name is required");
    }

    // Validate Email
    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    } else if (!emailRegex.test(email)) {
        errors.push("Email must be a valid email format");
    }

    // Validate Password
    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors
        });
    }

    req.body.name = name;
    req.body.email = email;
    next();
};

// Validation and sanitization for Login
const validateLogin = (req, res, next) => {
    let { email, password } = req.body || {};
    const errors = [];

    if (typeof email === "string") email = email.trim().toLowerCase();

    // Validate Email
    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    } else if (!emailRegex.test(email)) {
        errors.push("Email must be a valid email format");
    }

    // Validate Password
    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors
        });
    }

    req.body.email = email;
    next();
};

// Validation and sanitization for Task Creation
const validateTask = (req, res, next) => {
    let { title, description, priority } = req.body || {};
    const errors = [];

    if (typeof title === "string") title = title.trim();
    if (typeof description === "string") description = description.trim();

    // Validate Title
    if (!title || typeof title !== "string" || title.length === 0) {
        errors.push("Task title is required");
    } else if (title.length > 200) {
        errors.push("Task title must be under 200 characters");
    }

    // Validate Description
    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push("Task description must be a string");
    }

    // Validate Priority
    if (priority && !["low", "medium", "high"].includes(priority)) {
        errors.push("Priority must be low, medium, or high");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors
        });
    }

    req.body.title = title;
    if (description !== undefined) req.body.description = description;
    next();
};

// Validation and sanitization for Task Update
const validateTaskUpdate = (req, res, next) => {
    let { title, description, priority, completed } = req.body || {};
    const errors = [];

    if (title !== undefined) {
        if (typeof title === "string") title = title.trim();
        if (typeof title !== "string" || title.length === 0) {
            errors.push("Task title cannot be empty");
        } else if (title.length > 200) {
            errors.push("Task title must be under 200 characters");
        }
        req.body.title = title;
    }

    if (description !== undefined) {
        if (typeof description === "string") description = description.trim();
        if (description !== null && typeof description !== "string") {
            errors.push("Task description must be a string");
        }
        req.body.description = description;
    }

    if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
        errors.push("Priority must be low, medium, or high");
    }

    if (completed !== undefined && typeof completed !== "boolean") {
        errors.push("Completed status must be a boolean");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateTask,
    validateTaskUpdate
};
