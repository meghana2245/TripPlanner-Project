const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Trip = require("../models/Trip");
const generateToken = require("../utils/generateToken");

const safeUser = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role,
  profilePicture: u.profilePicture || "",
  _id: u._id,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role === "admin" ? "admin" : "user" });
    const token = generateToken(user._id, user.role);
    return res.status(201).json({ success: true, data: { token, user: safeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    return res.status(200).json({ success: true, data: { token, user: safeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /auth/profile  — update name, email, profilePicture
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, email, profilePicture } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: "Name cannot be empty" });
      user.name = name.trim();
    }
    if (email !== undefined) {
      const trimEmail = email.trim().toLowerCase();
      if (!trimEmail) return res.status(400).json({ success: false, message: "Email cannot be empty" });
      const existing = await User.findOne({ email: trimEmail });
      if (existing && String(existing._id) !== String(user._id))
        return res.status(400).json({ success: false, message: "Email already in use" });
      user.email = trimEmail;
    }
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    return res.status(200).json({ success: true, data: { user: safeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /auth/password  — change password (requires current password)
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ success: true, data: { message: "Password updated successfully" } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /auth/users — Admin only: get all users with trip counts and trip details
const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: { role: { $ne: "admin" } }
      },
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "userId",
          as: "userTrips"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          tripCount: { $size: "$userTrips" },
          trips: {
            $map: {
              input: "$userTrips",
              as: "trip",
              in: {
                tripName: "$$trip.tripName",
                destination: "$$trip.destination"
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile, updatePassword, getAllUsers };
