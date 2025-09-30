const Farmer = require('../models/farmers');
const Farm = require('../models/farms');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const FarmerMonthlyReport = require('../models/farmer_monthly_reports');


// Get all farmers with user details
const getAllFarmers = async (req, res) => {
    try {
        const farmers = await Farmer.find({ ldi_officer_id: req.user._id })
            .populate({
                path: 'user_id',
                select: 'full_name email contact_number address',
                model: User
            })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: farmers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farmers',
            error: error.message
        });
    }
};

// Get all farms with farmer and user details
const getAllFarms = async (req, res) => {
    console.log('Fetching all farmers for LDI officer:', req.params);
    try {
        // First, find all farmers under the LDI officer
        const farmers = await Farmer.find({ ldi_officer_id: req.user._id }).select('_id');
        const farmerIds = farmers.map(farmer => farmer._id);

        // Then find only farms where farmer_id is in the above list
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } })
            .populate({
                path: 'farmer_id',
                populate: {
                    path: 'user_id',
                    select: 'full_name email contact_number',
                    model: User
                }
            })
            .populate({
                path: 'gn_division_id',
                select: 'name',
                model: 'AdministrativeDivision'
            })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: farms
        });
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farms',
            error: error.message
        });
    }
};


// Get farm count
const getFarmCount = async (req, res) => {
    try {
        const count = await Farm.countDocuments();
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farm count',
            error: error.message
        });
    }
};

// Get farmer count
const getFarmerCount = async (req, res) => {
    try {
        let filter = {};
        // If the logged-in user is an LDI officer, filter by their user ID
        if (req.user && req.user.role && req.user.role === 'livestock development instructor') {
            filter.ldi_officer_id = req.user.id;
        }
        const count = await Farmer.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer count',
            error: error.message
        });
    }
};

// Create a new farmer and user
const createFarmer = async (req, res) => {
    try {
        console.log(req.body);
        const {
            nic,
            age,
            gender,
            education_level,
            occupation,
            ethnicity,
            religion,
            marital_status,
            household_size,
            division_id // Optional, can be provided from frontend
        } = req.body;

        // Check required fields
        if (!nic) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        // Check for existing farmer with same NIC
        const existingUserForFarmerByNIC = await User.findOne({ nic });
        console.log(existingUserForFarmerByNIC);
        if (!existingUserForFarmerByNIC) {
            return res.status(409).json({ success: false, message: 'There is no user with this NIC, add the user first.' });
        }

        // Check for existing user (by email or username)
        // const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        // if (existingUser) {
        //     return res.status(409).json({ success: false, message: 'User with this email or username already exists.' });
        // }

        // Get Farmer role
        // const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
        // if (!farmerRole) {
        //     return res.status(500).json({ success: false, message: 'Farmer role not found in the system.' });
        // }

        // Get division
        // let userDivisionId = division_id;
        // if (!userDivisionId) {
        //     // Default to first GN or LDI division
        //     const defaultDivision = await AdministrativeDivision.findOne({ division_type: { $in: ['GN', 'LDI'] } });
        //     if (!defaultDivision) {
        //         return res.status(500).json({ success: false, message: 'No administrative division found.' });
        //     }
        //     userDivisionId = defaultDivision._id;
        // }

        // Hash password
        // const salt = await bcrypt.genSalt(10);
        // const password_hash = await bcrypt.hash(password, salt);

        // Create User
        // const newUser = new User({
        //     username,
        //     email,
        //     password_hash,
        //     full_name,
        //     contact_number,
        //     address,
        //     role_id: farmerRole._id,
        //     division_id: userDivisionId
        // });
        // await newUser.save();


        console.log(existingUserForFarmerByNIC._id);
        // Create Farmer
        const newFarmer = new Farmer({
            user_id: existingUserForFarmerByNIC._id,
            nic,
            age,
            gender,
            education_level,
            occupation,
            ethnicity,
            religion,
            marital_status,
            household_size,
            ldi_officer_id: req.user.id // Attach the LDI officer's user ID
        });

        console.log(newFarmer);
        await newFarmer.save();

        // Populate user details for response
        const populatedFarmer = await Farmer.findById(newFarmer._id).populate({
            path: 'user_id',
            select: 'full_name email contact_number address',
            model: User
        });

        res.status(201).json({ success: true, data: populatedFarmer });
    } catch (error) {
        console.error('Error creating farmer:', error);
        res.status(500).json({ success: false, message: 'Error creating farmer', error: error.message });
    }
};

