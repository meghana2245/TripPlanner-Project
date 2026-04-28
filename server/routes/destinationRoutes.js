const express = require("express");
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/", protect, adminMiddleware, createDestination);
router.put("/:id", protect, adminMiddleware, updateDestination);
router.delete("/:id", protect, adminMiddleware, deleteDestination);

module.exports = router;
