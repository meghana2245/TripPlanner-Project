const express = require("express");
const {
  getBookingsByTrip,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/trip/:tripId", getBookingsByTrip);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