// Fetch user details by NIC
const getUserByNIC = async (req, res) => {
    try {
        const { nic } = req.params;
        if (!nic) {
            return res.status(400).json({ success: false, message: 'NIC is required.' });
        }
        const user = await User.findOne({ nic: nic });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user by NIC', error: error.message });
    }
};

const createFarm = async (req, res) => {
    try {
        const {
            farm_registration_number,
            farmer_id,
            farm_name,
            location_address,
            farm_type,
            registration_date
        } = req.body;

        if (!farm_registration_number || !farmer_id || !location_address || !farm_type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: farm_registration_number, farmer_id, location_address, farm_type'
            });
        }

        const existingFarm = await Farm.findOne({ farm_registration_number });
        if (existingFarm) {
            return res.status(409).json({
                success: false,
                message: 'Farm with this registration number already exists'
            });
        }

        const farmer = await Farmer.findById(farmer_id).populate('user_id');
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        const divisionId = farmer.user_id?.division_id;

        const newFarm = new Farm({
            farm_registration_number,
            farmer_id,
            farm_name,
            location_address,
            gps_coordinates: null,
            gn_division_id: divisionId || null,
            farm_type,
            registration_date: registration_date || new Date(),
            registered_by: req.user._id,
            is_active: true
        });

        await newFarm.save();

        const populatedFarm = await Farm.findById(newFarm._id)
            .populate({
                path: 'farmer_id',
                populate: {
                    path: 'user_id',
                    select: 'full_name email contact_number',
                    model: User
                }
            })
            .populate({
                path: 'gn_division_id',
                select: 'division_name',
                model: 'AdministrativeDivision'
            });

        res.status(201).json({
            success: true,
            data: populatedFarm,
            message: 'Farm created successfully'
        });
    } catch (error) {
        console.error('Error creating farm:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating farm',
            error: error.message
        });
    }
};

// Update farmer details
const updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            age,
            gender,
            education_level,
            occupation,
            ethnicity,
            religion,
            marital_status,
            household_size
        } = req.body;

        const farmer = await Farmer.findById(id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // Check if the farmer belongs to the LDI officer
        if (farmer.ldi_officer_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update farmers under your supervision.'
            });
        }

        // Update farmer fields
        if (age !== undefined) farmer.age = age;
        if (gender !== undefined) farmer.gender = gender;
        if (education_level !== undefined) farmer.education_level = education_level;
        if (occupation !== undefined) farmer.occupation = occupation;
        if (ethnicity !== undefined) farmer.ethnicity = ethnicity;
        if (religion !== undefined) farmer.religion = religion;
        if (marital_status !== undefined) farmer.marital_status = marital_status;
        if (household_size !== undefined) farmer.household_size = household_size;

        await farmer.save();

        // Populate user details for response
        const updatedFarmer = await Farmer.findById(id).populate({
            path: 'user_id',
            select: 'full_name email contact_number address',
            model: User
        });

        res.status(200).json({
            success: true,
            data: updatedFarmer,
            message: 'Farmer updated successfully'
        });
    } catch (error) {
        console.error('Error updating farmer:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating farmer',
            error: error.message
        });
    }
};

// Update farm details
const updateFarm = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            farm_name,
            location_address,
            farm_type,
            is_active
        } = req.body;

        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Check if the farm belongs to a farmer under the LDI officer
        const farmer = await Farmer.findById(farm.farmer_id);
        if (!farmer || farmer.ldi_officer_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update farms under your supervision.'
            });
        }

        // Update farm fields
        if (farm_name !== undefined) farm.farm_name = farm_name;
        if (location_address !== undefined) farm.location_address = location_address;
        if (farm_type !== undefined) farm.farm_type = farm_type;
        if (is_active !== undefined) farm.is_active = is_active;

        await farm.save();

        // Populate details for response
        const updatedFarm = await Farm.findById(id)
            .populate({
                path: 'farmer_id',
                populate: {
                    path: 'user_id',
                    select: 'full_name email contact_number',
                    model: User
                }
            })
            .populate({
                path: 'gn_division_id',
                select: 'division_name',
                model: 'AdministrativeDivision'
            });

        res.status(200).json({
            success: true,
            data: updatedFarm,
            message: 'Farm updated successfully'
        });
    } catch (error) {
        console.error('Error updating farm:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating farm',
            error: error.message
        });
    }
};

const getFarmById = async (req, res) => {
    try {
        const { id } = req.params;

        const farm = await Farm.findById(id)
            .populate({
                path: 'farmer_id',
                populate: {
                    path: 'user_id',
                    select: 'full_name email contact_number',
                    model: User
                }
            })
            .populate({
                path: 'gn_division_id',
                select: 'division_name',
                model: 'AdministrativeDivision'
            });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        res.status(200).json({
            success: true,
            data: farm
        });
    } catch (error) {
        console.error('Error fetching farm details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farm details',
            error: error.message
        });
    }
};

const getAnimalsByFarmId = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if farm exists
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Get animals for this farm
        const Animal = require('../models/animals');
        const animals = await Animal.find({ farm_id: id })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: animals
        });
    } catch (error) {
        console.error('Error fetching animals by farm:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching animals',
            error: error.message
        });
    }
};

const getFarmerById = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await Farmer.findById(id)
            .populate({
                path: 'user_id',
                select: 'full_name email contact_number address profileImage',
                model: User
            });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer details',
            error: error.message
        });
    }
};

const getValidationsByLdiId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching validations for LDI officer ID:', id);

        const ldiOfficer = await User.findById(id);
        if (!ldiOfficer) {
            return res.status(404).json({
                success: false,
                message: 'LDI officer not found'
            });
        }

        const farmers = await Farmer.find({ ldi_officer_id: id }).select('_id user_id');
        console.log('Farmers under LDI officer:', farmers);
        const farmerIds = farmers.map(farmer => farmer._id);

        console.log('Farmer IDs:', farmerIds);

        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).select('_id');
        const farmIds = farms.map(farm => farm._id);
        console.log('Farm IDs:', farms);
        const pendingValidations = await FarmerMonthlyReport.find({
            farm_id: { $in: farmIds },
        }).populate({
            path: 'farm_id',
            select: 'farm_name farm_registration_number location_address'
        }).sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: pendingValidations
        });
    } catch (error) {
        console.error('Error fetching validations by LDI officer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching validations',
            error: error.message
        });
    }
}

const getFarmsByFarmerId = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if farmer exists
        const farmer = await Farmer.findById(id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        // Get farms for this farmer
        const farms = await Farm.find({ farmer_id: id })
            .populate({
                path: 'gn_division_id',
                select: 'division_name',
                model: 'AdministrativeDivision'
            })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: farms
        });
    } catch (error) {
        console.error('Error fetching farms by farmer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farms',
            error: error.message
        });
    }
};

