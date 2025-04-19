// const mongoose = require("mongoose");

// const donationSchema = new mongoose.Schema({
//   donor: { type: String, required: true },
//   item: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
//   date: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Donation", donationSchema);

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
      minLength:2,
      maxLength:100
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
