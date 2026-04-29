const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");

const getTrips = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    const trips = await Trip.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: trips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const [activities, bookings] = await Promise.all([
      Activity.find({ tripId: trip._id }).sort({ activityDate: 1 }),
      Booking.find({ tripId: trip._id }).sort({ checkInDate: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: { ...trip.toObject(), activities, bookings },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const { tripName, destination, startDate, endDate, budget, numberOfPeople } = req.body;

    if (!tripName || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "tripName, destination, startDate, and endDate are required",
      });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      tripName,
      destination,
      startDate,
      endDate,
      budget: budget || 0,
      numberOfPeople: numberOfPeople || 1,
    });

    return res.status(201).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const { tripName, destination, startDate, endDate, budget, numberOfPeople } = req.body;
    if (tripName !== undefined) trip.tripName = tripName;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (budget !== undefined) trip.budget = budget;
    if (numberOfPeople !== undefined) trip.numberOfPeople = numberOfPeople;

    const updatedTrip = await trip.save();
    return res.status(200).json({ success: true, data: updatedTrip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    await Promise.all([
      Activity.deleteMany({ tripId: trip._id }),
      Booking.deleteMany({ tripId: trip._id }),
      Trip.deleteOne({ _id: trip._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: { message: "Trip and related activities/bookings deleted" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };
