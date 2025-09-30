const Farmer = require("../models/farmers");
const mongoose = require("mongoose");

const getFarmer = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};
        if (role && role.toLowerCase() !== 'all') filter.role = role;
        if (status && status.toLowerCase() !== 'all') filter.status = status;

        const farmer = await Farmer.find(filter);
        res.status(200).json({ success: true, data: farmer });
    } catch (error) {
        console.log("error in fetching Farmers:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createFarmer = async (req, res) => {
    const farmer = req.body;
    const newFarmer = new Farmer(farmer);

    try {
        await newFarmer.save();
        res.status(201).json({ success: true, data: newFarmer });
    } catch (error) {
        console.error("Error in create farmer:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateFarmer = async (req, res) => {
    const { id } = req.params;
    const farmer = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Farmer ID" });
    }

    try {
        const updatedFarmer = await Farmer.findByIdAndUpdate(id, farmer, { new: true });
        res.status(200).json({ success: true, data: updatedFarmer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteFarmer = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Farmer ID" });
    }

    try {
        await Farmer.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Farmer deleted successfully" });
    } catch (error) {
        console.error("Error in deleting farmers:", error.message);
        res.status(500).json({ success: false, message: "Farmer not found" });
    }
};

module.exports = {
    getFarmer,
    createFarmer,
    updateFarmer,
    deleteFarmer
};
