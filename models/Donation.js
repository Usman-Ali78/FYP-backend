const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", donationSchema);