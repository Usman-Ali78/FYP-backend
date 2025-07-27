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
exports.blockUser = async (req, res) => {
  const { id } = req.params;
  const { block } = req.body;

  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  user.blocked = block;
  await user.save();

  res.json({ 
    success: true, 
    message: `User ${block ? "blocked" : "unblocked"}`,
    data: { userId: id, blocked: user.blocked }
  });
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