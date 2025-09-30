const mongoose = require("mongoose");
const UserRole = require("../models/user_roles.js");

const getuserRole = async (req, res) => {
    try {
        const userRoles = await UserRole.find(req.query);
        res.status(200).json({ success: true, data: userRoles });
    } catch (error) {
        console.error("Error fetching user roles:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const createUserRole = async (req, res) => {
    const userRole = req.body;

    if (!userRole.role_name || !userRole.description || !userRole.role_level) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const newUserRole = new UserRole(userRole);

    try {
        await newUserRole.save();
        res.status(201).json({ success: true, data: newUserRole });
    } catch (error) {
        console.error("Error creating user role:", error.message);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const userRole = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User Role ID" });
    }

    try {
        const updatedUserRole = await UserRole.findByIdAndUpdate(id, userRole, { new: true });
        res.status(200).json({ success: true, message: "User Role updated successfully", data: updatedUserRole });
    } catch (error) {
        console.error("Error updating user role:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteUserRole = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User Role ID" });
    }

    try {
        await UserRole.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "User Role deleted successfully" });
    } catch (error) {
        console.error("Error deleting user role:", error.message);
        res.status(500).json({ success: false, message: "User Role not found" });
    }
};

module.exports = {
    getuserRole,
    createUserRole,
    updateUserRole,
    deleteUserRole
};
