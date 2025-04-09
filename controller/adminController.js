const User = require("../models/User");
const Donation = require("../models/Donation");

// Get all NGOs (for Admin)
exports.getNgo = async (req, res) => {
  try {
    const ngos = await User.find({ role: "ngo" });
    res.status(200).json(ngos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching NGOs", error });
  }
};

// Get all users for admin dashboard
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Block/Unblock a user
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.blocked = !user.blocked;
    await user.save();
    res.status(200).json({ message: `User ${user.blocked ? "Blocked" : "Unblocked"}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
};

// Get all donations
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

// Approve or Reject a donation
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = status;
    await donation.save();
    res.status(200).json({ message: `Donation ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating donation status", error });
  }
};