const getMilkProductionByFarmId = async (req, res) => {
    try {
        const { id } = req.params; // farm_id

        // First check if farm exists
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Get approved monthly reports for this farm
        const milkProductionData = await FarmerMonthlyReport.find({
            farm_id: id,
            validation_status: 'Approved'
        })
        .populate({
            path: 'farm_id',
            select: 'farm_name farm_registration_number'
        })
        .sort({ report_month: -1, created_at: -1 });

        // Format the data for frontend
        const formattedData = milkProductionData.map(record => ({
            _id: record._id,
            date: record.report_month,
            total_milk_production: record.total_milk_production || 0,
            report_month: record.report_month,
            submitted_date: record.submitted_date,
            validation_date: record.validation_date,
            farm_name: record.farm_id?.farm_name || 'Unknown Farm',
            events_reported: {
                birth: record.birth_reported,
                death: record.death_reported,
                purchase: record.purchase_reported,
                sale: record.sale_reported,
                company_change: record.company_change_reported
            }
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching milk production data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching milk production data',
            error: error.message
        });
    }
};

const getAIByFarmId = async (req, res) => {
    try {
        const { id } = req.params; // farm_id

        // First check if farm exists
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Get AI records for this farm
        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiData = await ArtificialInsemination.find({
            farm_id: id
        })
        .populate({
            path: 'animal_id',
            select: 'animal_tag animal_type'
        })
        .populate({
            path: 'performed_by',
            select: 'full_name'
        })
        .sort({ ai_date: -1 });

        // Format the data for frontend
        const formattedData = aiData.map(record => ({
            _id: record._id,
            ai_date: record.ai_date,
            animal_tag: record.animal_id?.animal_tag || 'Unknown Animal',
            animal_type: record.animal_id?.animal_type || 'Unknown',
            bull_breed: record.bull_breed || 'N/A',
            technician_name: record.technician_name || 'N/A',
            technician_code: record.technician_code || 'N/A',
            semen_code: record.semen_code || 'N/A',
            pregnancy_status: record.pregnancy_status,
            pregnancy_check_date: record.pregnancy_check_date,
            expected_calving_date: record.expected_calving_date,
            performed_by: record.performed_by?.full_name || 'Unknown',
            created_at: record.created_at
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching AI data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching AI data',
            error: error.message
        });
    }
};

// Get all AI records for all farms under LDI officer
const getAllAIRecords = async (req, res) => {
    try {
        // First, find all farmers under the LDI officer
        const farmers = await Farmer.find({ ldi_officer_id: req.user._id }).select('_id');
        const farmerIds = farmers.map(farmer => farmer._id);

        // Then find all farms under these farmers
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).select('_id');
        const farmIds = farms.map(farm => farm._id);

        // Get AI records for all these farms
        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiData = await ArtificialInsemination.find({
            farm_id: { $in: farmIds }
        })
        .populate({
            path: 'animal_id',
            select: 'animal_tag animal_type'
        })
        .populate({
            path: 'performed_by',
            select: 'full_name'
        })
        .populate({
            path: 'farm_id',
            select: 'farm_name'
        })
        .sort({ ai_date: -1 });

        // Format the data for frontend
        const formattedData = aiData.map(record => ({
            _id: record._id,
            farm_id: record.farm_id._id,
            farm_name: record.farm_id?.farm_name || 'Unknown Farm',
            ai_date: record.ai_date,
            animal_tag: record.animal_id?.animal_tag || 'Unknown Animal',
            animal_type: record.animal_id?.animal_type || 'Unknown',
            bull_breed: record.bull_breed || 'N/A',
            technician_name: record.technician_name || 'N/A',
            technician_code: record.technician_code || 'N/A',
            semen_code: record.semen_code || 'N/A',
            pregnancy_status: record.pregnancy_status,
            pregnancy_check_date: record.pregnancy_check_date,
            expected_calving_date: record.expected_calving_date,
            performed_by: record.performed_by?.full_name || 'Unknown',
            created_at: record.created_at
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching all AI data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching AI data',
            error: error.message
        });
    }
};

// Get all milk production data for all farms under LDI officer
const getAllMilkProduction = async (req, res) => {
    try {
        // First, find all farmers under the LDI officer
        const farmers = await Farmer.find({ ldi_officer_id: req.user._id }).select('_id');
        const farmerIds = farmers.map(farmer => farmer._id);

        // Then find all farms under these farmers
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).select('_id');
        const farmIds = farms.map(farm => farm._id);

        // Get milk production data for all these farms
        const FarmerMonthlyReport = require('../models/farmer_monthly_reports');
        const milkData = await FarmerMonthlyReport.find({
            farm_id: { $in: farmIds },
            is_approved: true
        })
        .populate({
            path: 'farm_id',
            select: 'farm_name'
        })
        .sort({ report_month: -1 });

        // Format the data for frontend
        const formattedData = milkData.map(record => ({
            _id: record._id,
            farm_id: record.farm_id._id,
            farm_name: record.farm_id?.farm_name || 'Unknown Farm',
            report_month: record.report_month,
            total_milk_production: record.total_milk_production || 0,
            submitted_date: record.submitted_date,
            validation_date: record.validation_date,
            events_reported: record.events_reported || {},
            is_approved: record.is_approved
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching all milk production data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching milk production data',
            error: error.message
        });
    }
};

const createAIRecord = async (req, res) => {
    try {
        const { farm_id, animal_id, ai_date, bull_breed, technician_name, technician_code, semen_code } = req.body;
        const performed_by = req.user._id;

        // Validate required fields
        if (!farm_id || !animal_id || !ai_date || !bull_breed || !technician_name) {
            return res.status(400).json({
                success: false,
                message: 'Farm ID, Animal ID, AI Date, Bull Breed, and Technician Name are required'
            });
        }

        // Check if farm exists
        const farm = await Farm.findById(farm_id);
        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Check if animal exists and belongs to the farm
        const Animal = require('../models/animals');
        const animal = await Animal.findOne({ _id: animal_id, farm_id: farm_id });
        if (!animal) {
            return res.status(404).json({
                success: false,
                message: 'Animal not found or does not belong to this farm'
            });
        }

        // Calculate pregnancy check date (30 days after AI date)
        const pregnancyCheckDate = new Date(ai_date);
        pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + 30);

        // Calculate expected calving date (283 days after AI date)
        const expectedCalvingDate = new Date(ai_date);
        expectedCalvingDate.setDate(expectedCalvingDate.getDate() + 283);

        const ArtificialInsemination = require('../models/artificial_insemination');
        const newAIRecord = new ArtificialInsemination({
            farm_id,
            animal_id,
            ai_date,
            bull_breed,
            technician_name,
            technician_code: technician_code || '',
            semen_code: semen_code || '',
            pregnancy_status: 'Unknown',
            pregnancy_check_date: pregnancyCheckDate,
            expected_calving_date: expectedCalvingDate,
            performed_by
        });

        await newAIRecord.save();

        res.status(201).json({
            success: true,
            message: 'AI record created successfully',
            data: newAIRecord
        });
    } catch (error) {
        console.error('Error creating AI record:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating AI record',
            error: error.message
        });
    }
};

