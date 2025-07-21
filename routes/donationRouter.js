const express = require("express");
const donationRouter = express.Router();
const donationController = require("../controller/donationController");
const claimRequestController = require("../controller/claimRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply authentication to all routes
donationRouter.use(authMiddleware);

// Restaurant: Create a donation
donationRouter.post(
  "/",
  roleMiddleware(["restaurant"]),
  donationController.createDonation
);

//Get all donations
donationRouter.get("/", donationController.getAllDonations);

donationRouter.get(
  "/my-total",
  roleMiddleware(["restaurant"]),
  donationController.getTotalDonations
);

// NGO: View their own claim requests
donationRouter.get(
  "/my-claims",
  // authMiddleware,
  // roleMiddleware(["ngo"]),
  claimRequestController.getMyClaims
);

// Get donation by ID
donationRouter.get("/:id", donationController.getDonationById);


// Admin: Update donation status
donationRouter.put(
  "/:id/status",
  roleMiddleware(["admin, restaurant"]),
  donationController.updateDonationStatus
);

// Admin or Donor: Delete a donation
donationRouter.delete(
  "/:id",
  roleMiddleware(["admin", "restaurant"]),
  donationController.deleteDonation
);

//edit donation
donationRouter.put(
  "/:id/edit",
  roleMiddleware(["restaurant"]),
  donationController.editDonation
);

// NGO: Claim a donation
donationRouter.post(
  "/:id/claim-request",
  roleMiddleware(["ngo"]),
  claimRequestController.createClaimRequest
);

// Donor: View claim requests for a donation
donationRouter.get(
  "/:id/claims",
  roleMiddleware(["restaurant"]),
  claimRequestController.getDonationClaims
);

// Donor: Approve a specific NGO claim request
donationRouter.put(
  "/claims/:claimId/approve",
  roleMiddleware(["restaurant"]),
  claimRequestController.approveClaimRequest
);

//Donor: Rejects a specific ngo claim donation
donationRouter.put(
  "/claims/:claimId/reject",
  roleMiddleware(["restaurant"]),
  claimRequestController.rejectClaimRequest
);

donationRouter.put(
  "/:id/delivered",
  roleMiddleware(["ngo"]),
  claimRequestController.markDelivered
);

exports.donationRouter = donationRouter;
