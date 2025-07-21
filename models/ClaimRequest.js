const mongoose = require("mongoose");

const claimRequestSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donation",
    required: true,
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "delivered"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  }
},
 {timestamps:true}
);

module.exports = mongoose.model("ClaimRequest", claimRequestSchema);