const updatePregnancyStatus = async (req, res) => {
    try {
        const { id } = req.params; // AI record ID
        const { pregnancy_status } = req.body;

        if (!pregnancy_status || !['Unknown', 'Pregnant', 'Not Pregnant', 'Aborted'].includes(pregnancy_status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid pregnancy status is required'
            });
        }

        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiRecord = await ArtificialInsemination.findById(id);
        
        if (!aiRecord) {
            return res.status(404).json({
                success: false,
                message: 'AI record not found'
            });
        }

        aiRecord.pregnancy_status = pregnancy_status;
        await aiRecord.save();

        res.status(200).json({
            success: true,
            message: 'Pregnancy status updated successfully',
            data: aiRecord
        });
    } catch (error) {
        console.error('Error updating pregnancy status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating pregnancy status',
            error: error.message
        });
    }
};

const updateAIRecord = async (req, res) => {
    try {
        const { id } = req.params; // AI record ID
        const { ai_date, bull_breed, technician_name, technician_code, semen_code } = req.body;

        if (!ai_date || !bull_breed || !technician_name) {
            return res.status(400).json({
                success: false,
                message: 'AI Date, Bull Breed, and Technician Name are required'
            });
        }

        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiRecord = await ArtificialInsemination.findById(id);
        
        if (!aiRecord) {
            return res.status(404).json({
                success: false,
                message: 'AI record not found'
            });
        }

        // Calculate new dates based on updated AI date
        const pregnancyCheckDate = new Date(ai_date);
        pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + 30);

        const expectedCalvingDate = new Date(ai_date);
        expectedCalvingDate.setDate(expectedCalvingDate.getDate() + 283);

        aiRecord.ai_date = ai_date;
        aiRecord.bull_breed = bull_breed;
        aiRecord.technician_name = technician_name;
        aiRecord.technician_code = technician_code || '';
        aiRecord.semen_code = semen_code || '';
        aiRecord.pregnancy_check_date = pregnancyCheckDate;
        aiRecord.expected_calving_date = expectedCalvingDate;

        await aiRecord.save();

        res.status(200).json({
            success: true,
            message: 'AI record updated successfully',
            data: aiRecord
        });
    } catch (error) {
        console.error('Error updating AI record:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating AI record',
            error: error.message
        });
    }
};

