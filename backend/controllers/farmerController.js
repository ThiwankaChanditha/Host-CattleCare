// controllers/farmerController.js
const mongoose = require('mongoose');
const Farmer = require('../models/farmers');
const User = require('../models/users');
const Farm = require('../models/farms');
const FarmerRating = require('../models/farmer_ratings'); // <--- ADD THIS IMPORT

// Get farmer profile by user_id
const getFarmerProfile = async (req, res) => {
    console.log('--- getFarmerProfile Started ---');
    try {
        const userId = req.user.id;
        console.log(`Debug: Authenticated userId: ${userId}`);

        if (!userId) {
            console.log('Debug: No userId found in req.user.id. Returning 401.');
            return res.status(401).json({ message: "User not authenticated." });
        }

        console.log(`Debug: Starting aggregation for user_id: ${userId}`);
        const farmer = await Farmer.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    age: 1,
                    gender: 1,
                    education_level: 1,
                    income_level: 1,
                    occupation: 1,
                    ethnicity: 1,
                    religion: 1,
                    marital_status: 1,
                    household_size: 1,
                    created_at: 1,
                    updated_at: 1,
                    // rating: 1, // We will get this from FarmerRating model now
                    email: '$userDetails.email'
                }
            }
        ]);

        console.log(`Debug: Aggregation raw result (array):`, JSON.stringify(farmer, null, 2));

        let farmerProfile = farmer[0];

        if (!farmerProfile) {
            console.log(`Debug: No farmer profile found for user ${userId} via aggregation. Attempting to create one.`);
            let newlyCreatedFarmer = await Farmer.create({ user_id: userId });
            console.log(`Debug: Successfully created initial farmer document with _id: ${newlyCreatedFarmer._id}`);

            farmerProfile = await Farmer.findById(newlyCreatedFarmer._id).populate('user_id', 'email');

            if (!farmerProfile) {
                console.error(`Error: Failed to retrieve newly created farmer profile with _id: ${newlyCreatedFarmer._id}`);
                return res.status(500).json({ message: "Failed to create initial farmer profile." });
            }

            farmerProfile = {
                ...farmerProfile.toObject(),
                email: farmerProfile.user_id ? farmerProfile.user_id.email : 'N/A'
            };
            console.log(`Debug: Final farmerProfile object after creation and email assignment:`, JSON.stringify(farmerProfile, null, 2));
        } else {
            console.log(`Debug: Farmer profile found for user ${userId}.`);
            if (!farmerProfile.email) {
                console.log(`Debug: Email not found in aggregated profile. Setting to 'N/A'.`);
                farmerProfile.email = 'N/A';
            }
            console.log(`Debug: Final farmerProfile object from aggregation:`, JSON.stringify(farmerProfile, null, 2));
        }

        // --- Fetch Farmer Rating and Calculate Level/Points ---
        const latestRating = await FarmerRating.findOne({ farmer_id: farmerProfile._id })
            .sort({ calculated_date: -1 }) // Get the latest rating
            .lean(); // Return plain JavaScript object

        let farmerScore = latestRating ? latestRating.star_rating : 0; // Default to 0 if no rating
        let nextLevelPointsNeeded = null; // Default to null, implies max level or not calculable
        let currentLevel = farmerScore; // Current star rating is the current level

        // Define your leveling system. This is an EXAMPLE.
        // You'll need to define concrete rules for how many "points"
        // (e.g., based on months_of_continuous_updates, or other metrics)
        // are needed to reach the next star rating.
        // For demonstration, let's assume 'points' are just abstract milestones between stars.
        const maxLevel = 5;
        if (currentLevel < maxLevel) {
            // This is where your actual logic for points needed would go.
            // For example, if it's based on 'months_of_continuous_updates':
            // If star_rating is derived from 10 months for 1 star, 20 for 2, etc.
            // You would need to know the 'months_of_continuous_updates' of the current rating,
            // and the threshold for the next rating.
            // Placeholder: "Assume each level requires 100 points, and current score means 50 points into current level"
            // Since we only have star_rating, let's just indicate the next target star.
            nextLevelPointsNeeded = `Reach ${currentLevel + 1} stars`; // Or specific points if you map them
        }
        // If your rating system directly maps `months_of_continuous_updates` to `star_rating`,
        // you could use `latestRating.months_of_continuous_updates` and your defined thresholds.
        // Example: if 10 months = 1 star, 20 months = 2 stars
        // if (latestRating && currentLevel < maxLevel) {
        //     const nextLevelMonthsThreshold = (currentLevel + 1) * 10; // e.g., for 2 stars, need 20 months
        //     nextLevelPointsNeeded = nextLevelMonthsThreshold - latestRating.months_of_continuous_updates;
        //     if (nextLevelPointsNeeded < 0) nextLevelPointsNeeded = 0; // Already met or exceeded
        // }


        farmerProfile.score = farmerScore; // Add the star_rating as 'score'
        farmerProfile.currentLevel = currentLevel; // Can also expose currentLevel
        farmerProfile.nextLevelPointsNeeded = nextLevelPointsNeeded; // Add points for next level

        console.log(`Debug: Farmer Score: ${farmerProfile.score}, Current Level: ${farmerProfile.currentLevel}, Next Level Points Needed: ${farmerProfile.nextLevelPointsNeeded}`);
        // --- End Fetch Farmer Rating ---

        const farmsCount = await Farm.countDocuments({ farmer_id: farmerProfile._id, is_active: true });
        farmerProfile.farmsCount = farmsCount;
        console.log(`Debug: Total active farms count for farmer ${farmerProfile._id}:`, farmsCount);

        if (farmerProfile.rating === undefined) { // This line might be redundant if you're now using farmerProfile.score
            farmerProfile.rating = 0; // or null, or any default value
        }

        res.status(200).json(farmerProfile);
        console.log('--- getFarmerProfile Finished Successfully ---');

    } catch (error) {
        console.error("Error in getFarmerProfile:", error.message);
        console.error("Full error details:", error);
        res.status(500).json({ message: "Server error while fetching/creating farmer profile.", error: error.message });
        console.log('--- getFarmerProfile Finished with Error ---');
    }
};

