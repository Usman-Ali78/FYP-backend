// controllers/reviewController.js
const Review = require("../models/Review");
const Donation = require("../models/Donation");

exports.addReview = async (req, res) => {
  const { donationId } = req.params;
  const { rating, comment } = req.body;
  const ngoId = req.user.id; // NGO from JWT

  try {
    const donation = await Donation.findById(donationId);
    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Review allowed only after delivery" });
    }

    if (!donation.ngo_id || donation.ngo_id.toString() !== ngoId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to review this donation" });
    }

    // create review
    const review = await Review.create({
      donation: donationId,
      ngo: ngoId,
      restaurant: donation.donor,
      rating,
      comment,
    });

    res.json({ success: true, message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get reviews for a restaurant
exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("ngo", "ngo_name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin view all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("ngo", "ngo_name email")
      .populate("restaurant", "restaurant_name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
