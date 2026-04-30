const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    destinationName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    sampleItinerary: {
      type: [
        {
          day: { type: Number, required: true },
          title: { type: String, trim: true, default: "" },
          activities: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema);
