const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Trip = require("../models/Trip");

const getActivitiesByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const activities = await Activity.find({ tripId }).sort({ activityDate: 1 });
    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const { tripId, activityName, activityDate, location, description } = req.body;

    if (!tripId || !activityName || !activityDate || !location) {
      return res.status(400).json({
        success: false,
        message: "tripId, activityName, activityDate, and location are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const activity = await Activity.create({
      tripId,
      activityName,
      activityDate,
      location,
      description,
    });

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid activity id" });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    const trip = await Trip.findOne({ _id: activity.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { activityName, activityDate, location, description } = req.body;
    if (activityName !== undefined) activity.activityName = activityName;
    if (activityDate !== undefined) activity.activityDate = activityDate;
    if (location !== undefined) activity.location = location;
    if (description !== undefined) activity.description = description;

    const updatedActivity = await activity.save();
    return res.status(200).json({ success: true, data: updatedActivity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid activity id" });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    const trip = await Trip.findOne({ _id: activity.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Activity.deleteOne({ _id: activity._id });

    return res.status(200).json({
      success: true,
      data: { message: "Activity deleted successfully" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivitiesByTrip,
  createActivity,
  updateActivity,
  deleteActivity,
};