const getAIAttachments = async (req, res) => {
    try {
        const { id } = req.params; // AI record ID

        const AIAttachment = require('../models/ai_attachments');
        const attachments = await AIAttachment.find({ ai_record_id: id })
            .populate({
                path: 'uploaded_by',
                select: 'full_name username'
            })
            .sort({ uploaded_at: -1 });

        res.status(200).json({
            success: true,
            data: attachments
        });
    } catch (error) {
        console.error('Error fetching AI attachments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching AI attachments',
            error: error.message
        });
    }
};

const uploadAIAttachment = async (req, res) => {
    try {
        const { id } = req.params; // AI record ID
        const { description } = req.body;
        const uploaded_by = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Check if AI record exists
        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiRecord = await ArtificialInsemination.findById(id);
        if (!aiRecord) {
            return res.status(404).json({
                success: false,
                message: 'AI record not found'
            });
        }

        const AIAttachment = require('../models/ai_attachments');
        const newAttachment = new AIAttachment({
            ai_record_id: id,
            original_name: req.file.originalname,
            file_name: req.file.filename,
            file_path: req.file.path,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            description: description || '',
            uploaded_by
        });

        await newAttachment.save();

        // Populate the uploaded_by field for the response
        await newAttachment.populate({
            path: 'uploaded_by',
            select: 'full_name username'
        });

        res.status(201).json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: newAttachment
        });
    } catch (error) {
        console.error('Error uploading AI attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading AI attachment',
            error: error.message
        });
    }
};

const downloadAIAttachment = async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        const fs = require('fs');

        const AIAttachment = require('../models/ai_attachments');
        const attachment = await AIAttachment.findById(attachmentId);
        
        if (!attachment) {
            return res.status(404).json({
                success: false,
                message: 'Attachment not found'
            });
        }

        // Check if the attachment belongs to the AI record
        if (attachment.ai_record_id.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if file exists
        if (!fs.existsSync(attachment.file_path)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', attachment.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
        res.setHeader('Content-Length', attachment.file_size);

        // Stream the file
        const fileStream = fs.createReadStream(attachment.file_path);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming AI attachment file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error downloading file'
                });
            }
        });

    } catch (error) {
        console.error('Error downloading AI attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading AI attachment',
            error: error.message
        });
    }
};

