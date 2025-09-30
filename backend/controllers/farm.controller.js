const Farm = require("../models/farms");
const mongoose = require("mongoose");
const MonthlyMilkProduction = require("../models/monthly_milk_production");

const getFarm = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};
        if (role && role.toLowerCase() !== 'all') {
            filter.role = role;
        }
        if (status && status.toLowerCase() !== 'all') {
            filter.status = status;
        }
        const farm = await Farm.find(filter);
        res.status(200).json({ success: true, data: farm });
    } catch (error) {
        console.error("Error in fetching Farms:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getFarmClusterData = async (req, res) => {
    try {
        const farmCounts = await Farm.aggregate([
            { $group: { _id: "$district", farmCount: { $sum: 1 } } }
        ]);

        const milkProduction = await MonthlyMilkProduction.aggregate([
            {
                $lookup: {
                    from: "farms",
                    localField: "farm_id",
                    foreignField: "_id",
                    as: "farm"
                }
            },
            { $unwind: "$farm" },
            { $group: { _id: "$farm.district", totalMilk: { $sum: "$total_milk_production" } } }
        ]);

        const dataMap = new Map();

        farmCounts.forEach(item => {
            dataMap.set(item._id, { name: item._id, farms: item.farmCount, milk: 0 });
        });

        milkProduction.forEach(item => {
            if (dataMap.has(item._id)) {
                dataMap.get(item._id).milk = item.totalMilk;
            } else {
                dataMap.set(item._id, { name: item._id, farms: 0, milk: item.totalMilk });
            }
        });

        const result = Array.from(dataMap.values());
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error in getFarmClusterData:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getTotalFarmsCount = async (req, res) => {
    try {
        const count = await Farm.countDocuments();
        res.status(200).json({ success: true, totalFarms: count });
    } catch (error) {
        console.error("Error in getTotalFarmsCount:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createFarm = async (req, res) => {
    const farm = req.body;
    const newFarm = new Farm(farm);

    try {
        await newFarm.save();
        res.status(201).json({ success: true, data: newFarm });
    } catch (error) {
        console.error("Error in create farm:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateFarm = async (req, res) => {
    const { id } = req.params;
    const farm = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Farm ID" });
    }

    try {
        const updateFarm = await Farm.findByIdAndUpdate(id, farm, { new: true });
        res.status(200).json({ success: true, data: updateFarm });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteFarm = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Farm ID" });
    }

    try {
        await Farm.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Farm deleted successfully" });
    } catch (error) {
        console.error("Error in deleting farms:", error.message);
        res.status(500).json({ success: false, message: "Farm not found" });
    }
};

const getFarmTypeDistribution = async (req, res) => {
    try {
        const distribution = await Farm.aggregate([
            { $group: { _id: "$farm_type", count: { $sum: 1 } } },
            { $project: { _id: 0, name: "$_id", value: "$count" } }
        ]);
        res.status(200).json({ success: true, data: distribution });
    } catch (error) {
        console.error("Error in getFarmTypeDistribution:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getFarmDistributionByProvince = async (req, res) => {
    try {
        const farmAggregation = await Farm.aggregate([
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "gn_division_id",
                    foreignField: "_id",
                    as: "gn_division"
                }
            },
            { $unwind: "$gn_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "gn_division.parent_division_id",
                    foreignField: "_id",
                    as: "ldi_division"
                }
            },
            { $unwind: "$ldi_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "ldi_division.parent_division_id",
                    foreignField: "_id",
                    as: "vs_division"
                }
            },
            { $unwind: "$vs_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "vs_division.parent_division_id",
                    foreignField: "_id",
                    as: "rd_division"
                }
            },
            { $unwind: "$rd_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "rd_division.parent_division_id",
                    foreignField: "_id",
                    as: "pd_division"
                }
            },
            { $unwind: "$pd_division" },
            { $group: { _id: "$pd_division.division_name", farmCount: { $sum: 1 } } }
        ]);

        const milkAggregation = await MonthlyMilkProduction.aggregate([
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
                $lookup: {
                    from: "administrative_divisions",
                    localField: "farm.gn_division_id",
                    foreignField: "_id",
                    as: "gn_division"
                }
            },
            { $unwind: "$gn_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "gn_division.parent_division_id",
                    foreignField: "_id",
                    as: "ldi_division"
                }
            },
            { $unwind: "$ldi_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "ldi_division.parent_division_id",
                    foreignField: "_id",
                    as: "vs_division"
                }
            },
            { $unwind: "$vs_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "vs_division.parent_division_id",
                    foreignField: "_id",
                    as: "rd_division"
                }
            },
            { $unwind: "$rd_division" },
            {
                $lookup: {
                    from: "administrative_divisions",
                    localField: "rd_division.parent_division_id",
                    foreignField: "_id",
                    as: "pd_division"
                }
            },
            { $unwind: "$pd_division" },
            { $group: { _id: "$pd_division.division_name", totalMilk: { $sum: "$total_milk_production" } } }
        ]);

        const dataMap = new Map();

        farmAggregation.forEach(item => {
            dataMap.set(item._id, { name: item._id, farms: item.farmCount, milk: 0 });
        });

        milkAggregation.forEach(item => {
            if (dataMap.has(item._id)) {
                dataMap.get(item._id).milk = item.totalMilk;
            } else {
                dataMap.set(item._id, { name: item._id, farms: 0, milk: item.totalMilk });
            }
        });

        const result = Array.from(dataMap.values());
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error in getFarmDistributionByProvince:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getFarm,
    getFarmClusterData,
    getTotalFarmsCount,
    createFarm,
    updateFarm,
    deleteFarm,
    getFarmTypeDistribution,
    getFarmDistributionByProvince
};
