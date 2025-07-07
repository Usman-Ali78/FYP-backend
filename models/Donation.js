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
      trim: true,
      minlength: 2,
      maxlength: 100,
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    unit: {
      type: String,
      enum: [
        "kg",
        "litre",
        "pieces",
        "packets",
        "boxes",
        "bottles",
        "grams",
        "other",
      ],
      required: true,
    },
    expiry_time: {
      type: Date,
      required: true,
    },
    pickup_address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "claimed", "delivered", "expired", "pending_pickup"],
      default: "available",
    },
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto‑delete once expiry_time passes
donationSchema.index({ expiry_time: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Donation", donationSchema);
