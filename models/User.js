const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, 
    userType: { type: String, required: true },
    location: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true }
});

module.exports = mongoose.model("User", UserSchema);
