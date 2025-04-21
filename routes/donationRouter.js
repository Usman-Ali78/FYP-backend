const express = require("express");
const donationRouter = express.Router();
const donationController = require("../controller/donationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply authentication to all routes
donationRouter.use(authMiddleware);

// Public: Get all donations (filter by ?status=Available)
donationRouter.get("/", donationController.getAllDonations);

// Public: Get donation by ID
donationRouter.get("/:id", donationController.getDonationById);

// Restaurant: Create a donation
donationRouter.post(
  "/",
  roleMiddleware(["restaurant"]),
  donationController.createDonation
);

// NGO: Claim a donation
donationRouter.put(
  "/:id/claim",
  roleMiddleware(["NGO"]),
  donationController.claimDonation
);

// Admin: Update donation status (Approve/Reject/Deliver)
donationRouter.put(
  "/:id/status",
  roleMiddleware(["Admin"]),
  donationController.updateDonationStatus
);

// Admin or Donor: Delete a donation
donationRouter.delete(
  "/:id",
  roleMiddleware(["admin", "restaurant"]), // Middleware checks if user is donor
  donationController.deleteDonation
);

exports.donationRouter = donationRouter;