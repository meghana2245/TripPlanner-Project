const mongoose = require("mongoose");
const Destination = require("../models/Destination");

const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid destination id" });
    }

    const destination = await Destination.findById(id).populate("createdBy", "name email role");
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.status(200).json({ success: true, data: destination });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDestination = async (req, res) => {
  try {
    const { destinationName, description, recommendedPlaces, imageUrl } = req.body;

    if (!destinationName || !description) {
      return res.status(400).json({
        success: false,
        message: "destinationName and description are required",
      });
    }

    const destination = await Destination.create({
      destinationName,
      description,
      recommendedPlaces: Array.isArray(recommendedPlaces) ? recommendedPlaces : [],
      imageUrl,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, data: destination });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid destination id" });
    }

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    const { destinationName, description, recommendedPlaces, imageUrl } = req.body;
    if (destinationName !== undefined) destination.destinationName = destinationName;
    if (description !== undefined) destination.description = description;
    if (recommendedPlaces !== undefined) {
      destination.recommendedPlaces = Array.isArray(recommendedPlaces) ? recommendedPlaces : [];
    }
    if (imageUrl !== undefined) destination.imageUrl = imageUrl;

    const updatedDestination = await destination.save();
    return res.status(200).json({ success: true, data: updatedDestination });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid destination id" });
    }

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    await Destination.deleteOne({ _id: destination._id });
    return res.status(200).json({
      success: true,
      data: { message: "Destination deleted successfully" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};
