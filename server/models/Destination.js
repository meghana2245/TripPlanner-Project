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
    recommendedPlaces: {
      type: [String],
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
