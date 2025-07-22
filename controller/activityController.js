const Activity = require("../models/Activity");

exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedDonation");

    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities", error: err.message });
  }
};