// ✅ Now defined outside of getFarmerProfile
const updateFarmerProfile = async (req, res) => {
    console.log('--- updateFarmerProfile Started ---');
    try {
        const userId = req.user.id;
        console.log(`Debug: Authenticated userId for update: ${userId}`);

        if (!userId) {
            console.log('Debug: No userId found in req.user.id for update. Returning 401.');
            return res.status(401).json({ message: "User not authenticated." });
        }

        const updates = { ...req.body };
        console.log(`Debug: Incoming updates from request body:`, JSON.stringify(updates, null, 2));

        delete updates.user_id;
        delete updates.created_at;
        delete updates.email;
        console.log(`Debug: Updates after removing restricted fields:`, JSON.stringify(updates, null, 2));

        updates.updated_at = new Date();
        console.log(`Debug: Updates after adding updated_at:`, JSON.stringify(updates, null, 2));

        console.log(`Debug: Attempting to findOneAndUpdate farmer profile for user_id: ${userId}`);
        const farmer = await Farmer.findOneAndUpdate(
            { user_id: userId },
            { $set: updates },
            { new: true, runValidators: true, upsert: true }
        ).populate('user_id', 'email');

        if (!farmer) {
            console.log(`Debug: Farmer profile not found or created after update attempt for user_id: ${userId}.`);
            return res.status(404).json({ message: "Farmer profile not found after update attempt." });
        }

        console.log(`Debug: Farmer profile successfully updated/upserted:`, JSON.stringify(farmer.toObject(), null, 2));
        res.status(200).json({ message: "Farmer profile updated successfully", farmer: farmer.toObject() });
        console.log('--- updateFarmerProfile Finished Successfully ---');

    } catch (error) {
        console.error("Error in updateFarmerProfile:", error.message);
        console.error("Full error details:", error);

        if (error.name === 'ValidationError') {
            console.log('Debug: Mongoose Validation Error caught.');
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: "Validation Error", errors: errors });
        }

        res.status(500).json({ message: "Server error while updating farmer profile.", error: error.message });
        console.log('--- updateFarmerProfile Finished with Error ---');
    }
};

module.exports = {
    getFarmerProfile,
    updateFarmerProfile
};
