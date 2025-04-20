const express = require("express");
const donationRouter = express.Router();
const donationController = require("../controller/donationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply authentication middleware to all donation routes
donationRouter.use(authMiddleware);

// Get all donations
donationRouter.get("/", donationController.getAllDonations);

// Get a specific donation
donationRouter.get("/:id", donationController.getDonationById);

// Create a new donation
donationRouter.post(
  "/",
  roleMiddleware(["Donor", "Admin"]), // Adjust roles as per your user types
  donationController.createDonation
);

// Update donation status (only accessible to Admins)
donationRouter.put(
  "/:id/status",
  roleMiddleware(["Admin"]),
  donationController.updateDonationStatus
);

// Delete a donation (only accessible to Admins or the donor who created it)
donationRouter.delete(
  "/:id",
  roleMiddleware(["Admin"]), // You might want custom middleware to allow donor to delete their own donations
  donationController.deleteDonation
);

module.exports = donationRouter;