const deleteAIAttachment = async (req, res) => {
    try {
        const { id, attachmentId } = req.params;

        const AIAttachment = require('../models/ai_attachments');
        const attachment = await AIAttachment.findById(attachmentId);
        
        if (!attachment) {
            return res.status(404).json({
                success: false,
                message: 'Attachment not found'
            });
        }

        // Check if the attachment belongs to the AI record
        if (attachment.ai_record_id.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Delete the file from the filesystem
        const fs = require('fs');
        if (fs.existsSync(attachment.file_path)) {
            fs.unlinkSync(attachment.file_path);
        }

        await AIAttachment.findByIdAndDelete(attachmentId);

        res.status(200).json({
            success: true,
            message: 'Attachment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting AI attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting AI attachment',
            error: error.message
        });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        console.log('Fetching dashboard data for LDI officer ID:', authenticatedUserId);

        // Get the LDI officer profile
        const ldiOfficer = await User.findById(authenticatedUserId);
        if (!ldiOfficer) {
            return res.status(404).json({
                success: false,
                message: 'LDI officer not found'
            });
        }

        // Get all farmers under this LDI officer
        const farmers = await Farmer.find({ ldi_officer_id: authenticatedUserId }).select('_id user_id');
        const farmerIds = farmers.map(farmer => farmer._id);
        const totalFarmers = farmers.length;

        console.log('Farmers under LDI officer:', totalFarmers);

        // Get all farms owned by these farmers
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).select('_id farm_name is_active');
        const farmIds = farms.map(farm => farm._id);
        const totalFarms = farms.length;
        const activeFarms = farms.filter(farm => farm.is_active).length;

        console.log('Farms under LDI officer:', totalFarms);

        // Get all animals in these farms
        const Animal = require('../models/animals');
        const totalAnimals = await Animal.countDocuments({
            farm_id: { $in: farmIds },
            current_status: 'Active'
        });

        // Get pending validations count
        const pendingValidationsCount = await FarmerMonthlyReport.countDocuments({
            farm_id: { $in: farmIds },
            validation_status: 'Pending'
        });

        // Get recent validations (last 5)
        const recentValidations = await FarmerMonthlyReport.find({
            farm_id: { $in: farmIds }
        })
        .populate({
            path: 'farm_id',
            select: 'farm_name'
        })
        .sort({ created_at: -1 })
        .limit(5);

        // Calculate total milk production from approved reports
        const approvedReports = await FarmerMonthlyReport.find({
            farm_id: { $in: farmIds },
            validation_status: 'Approved'
        });

        const totalMilkProduction = approvedReports.reduce((total, report) => {
            return total + (report.total_milk_production || 0);
        }, 0);

        const dashboardData = {
            stats: {
                totalFarmers,
                totalFarms,
                activeFarms,
                totalAnimals,
                pendingValidations: pendingValidationsCount,
                totalMilkProduction
            },
            recentValidations: recentValidations.map(validation => ({
                _id: validation._id,
                farm_name: validation.farm_id?.farm_name || 'Unknown Farm',
                report_month: validation.report_month,
                validation_status: validation.validation_status,
                total_milk_production: validation.total_milk_production || 0,
                submitted_date: validation.submitted_date
            }))
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// Memo functions
const getMemos = async (req, res) => {
    try {
        const user_id = req.user._id;
        const Memo = require('../models/memos');
        
        const memos = await Memo.find({ user_id })
            .sort({ created_at: -1 });

        res.json({
            success: true,
            data: memos
        });
    } catch (error) {
        console.error('Error fetching memos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching memos',
            error: error.message
        });
    }
};

const createMemo = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { title, content, priority, due_date } = req.body;
        
        const Memo = require('../models/memos');
        const newMemo = new Memo({
            user_id,
            title,
            content,
            priority: priority || 'medium',
            due_date: due_date || null
        });

        await newMemo.save();

        res.status(201).json({
            success: true,
            message: 'Memo created successfully',
            data: newMemo
        });
    } catch (error) {
        console.error('Error creating memo:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating memo',
            error: error.message
        });
    }
};

const updateMemo = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;
        const { title, content, status, priority, due_date } = req.body;
        
        const Memo = require('../models/memos');
        const memo = await Memo.findOne({ _id: id, user_id });
        
        if (!memo) {
            return res.status(404).json({
                success: false,
                message: 'Memo not found'
            });
        }

        memo.title = title || memo.title;
        memo.content = content || memo.content;
        memo.status = status || memo.status;
        memo.priority = priority || memo.priority;
        memo.due_date = due_date || memo.due_date;
        memo.updated_at = new Date();

        await memo.save();

        res.json({
            success: true,
            message: 'Memo updated successfully',
            data: memo
        });
    } catch (error) {
        console.error('Error updating memo:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating memo',
            error: error.message
        });
    }
};

const deleteMemo = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user._id;
        
        const Memo = require('../models/memos');
        const memo = await Memo.findOne({ _id: id, user_id });
        
        if (!memo) {
            return res.status(404).json({
                success: false,
                message: 'Memo not found'
            });
        }

        await Memo.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Memo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting memo:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting memo',
            error: error.message
        });
    }
};

module.exports = {
    getAllFarmers,
    getAllFarms,
    getFarmCount,
    getFarmerCount,
    createFarmer,
    updateFarmer,
    createFarm,
    updateFarm,
    getFarmById,
    getAnimalsByFarmId,
    getFarmerById,
    getFarmsByFarmerId,
    getUserByNIC,
    getValidationsByLdiId,
    getMilkProductionByFarmId,
    getAIByFarmId,
    getAllAIRecords,
    getAllMilkProduction,
    createAIRecord,
    updateAIRecord,
    updatePregnancyStatus,
    getAIAttachments,
    uploadAIAttachment,
    downloadAIAttachment,
    deleteAIAttachment,
    getDashboardData,
    getMemos,
    createMemo,
    updateMemo,
    deleteMemo
};
