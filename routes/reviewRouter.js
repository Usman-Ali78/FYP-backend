const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 👉 NGO adds review (after delivery)
router.post(
  "/donations/:donationId",
  authMiddleware, // only logged-in NGO
  // roleMiddleware(["ngo"]),
  reviewController.addReview
);

// 👉 Restaurant views their reviews
router.get(
  "/restaurants/:restaurantId",
  authMiddleware, // logged in user (restaurant or admin)
  // roleMiddleware(["restaurant"]),
  reviewController.getRestaurantReviews
);

// 👉 Admin views all reviews
router.get(
  "/all",
  authMiddleware,
  // roleMiddleware(["admin"]),
  reviewController.getAllReviews
);

module.exports = router;
