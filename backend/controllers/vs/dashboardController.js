// backend/controllers/vs/dashboardController.js
const Animal = require('../../models/animals');
const AnimalHealthRecord = require('../../models/animal_health_records');
const Farm = require('../../models/farms');
const User = require('../../models/users');
const AdministrativeDivision = require('../../models/administrative_divisions');
const UserRole = require('../../models/user_roles');
const mongoose = require('mongoose');
const Appointments = require('../../models/Appointments');

const bcrypt = require('bcryptjs');

const safeToISOString = (dateValue) => {
    try {
        if (!dateValue) return new Date().toISOString().split('T')[0];


        if (dateValue.$date) {
            const date = new Date(dateValue.$date);
            return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        }


        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
    } catch (error) {
        console.warn('Date conversion error:', error);
        return new Date().toISOString().split('T')[0];
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const authenticatedUserRole = req.user.role;

        if (!authenticatedUserId) {
            return res.status(401).json({ message: "User not authenticated or ID missing." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const userProfile = await User.findById(authenticatedUserId).select('full_name profileImage email division_id').lean();
        if (!userProfile) {
            return res.status(404).json({ message: "Authenticated user profile not found. Please log in again." });
        }

        const vsDivisionId = userProfile.division_id;
        if (!vsDivisionId) {
            return res.status(400).json({ message: "User's administrative division not found." });
        }

        const childDivisions = await AdministrativeDivision.find({
            parent_division_id: vsDivisionId
        }).select('_id division_type').lean();

        console.log("child divisions: ", childDivisions);

        const farmerDivisionIds = childDivisions
            .filter(div => div.division_type === 'GN')
            .map(div => div._id);

        console.log("farmer divisions: ", farmerDivisionIds);

        const ldiDivisionIds = childDivisions
            .filter(div => div.division_type === 'LDI')
            .map(div => div._id);

        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
        const farmerRoleId = farmerRole ? farmerRole._id : null;

        const ldiRole = await UserRole.findOne({ role_name: 'ldi_officer' });
        const ldiRoleId = ldiRole ? ldiRole._id : null;

        let dynamicTotalFarmersCount = 0;
        let farmerIds = [];
        if (farmerRoleId) {
            const farmers = await User.find({
                division_id: { $in: farmerDivisionIds },
                role_id: farmerRoleId
            }).select('_id').lean();
            farmerIds = farmers.map(f => f._id);
            dynamicTotalFarmersCount = farmers.length;
        }
        console.log("Dynamic Total Farmers Count:", farmerIds);

        const farmsInFarmerDivisions = await Farm.countDocuments({
            division_id: { $in: farmerDivisionIds }
        });

        let totalLdiCount = 0;
        if (ldiRoleId) {
            totalLdiCount = await User.countDocuments({
                division_id: { $in: ldiDivisionIds },
                role_id: ldiRoleId
            });
        }


        const farmsByFarmers = await Farm.find({
            registered_by: { $in: farmerIds }
        }).select('_id registered_by').lean();
        const totalFarmsByFarmers = farmsByFarmers.length;

        console.log("Total Farms Owned by Farmers:", totalFarmsByFarmers);


        const farmIdsOwnedByFarmers = farmsByFarmers.map(farm => farm._id);
        const totalAnimalsByFarmers = await Animal.countDocuments({
            farm_id: { $in: farmIdsOwnedByFarmers },
            current_status: 'Active'
        });

        console.log("Total Animals in Farms Owned by Farmers:", totalAnimalsByFarmers);

        const vsSpecificHealthRecords = await AnimalHealthRecord.find({ treated_by: authenticatedUserId })
            .populate({
                path: 'animal_id',
                select: 'animal_tag animal_type current_status farm_id',
                populate: {
                    path: 'farm_id',
                    select: 'farm_name'
                }
            })
            .lean();


        const appointmentsRaw = await Appointments.find({
            veterinary_id: authenticatedUserId,
            date: { $gte: today, $lt: tomorrow },

        })
            .populate('farm_id', 'farm_name')
            .lean();


        const todaysAppointments = appointmentsRaw.map(app => {
            const hour = app.hour !== undefined ? app.hour : 0;
            const minute = app.minute !== undefined ? app.minute : 0;
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            return {
                id: app._id.toString(),
                date: app.date.toISOString().split('T')[0],
                time: timeString,
                animalName: app.animal_tag,
                animalId: app.animal_tag,
                farm: app.farm_id ? app.farm_id.farm_name : 'N/A',
                procedure: app.procedure || 'N/A',
                status: app.status_flag || 'Scheduled',
                vs_id: authenticatedUserId.toString()
            };
        });

        const pendingValidations = vsSpecificHealthRecords.filter(rec => rec.recovery_status === 'Ongoing').map(rec => ({
            id: rec._id.toString(),
            type: 'Health Record Validation',
            animalName: rec.animal_id?.animal_tag || 'N/A',
            animalId: rec.animal_id?._id?.toString() || 'N/A',
            date: safeToISOString(rec.created_at),
            issue: rec.health_issue,
            farm: rec.animal_id?.farm_id?.farm_name || 'N/A'
        }));

        const affectedAnimals = vsSpecificHealthRecords.filter(record => record.recovery_status === 'Ongoing');
        const formattedAffectedAnimals = affectedAnimals.map(record => ({
            id: record._id.toString(),
            animalName: record.animal_id?.animal_tag || 'N/A',
            animalType: record.animal_id?.animal_type || 'N/A',
            farm: record.animal_id?.farm_id?.farm_name || 'N/A',
            condition: record.health_issue,
            status: 'Ongoing',
            dateReported: safeToISOString(record.created_at)
        }));

        const recoveringAnimals = vsSpecificHealthRecords.filter(record => record.recovery_status === 'Recovered');
        const formattedRecoveringAnimals = recoveringAnimals.map(record => ({
            id: record._id.toString(),
            animalName: record.animal_id?.animal_tag || 'N/A',
            animalId: record.animal_id?._id?.toString() || 'N/A',
            farm: record.animal_id?.farm_id?.farm_name || 'N/A',
            condition: record.health_issue,
            recoveryStage: 'Recovered',
            dateStarted: safeToISOString(record.created_at)
        }));

        const farmsManagedByVS = await Farm.find({
            $or: [
                { registered_by: authenticatedUserId },
                { veterinarians_assigned: authenticatedUserId }
            ]
        });

        const farmIdsManagedByVS = farmsManagedByVS.map(farm => farm._id);
        const activeFarmsCount = farmsManagedByVS.filter(farm => farm.is_active).length;

        const totalAnimalsInVSRelatedFarms = await Animal.countDocuments({
            farm_id: { $in: farmIdsManagedByVS },
            current_status: 'Active'
        });

        const totalCattleInVSRelatedFarms = await Animal.countDocuments({
            farm_id: { $in: farmIdsManagedByVS },
            animal_type: 'Cattle',
            current_status: 'Active'
        });

        console.log("Total Cattle in VS Related Farms:", totalCattleInVSRelatedFarms);

        const totalBuffaloInVSRelatedFarms = await Animal.countDocuments({
            farm_id: { $in: farmIdsManagedByVS },
            animal_type: 'Buffalo',
            current_status: 'Active'
        });

        const avgProduction = 0;

        const areaStats = {
            activeFarms: totalFarmsByFarmers,
            totalCattle: totalAnimalsByFarmers,
            totalBuffalo: totalBuffaloInVSRelatedFarms,
            totalAnimals: totalAnimalsByFarmers,
            avgProduction: avgProduction,
            ldiCount: totalLdiCount,
            activeProjects: 8,
            totalFarmers: dynamicTotalFarmersCount,
            totalFarmsManagedByFarmers: farmsInFarmerDivisions,
            totalFarmsOwnedByFarmers: totalFarmsByFarmers,
            totalAnimalsInFarmerFarms: totalAnimalsByFarmers
        };

        res.status(200).json({
            userProfile: {
                name: userProfile.full_name,
                email: userProfile.email,
                profileImage: userProfile.profileImage
            },
            areaStats,
            appointments: todaysAppointments,
            pendingValidations,
            affectedAnimals: formattedAffectedAnimals,
            recoveringAnimals: formattedRecoveringAnimals,
        });

    } catch (error) {
        console.error("Error fetching dashboard data in DashboardController:", error);
        res.status(500).json({ message: "Internal server error occurred while fetching dashboard data.", error: error.message });
    }
};

exports.getUserSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('full_name email contact_number area created_at address division_id').lean();
        const divData = await AdministrativeDivision.findOne({ _id: user.division_id }).select('division_type  division_name').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user, divData });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateUserSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { full_name, email, contact_number } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (full_name) user.full_name = full_name;
        if (email) user.email = email;
        if (contact_number) user.contact_number = contact_number;

        await user.save();

        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required'
            });
        }
        const user = await User.findById(userId).select('password_hash');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        console.log('Updating password for user:', user);

        console.log('User found:', user._id);
        console.log('Password field exists:', !!user.password_hash);
        console.log('Current password provided:', !!currentPassword);

        if (!user.password_hash) {
            return res.status(400).json({
                message: 'No password set for this account. Please contact administrator.'
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long'
            });
        }

        const saltRounds = 12;
        user.password_hash = await bcrypt.hash(newPassword, saltRounds);

        await user.save()

        res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Error updating user password:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
