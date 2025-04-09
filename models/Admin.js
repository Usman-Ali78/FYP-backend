const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "SuperAdmin"], default: "Admin" }, // Roles for admin users
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AdminUser", AdminUserSchema);