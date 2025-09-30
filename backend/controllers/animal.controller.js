const Animal = require("../models/animals");
const mongoose = require("mongoose");

const getAnimal = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};
        if (role && role.toLowerCase() !== "all") {
            filter.role = role;
        }
        if (status && status.toLowerCase() !== "all") {
            filter.status = status;
        }
        const animal = await Animal.find(filter);
        res.status(200).json({ success: true, data: animal });
    } catch (error) {
        console.error("Error in fetching animals:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getTotalCattlePopulation = async (req, res) => {
    try {
        const count = await Animal.countDocuments();
        res.status(200).json({ success: true, totalCattle: count });
    } catch (error) {
        console.error("Error in getTotalCattlePopulation:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createAnimal = async (req, res) => {
    const animal = req.body;
    const newAnimal = new Animal(animal);
    try {
        await newAnimal.save();
        res.status(201).json({ success: true, data: newAnimal });
    } catch (error) {
        console.error("Error in createAnimal:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateAnimal = async (req, res) => {
    const { id } = req.params;
    const animal = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid animal ID" });
    }
    try {
        const updateAnimal = await Animal.findByIdAndUpdate(id, animal, { new: true });
        res.status(200).json({ success: true, data: updateAnimal });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteAnimal = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Animal ID" });
    }
    try {
        await Animal.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Animal deleted successfully" });
    } catch (error) {
        console.error("Error in deleteAnimal:", error.message);
        res.status(500).json({ success: false, message: "Animal not found" });
    }
};

const getAnimalCategoryDistribution = async (req, res) => {
    try {
        const distribution = await Animal.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, name: "$_id", value: "$count" } }
        ]);
        res.status(200).json({ success: true, data: distribution });
    } catch (error) {
        console.error("Error in getAnimalCategoryDistribution:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getAnimal,
    getTotalCattlePopulation,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    getAnimalCategoryDistribution
};
