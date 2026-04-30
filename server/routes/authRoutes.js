const express = require("express");
const { registerUser, loginUser, updateProfile, updatePassword, getAllUsers } = require("../controllers/authController");
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.get("/users", protect, adminMiddleware, getAllUsers);

module.exports = router;
