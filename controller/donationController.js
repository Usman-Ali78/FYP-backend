// const Donation = require("../models/Donation");

// // Get all donations
// exports.getAllDonations = async (req, res) => {
//   try {
//     const donations = await Donation.find();
//     res.status(200).json(donations);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching donations", error });
//   }
// };

// // Get a single donation by ID
// exports.getDonationById = async (req, res) => {
//   try {
//     const donation = await Donation.findById(req.params.id);
//     if (!donation) return res.status(404).json({ message: "Donation not found" });

//     res.status(200).json(donation);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching donation", error });
//   }
// };

// // Create a new donation
// exports.createDonation = async (req, res) => {
//   try {
//     const { donor, item, quantity } = req.body;
//     if (!donor || !item || quantity == null) {
//       return res.status(400).json({ message: "Donor, item, and quantity are required" });
//     }
    
//     if (typeof quantity !== 'number' || quantity <= 0) {
//       return res.status(400).json({ message: "Quantity must be a positive number" });
//     }
//     const donation = new Donation({ donor, item, quantity });
//     await donation.save();
//     res.status(201).json(donation);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating donation", error: error.message });
//   }
// };

// // Update donation status (Approve/Reject)
// exports.updateDonationStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     if(!["Pending", "Approved", "Rejected"].includes(status)){
//       return res.status(400).json({message:"Invalid status value"})
//     }
//     const donation = await Donation.findById(req.params.id);
//     if (!donation) return res.status(404).json({ message: "Donation not found" });

//     donation.status = status;
//     await donation.save();
//     res.status(200).json({ message: `Donation status updated to ${status}`, donation });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating donation status", error });
//   }
// };

// // Delete a donation
// exports.deleteDonation = async (req, res) => {
//   try {
//     const donation = await Donation.findByIdAndDelete(req.params.id);
//     if (!donation) return res.status(404).json({ message: "Donation not found" });

//     res.status(200).json({ message: "Donation deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting donation", error });
//   }
// };
const Donation = require("../models/Donation");

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

// Create a new donation (Restaurant only)
exports.createDonation = async (req, res) => {
  try {
    const { item, quantity, expiry_time, pickup_address } = req.body;
    
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
      donor: req.user.id,
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

// NGO claims a donation
exports.claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "Available") {
      return res.status(400).json({ message: "Donation is not available" });
    }

    donation.status = "Claimed";
    donation.ngo_id = req.user.id; // NGO user ID
    await donation.save();
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Error claiming donation", error });
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
    if (req.user.role !== "Admin" && donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting donation", error });
  }
}