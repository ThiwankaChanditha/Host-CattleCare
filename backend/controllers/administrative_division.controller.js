const mongoose = require("mongoose");
const AdministrativeDivision = require("../models/administrative_divisions");

// Get all administrative divisions
const getAdministrativeDivisions = async (req, res) => {
  try {
    const divisions = await AdministrativeDivision.find({});
    res.status(200).json({ success: true, data: divisions });
  } catch (error) {
    console.error("Error fetching administrative divisions:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get administrative division by ID
const getAdministrativeDivisionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Administrative Division ID" });
    }

    const division = await AdministrativeDivision.findById(id);
    if (!division) {
      return res
        .status(404)
        .json({ success: false, message: "Administrative Division not found" });
    }

    res.status(200).json({ success: true, data: division });
  } catch (error) {
    console.error("Error fetching administrative division by ID:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get filtered administrative divisions
const getFilteredAdministrativeDivisions = async (req, res) => {
  try {
    const { division_type, parent_division_id } = req.query;
    const filter = {};

    if (division_type) filter.division_type = division_type;
    if (parent_division_id) filter.parent_division_id = parent_division_id;

    const divisions = await AdministrativeDivision.find(filter);
    res.status(200).json({ success: true, data: divisions });
  } catch (error) {
    console.error("Error fetching filtered administrative divisions:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get divisions by type
const getDivisionsByType = async (req, res) => {
  try {
    const { division_type } = req.query;

    if (!division_type) {
      return res
        .status(400)
        .json({ success: false, message: "Division type is required" });
    }

    const divisions = await AdministrativeDivision.find({ division_type });
    res.status(200).json({ success: true, data: divisions });
  } catch (error) {
    console.error("Error fetching divisions by type:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a new administrative division
const createAdministrativeDivision = async (req, res) => {
  const divisionData = req.body;

  if (!divisionData.division_name || !divisionData.division_type) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all required fields" });
  }

  const newDivision = new AdministrativeDivision(divisionData);

  try {
    await newDivision.save();
    res.status(201).json({ success: true, data: newDivision });
  } catch (error) {
    console.error("Error creating administrative division:", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Update administrative division
const updateAdministrativeDivision = async (req, res) => {
  const { id } = req.params;
  const divisionData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Administrative Division ID" });
  }

  try {
    const updatedDivision = await AdministrativeDivision.findByIdAndUpdate(
      id,
      divisionData,
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedDivision });
  } catch (error) {
    console.error("Error updating administrative division:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete administrative division
const deleteAdministrativeDivision = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Administrative Division ID" });
  }

  try {
    await AdministrativeDivision.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Administrative division deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting administrative division:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Administrative division not found" });
  }
};

module.exports = {
  getAdministrativeDivisions,
  getAdministrativeDivisionById,
  getFilteredAdministrativeDivisions,
  getDivisionsByType,
  createAdministrativeDivision,
  updateAdministrativeDivision,
  deleteAdministrativeDivision,
};
