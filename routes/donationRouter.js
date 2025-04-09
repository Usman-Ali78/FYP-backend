const express = require("express");
const donationRouter = express.Router();
const donationController = require("../controller/donationController");

donationRouter.get("/", donationController.getAllDonations);
donationRouter.get("/:id", donationController.getDonationById);
donationRouter.post("/", donationController.createDonation);
donationRouter.put("/:id/status", donationController.updateDonationStatus);
donationRouter.delete("/:id", donationController.deleteDonation);

module.exports = donationRouter;
