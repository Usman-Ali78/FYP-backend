const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controller/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect Admin Routes
adminRouter.use(authMiddleware, roleMiddleware(["admin"]));

// Users Management
adminRouter.get("/users", adminController.getUsers);
adminRouter.put("/users/:id/block", adminController.toggleBlockUser);

// Donations Management
adminRouter.get("/donations", adminController.getDonations);
adminRouter.put("/donations/:id/status", adminController.updateDonationStatus);

exports.adminRouter= adminRouter;
