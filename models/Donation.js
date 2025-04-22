const mongoose = require("mongoose");
const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    expiry_time: {  // Critical for food safety!
      type: Date,
      required: true,
    },
    pickup_address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Claimed", "Delivered", "Expired"],
      default: "Available",
    },
    ngo_id: {  // Track which NGO claimed it
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Doantion", donationSchema)