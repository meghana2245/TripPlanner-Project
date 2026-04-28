const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");

const getBookingsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const bookings = await Booking.find({ tripId }).sort({ checkInDate: 1 });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { tripId, bookingType, bookingName, checkInDate, checkOutDate, confirmationNumber } =
      req.body;

    if (!tripId || !bookingType || !bookingName || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message:
          "tripId, bookingType, bookingName, checkInDate, and checkOutDate are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const booking = await Booking.create({
      tripId,
      bookingType,
      bookingName,
      checkInDate,
      checkOutDate,
      confirmationNumber,
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const trip = await Trip.findOne({ _id: booking.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { bookingType, bookingName, checkInDate, checkOutDate, confirmationNumber } = req.body;
    if (bookingType !== undefined) booking.bookingType = bookingType;
    if (bookingName !== undefined) booking.bookingName = bookingName;
    if (checkInDate !== undefined) booking.checkInDate = checkInDate;
    if (checkOutDate !== undefined) booking.checkOutDate = checkOutDate;
    if (confirmationNumber !== undefined) booking.confirmationNumber = confirmationNumber;

    const updatedBooking = await booking.save();
    return res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const trip = await Trip.findOne({ _id: booking.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Booking.deleteOne({ _id: booking._id });

    return res.status(200).json({
      success: true,
      data: { message: "Booking deleted successfully" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBookingsByTrip, createBooking, updateBooking, deleteBooking };
