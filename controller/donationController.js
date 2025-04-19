const Donation = require("../models/Donation");

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

// Get a single donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donation", error });
  }
};

// Create a new donation
exports.createDonation = async (req, res) => {
  try {
    const { donor, item, quantity } = req.body;
    if (!donor || !item || quantity == null) {
      return res.status(400).json({ message: "Donor, item, and quantity are required" });
    }
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    const donation = new Donation({ donor, item, quantity });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error creating donation", error: error.message });
  }
};

// Update donation status (Approve/Reject)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if(!["Pending", "Approved", "Rejected"].includes(status)){
      return res.status(400).json({message:"Invalid status value"})
    }
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = status;
    await donation.save();
    res.status(200).json({ message: `Donation status updated to ${status}`, donation });
  } catch (error) {
    res.status(500).json({ message: "Error updating donation status", error });
  }
};

// Delete a donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting donation", error });
  }
};
