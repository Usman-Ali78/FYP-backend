const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  message:{
    type: String,
    required:true
  },
  relatedDonation:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Donation"
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})

module.exports = mongoose.model("Activity", activitySchema)