const MonthlyMilkProduction = require("../models/monthly_milk_production");
const mongoose = require("mongoose");

const getMilk = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};
        if (role && role.toLowerCase() !== "all") {
            filter.role = role;
        }
        if (status && status.toLowerCase() !== "all") {
            filter.status = status;
        }
        const monthlyMilkProduction = await MonthlyMilkProduction.find(filter);
        res.status(200).json({ success: true, data: monthlyMilkProduction });
    } catch (error) {
        console.log("Error in fetching Milk Production:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getTotalMilkProduction = async (req, res) => {
    try {
        const result = await MonthlyMilkProduction.aggregate([
            {
                $group: {
                    _id: null,
                    totalMilk: { $sum: "$total_milk_production" }
                }
            }
        ]);
        const totalMilk = result.length > 0 ? result[0].totalMilk : 0;
        res.status(200).json({ success: true, totalMilk });
    } catch (error) {
        console.error("Error in getTotalMilkProduction:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getMilkProductionByDistrict = async (req, res) => {
    try {
        const milkProductionByDistrict = await MonthlyMilkProduction.aggregate([
            {
                $lookup: {
                    from: "farms",
                    localField: "farm_id",
                    foreignField: "_id",
                    as: "farm"
                }
            },
            { $unwind: "$farm" },
            {
                $group: {
                    _id: "$farm.district",
                    totalMilk: { $sum: "$total_milk_production" }
                }
            },
            {
                $project: {
                    _id: 0,
                    district: "$_id",
                    totalMilk: 1
                }
            }
        ]);
        res.status(200).json({ success: true, data: milkProductionByDistrict });
    } catch (error) {
        console.error("Error in getMilkProductionByDistrict:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createMilkProduction = async (req, res) => {
    const monthlyMilkProduction = req.body;
    const newMilkProduction = new MonthlyMilkProduction(monthlyMilkProduction);

    try {
        await newMilkProduction.save();
        res.status(201).json({ success: true, data: newMilkProduction });
    } catch (error) {
        console.error("Error in create milk production:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateMilkProduction = async (req, res) => {
    const { id } = req.params;
    const monthlyMilkProduction = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Milk Production ID" });
    }

    try {
        const updatedMilkProduction = await MonthlyMilkProduction.findByIdAndUpdate(
            id,
            monthlyMilkProduction,
            { new: true }
        );
        res.status(200).json({ success: true, data: updatedMilkProduction });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteMilkProduction = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Milk Production ID" });
    }

    try {
        await MonthlyMilkProduction.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Milk report deleted successfully" });
    } catch (error) {
        console.error("Error in deleting Milk Production:", error.message);
        res.status(500).json({ success: false, message: "Milk details not found" });
    }
};

module.exports = {
    getMilk,
    getTotalMilkProduction,
    getMilkProductionByDistrict,
    createMilkProduction,
    updateMilkProduction,
    deleteMilkProduction
};
