const express = require("express");
const donationRouter = express.Router();
const donationController = require("../controller/donationController");
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
)



// Get donation by ID
donationRouter.get("/:id", donationController.getDonationById);

//Claim a donation
donationRouter.put(
  "/:id/claim",
  roleMiddleware(["ngo"]),
  donationController.claimDonation
);

// Admin: Update donation status
donationRouter.put(
  "/:id/status",
  roleMiddleware(["admin"]),
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


exports.donationRouter = donationRouter;