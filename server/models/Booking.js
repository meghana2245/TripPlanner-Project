const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["Hotel", "Transport"],
      required: true,
    },
    transportMode: {
      type: String,
      enum: ["Bus", "Train", "Car", "Flight", ""],
      default: "",
    },
    bookingName: {
      type: String,
      required: true,
      trim: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    confirmationNumber: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
