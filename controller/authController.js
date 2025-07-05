const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config()


//SignUp
exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      userType,
      location,
      termsAccepted,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !userType ||
      !location ||
      termsAccepted === undefined
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

    if(!passwordRegex.test(password)){
      return res.status(400).json({message:"Password must include at least one number,one uppercase,one lowercase,one number and 8 character long"})
    }

    // Ensure password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    // validate userType
    const validUserTypes = ["admin", "ngo", "restaurant"];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ message: "Invalid user type." });
    }

    // Ensure termsAccepted is true
    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "You must accept the terms and conditions." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      location,
      termsAccepted,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user: {
          id: user._id,
          role: user.userType,
          email: user.email,
          name: user.name
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
   

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//UpdatePassword
exports.updatePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId; // Extracted from the JWT token
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }
  
      // Validate the new password
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters long." });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };