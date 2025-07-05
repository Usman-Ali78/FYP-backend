const Donation = require("../models/Donation");

// Create a new donation (Restaurant only)
exports.createDonation = async (req, res) => {
  try {
    const {item, quantity, expiry_time, pickup_address } = req.body;
    
    // Validation
    if (!item || !quantity || !expiry_time || !pickup_address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }
    if (new Date(expiry_time) <= new Date()) {
      return res.status(400).json({ message: "Expiry time must be in the future" });
    }

    const donation = new Donation({
      donor: req.user.user.id,
      item,
      quantity,
      expiry_time,
      pickup_address,
    });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error creating donation", error: error.message });
  }
};

// Get all donations (filter by status if needed)
exports.getAllDonations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const donations = await Donation.find(filter)
      .populate("donor", "name email")  // Show donor details
      .populate("ngo_id", "name email"); // Show NGO details if claimed
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

// Get a single donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email")
      .populate("ngo_id", "name email");
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donation", error });
  }
};

// NGO claims a donation
exports.claimDonation = async (req, res) => {
  try {
    // 1. Find the donation
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // 2. Validate donation status
    if (donation.status !== "Available") {
      return res.status(400).json({ 
        message: `Donation is already ${donation.status.toLowerCase()}`
      });
    }

    // 3. Validate NGO user
    const userRole = req.user.user?.role || req.user.role;
    if (userRole?.toLowerCase() !== 'ngo') {
      return res.status(403).json({ message: "Only NGOs can claim donations" });
    }

    if (donation.donor.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot claim your own donation" });
    }

    // 4. Update donation
    donation.status = "Claimed";
    donation.ngo_id = req.user.id;
    donation.claimedAt = new Date(); // Add timestamp
    
    // 5. Save and populate NGO details
    await donation.save();
    const populatedDonation = await Donation.findById(donation._id)
      .populate('ngo_id', 'name email phone');

    res.status(200).json({
      message: "Donation claimed successfully",
      donation: populatedDonation
    });

  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ 
      message: "Error claiming donation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin updates donation status (Approve/Deliver/Reject)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Validate status transition (e.g., "Claimed" → "Delivered")
    if (!["Approved", "Rejected", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    donation.status = status;
    await donation.save();
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

// Delete a donation (Admin or donor)
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Allow deletion only by Admin or the donor
    if (req.user.user.role !== "admin" && donation.donor.toString() !== req.user.user.id) { 
      return res.status(403).json({ message: "Unauthorized" });
    }

    // if (donation.status !== "Available" && req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Only admin can delete in-progress donations" });
    // }

    await Donation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting donation", error });
  }
}