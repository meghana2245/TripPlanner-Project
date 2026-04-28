const express = require("express");
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getTrips);
router.get("/:id", getTripById);
router.post("/", createTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
