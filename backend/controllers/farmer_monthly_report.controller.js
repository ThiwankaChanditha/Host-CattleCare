const mongoose = require("mongoose");
const FarmerMonthlyReport = require("../models/farmer_monthly_reports");

const getMonthlyReport = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};

        if (role && role.toLowerCase() !== "all") {
            filter.role = role;
        }
        if (status && status.toLowerCase() !== "all") {
            filter.status = status;
        }

        const farmerMonthlyReport = await FarmerMonthlyReport.find(filter);
        res.status(200).json({ success: true, data: farmerMonthlyReport });
    } catch (error) {
        console.error("Error in fetching Monthly Report:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createMonthlyReport = async (req, res) => {
    const farmerMonthlyReport = req.body;
    const newMonthlyReport = new FarmerMonthlyReport(farmerMonthlyReport);

    try {
        await newMonthlyReport.save();
        res.status(201).json({ success: true, data: newMonthlyReport });
    } catch (error) {
        console.error("Error in create Monthly Report:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateMonthlyReport = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Monthly Report ID" });
    }

    try {
        const updatedReport = await FarmerMonthlyReport.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteMonthlyReport = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Monthly Report ID" });
    }

    try {
        await FarmerMonthlyReport.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Monthly report deleted successfully" });
    } catch (error) {
        console.error("Error in deleting Monthly report:", error.message);
        res.status(500).json({ success: false, message: "Monthly report not found" });
    }
};

module.exports = {
    getMonthlyReport,
    createMonthlyReport,
    updateMonthlyReport,
    deleteMonthlyReport
};
