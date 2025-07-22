const { default: mongoose } = require("mongoose");
const ClaimRequest = require("../models/ClaimRequest");
const Donation = require("../models/Donation");
const Activity = require("../models/Activity");
const User = require("../models/User");

// NGO sends a claim request
exports.createClaimRequest = async (req, res) => {
  try {
    const { id: donationId } = req.params;
    const ngoId = req.user.id;
    const { message } = req.body; // Include message from request body

    const donation = await Donation.findById(donationId);
    if (!donation || donation.status !== "available") {
      return res.status(400).json({ message: "Donation is not available" });
    }

    if (donation.donor.toString() === ngoId) {
      return res
        .status(400)
        .json({ message: "Cannot claim your own donation" });
    }

    const alreadyExists = await ClaimRequest.findOne({
      donation: donationId,
      ngo: ngoId,
    });

    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "You already requested this donation" });
    }

    const claim = await ClaimRequest.create({
      donation: donationId,
      ngo: ngoId,
      message,
      status: "pending",
      requestedAt: new Date(),
    });

    const ngoUser = await User.findById(ngoId);
    if(!ngoUser){
      console.log("Ngo user doesnt exist", ngoUser)
    }
    const ngoName = ngoUser?.ngo_name || ngoUser?.name || "an ngo" 
    await Activity.create({
      user: donation.donor,
      message: `${ngoName} requested your donation: ${donation.quantity}${donation.unit} of ${donation.item}.`,
      relatedDonation: donation._id,
    });

    await claim.populate("donation ngo"); // Populate for response
    res.status(201).json({ message: "Claim request sent", claim });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating claim request", error: error.message });
  }
};

// Donor views all claim requests for a donation
exports.getDonationClaims = async (req, res) => {
  try {
    const donationId = req.params.id;
    const claims = await ClaimRequest.find({ donation: donationId })
      .populate("ngo", "name email ngo_name ngo_phone ngo_location")
      .sort({ requestedAt: -1 });
    res.status(200).json(claims);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching claims", error: error.message });
  }
};

exports.getRestaurantClaims = async (req, res) => {
  try {
    // Find all donations by this restaurant
    const donations = await Donation.find({ donor: req.user.id });
    const donationIds = donations.map((d) => d._id);

    // Find all claims for these donations
    const claims = await ClaimRequest.find({
      donation: { $in: donationIds },
    })
      .populate("donation", "item quantity status")
      .populate("ngo", "name email ngo_name ngo_phone ngo_location")
      .sort({ requestedAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching restaurant claims",
      error: error.message,
    });
  }
};

// Donor approves a specific claim
exports.approveClaimRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { claimId } = req.params;

    // Validate claimId
    if (!mongoose.isValidObjectId(claimId)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    // Validate user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const claim = await ClaimRequest.findById(claimId)
      .populate("donation")
      .session(session);

    if (!claim || !claim.donation || claim.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed request" });
    }

    if (claim.donation.status !== "available") {
      return res.status(400).json({
        message: "Donation is no longer available for claiming",
      });
    }

    if (claim.donation.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    claim.status = "approved";
    await claim.save({ session });

    const updatedDonation = await Donation.findByIdAndUpdate(
      claim.donation._id,
      {
        ngo_id: claim.ngo,
        status: "pending_pickup",
      },
      { new: true, session }
    );

    await ClaimRequest.updateMany(
      { donation: claim.donation._id, _id: { $ne: claimId } },
      { $set: { status: "rejected" } },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({
      message: "Claim approved and donation marked for pickup",
      donation: updatedDonation,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

//donor rejects a specific claim
exports.rejectClaimRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { claimId } = req.params;
    const claim = await ClaimRequest.findById(claimId)
      .populate("donation")
      .session(session);

    if (!claim || !claim.donation || claim.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed request." });
    }

    if (
      !claim.donation?.donor ||
      claim.donation.donor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    claim.status = "rejected";
    await claim.save({ session });

    // Check if this was the only approved claim for this donation
    const approvedClaims = await ClaimRequest.countDocuments({
      donation: claim.donation._id,
      status: "approved",
    }).session(session);

    // If there are no approved claims, set donation back to available
    if (approvedClaims === 0 && claim.donation.status === "pending_pickup") {
      await Donation.findByIdAndUpdate(
        claim.donation._id,
        {
          ngo_id: null,
          status: "available",
        },
        { new: true, session }
      );
    }

    await session.commitTransaction();
    res.status(200).json({
      message: "Claim request rejected",
    });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ message: "Error rejecting claim", error: error.message });
  } finally {
    session.endSession();
  }
};

// NGO gets their own claim requests
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ ngo: req.user.id })
      .populate({
        path: "donation",
        select: "item quantity status expiry_time donor", // Added donor here
        populate: {
          // Nested populate for donor info
          path: "donor",
          select: "restaurant_name", // Only get the restaurant name
        },
        strictPopulate: false,
      })
      .sort({ requestedAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching your claims",
      error: error.message,
    });
  }
};

exports.markDelivered = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.ngo_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //Update donation status
    donation.status = "delivered";
    await donation.save();

    // Also update the related claim's status to 'delivered'
    const claim = await ClaimRequest.findOne({
      donation: donation._id,
      ngo: req.user.id,
      status: "approved",
    });

    if (claim) {
      claim.status = "delivered";
      await claim.save();
    }

    const ngoUser = await User.findById(req.user.id);

    await Activity.create({
      user: donation.donor,
      message: `${ngoUser.ngo_name} marked your donation (${donation.quantity}${donation.unit} of ${donation.item}) as delivered.`,
      relatedDonation: donation._id,
    });

    res.status(200).json({
      message: "Donation and claim marked as delivered",
      donation,
      claim,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating donation/claim", error: error.message });
  }
};
