const express = require("express");
const {
  getActivitiesByTrip,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/trip/:tripId", getActivitiesByTrip);
router.post("/", createActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
