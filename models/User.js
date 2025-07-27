const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['ngo', 'restaurant', 'admin'], required: true },
  // NGO-specific fields
  ngo_name: {type: String,unique: true, sparse: true },
  registration_number: {type: String, unique: true , sparse: true},
  ngo_phone: {type: String, unique: true , sparse: true},
  ngo_location: { type: String},
  // Restaurant-specific fields
  restaurant_name: { type: String, unique: true , sparse: true },
  license_number: { type: String, unique: true , sparse: true },
  restaurant_phone: { type: String, unique: true , sparse: true},
  restaurant_location: { type: String},
  //resetPassword
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
