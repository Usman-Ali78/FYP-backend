const express = require("express");
const authRouter = express.Router();
const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Signup Route
authRouter.post("/signup", authController.signup);

// Login Route
authRouter.post("/login", authController.login);

// Update Password Route (Protected)
authRouter.put("/update-password", authMiddleware, authController.updatePassword);

//forgot password
authRouter.post("/forgot-password", authController.forgotPassword);

//reset password
authRouter.post("/reset-password", authController.resetPassword);

exports.authRouter = authRouter;