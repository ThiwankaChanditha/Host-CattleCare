const AnimalHealthRecord = require('../../models/animal_health_records');
const Animal = require('../../models/animals');
const Farm = require('../../models/farms');
const User = require('../../models/users');
const Farmer = require('../../models/farmers');
const MedicalHistory = require('../../models/medicalhistory');
const UserRole = require('../../models/user_roles');
const AdministrativeDivision = require('../../models/administrative_divisions');

exports.getAllHealthRecords = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';

        const filter = { treated_by: authenticatedUserId };

        if (search) {
            filter.$or = [
                { health_issue: { $regex: search, $options: 'i' } },
                { diagnosis: { $regex: search, $options: 'i' } },
                { treatment: { $regex: search, $options: 'i' } }
            ];
        }

        const totalRecords = await AnimalHealthRecord.countDocuments(filter);

        const records = await AnimalHealthRecord.find(filter)
            .populate('animal_id', 'animal_tag animal_type current_status')
            .populate('farm_id', 'farm_name')
            .populate('treated_by', 'full_name email')
            .populate('vitalsID')
            .populate('medicationIds')
            .sort({ treatment_date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            records
        });
    } catch (error) {
        console.error('Error fetching animal health records:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.createHealthRecord = async (req, res) => {
    try {
        const treatedBy = req.user._id;
        const {
            animal_id,
            farm_id,
            health_issue,
            diagnosis,
            treatment,
            treatment_date,
            follow_up_date,
            vaccineId,
            medicationId,
            recovery_status,
            cost,
            vitals,
            prescriptions,
            lab_reports
        } = req.body;

        if (!animal_id || !farm_id || !health_issue || !treatment_date) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        const newRecord = new AnimalHealthRecord({
            animal_id,
            farm_id,
            health_issue,
            diagnosis,
            treatment,
            treatment_date,
            follow_up_date,
            vaccineId,
            medicationId,
            recovery_status,
            cost,
            treated_by: treatedBy,
            vitals,
            prescriptions,
            lab_reports
        });

        const savedRecord = await newRecord.save();

        // Helper function to normalize date fields
        const normalizeDateField = (dateValue) => {
            if (!dateValue) return dateValue;
            if (typeof dateValue === 'object' && dateValue.$date) {
                return new Date(dateValue.$date);
            }
            return new Date(dateValue);
        };

        // Create corresponding MedicalHistory entry
        await MedicalHistory.create({
            animalHealthRecordId: savedRecord._id,
            animal_id: savedRecord.animal_id,
            farm_id: savedRecord.farm_id,
            health_issue: savedRecord.health_issue,
            diagnosis: savedRecord.diagnosis,
            treatment: savedRecord.treatment,
            treatment_date: normalizeDateField(savedRecord.treatment_date),
            treated_by: savedRecord.treated_by,
            follow_up_date: savedRecord.follow_up_date ? normalizeDateField(savedRecord.follow_up_date) : undefined,
            recovery_status: savedRecord.recovery_status,
            cost: savedRecord.cost,
            vitals: savedRecord.vitals ? {
                temperature: savedRecord.vitals.temperature,
                heart_rate: savedRecord.vitals.heart_rate,
                respiration_rate: savedRecord.vitals.respiration_rate,
                weight: savedRecord.vitals.weight,
                notes: savedRecord.vitals.notes || ''
            } : null,
            medication: (savedRecord.prescriptions || []).map(p => ({
                medication_name: p.medication,
                dosage: p.dosage,
                frequency: p.frequency,
                administration_method: p.administrationMethod,
                start_date: normalizeDateField(p.start_date),
                end_date: normalizeDateField(p.end_date),
                notes: p.notes || ''
            })),
            recorded_at: savedRecord.created_at || Date.now()
        });

        res.status(201).json(savedRecord);
    } catch (error) {
        console.error('Error creating animal health record:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getFarmerDivisionIds = async (vsDivisionId) => {
    // Get LDI divisions under VS
    const ldiDivisions = await AdministrativeDivision.find({
        parent_division_id: vsDivisionId,
        division_type: { $in: ['LDI', 'ldi_officer'] }
    }).select('_id').lean();

    const ldiDivisionIds = ldiDivisions.map(div => div._id);

    if (ldiDivisionIds.length === 0) {
        return [];
    }

    // Get GN (farmer) divisions under LDI divisions
    const farmerDivisions = await AdministrativeDivision.find({
        parent_division_id: { $in: ldiDivisionIds },
        division_type: 'GN'
    }).select('_id').lean();

    return farmerDivisions.map(div => div._id);
};

// Get farmer role ID
const getFarmerRoleId = async () => {
    const farmerRole = await UserRole.findOne({
        role_name: { $in: ['Farmer', 'farmer'] }
    }).select('_id').lean();

    return farmerRole ? farmerRole._id : null;
};


exports.getAllFarmers = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;

        // 🔹 Step 1: Get VS division of logged-in user
        const userProfile = await User.findById(authenticatedUserId).select('division_id').lean();
        if (!userProfile || !userProfile.division_id) {
            return res.status(400).json({ message: "User's administrative division not found." });
        }

        const vsDivisionId = userProfile.division_id;

        // 🔹 Step 2: Get all LDI divisions under this VS
        const ldiDivisions = await AdministrativeDivision.find({
            parent_division_id: vsDivisionId,
            division_type: { $in: ['LDI', 'ldi_officer'] } // ✅ case variation support
        }).select('_id division_type').lean();

        const ldiDivisionIds = ldiDivisions.map(div => div._id);
        console.log("LDI divisions: ", ldiDivisionIds);

        // 🔹 Step 3: Get all Farmer divisions (GN) under those LDI divisions
        const farmerDivisions = await AdministrativeDivision.find({
            parent_division_id: { $in: ldiDivisionIds },
            division_type: 'GN'
        }).select('_id division_type').lean();

        const farmerDivisionIds = farmerDivisions.map(div => div._id); // ✅ FIXED missing mapping

        // 🔹 Step 4: Get Farmer role
        const farmerRole = await UserRole.findOne({ role_name: { $in: ['Farmer', 'farmer'] } });
        const farmerRoleId = farmerRole ? farmerRole._id : null;

        if (!farmerRoleId) {
            return res.status(200).json([]);
        }

        // 🔹 Step 5: Find all Farmers in those GN divisions
        const farmers = await User.find({
            division_id: { $in: farmerDivisionIds },
            role_id: farmerRoleId
        }).select('_id full_name email').lean();

        res.status(200).json(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getFarmersByVsId = async (req, res) => {
    try {
        const { vsId } = req.params;
        console.log('Fetching farmers for VS ID:', vsId);

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await User.findOne({ _id: vsId }).select('division_id').lean();

        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const farmerDivisionIds = await getFarmerDivisionIds(vsData.division_id);
        const farmerRoleId = await getFarmerRoleId();

        if (!farmerRoleId || farmerDivisionIds.length === 0) {
            return res.status(404).json({
                message: 'No farmers found under this veterinary service',
                farmers: [],
                count: 0,
                summary: { totalFarmers: 0, totalFarms: 0, totalAnimals: 0, totalHealthRecords: 0 }
            });
        }

        const farmerUsers = await User.find({
            role_id: farmerRoleId,
            division_id: { $in: farmerDivisionIds }
        }).select('_id full_name email division_id').lean();

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.status(404).json({
                message: 'No farmers found under these divisions',
                farmers: [],
                count: 0,
                summary: { totalFarmers: 0, totalFarms: 0, totalAnimals: 0, totalHealthRecords: 0 }
            });
        }

        const farmerUserIds = farmerUsers.map(user => user._id);

        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } })
            .populate({
                path: 'user_id',
                select: '_id full_name email nic division_id contact_number address created_at'
            })
            .lean();

        const farmerIds = farmers.map(f => f._id);
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        const farmIds = farms.map(f => f._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        const animalIds = animals.map(a => a._id);
        const medicalHistories = await MedicalHistory.find({ animal_id: { $in: animalIds } }).lean();

        const farmersWithCounts = farmers.map(farmer => {
            const userData = farmer.user_id || {};
            const farmerFarms = farms.filter(farm => farm.farmer_id.toString() === farmer._id.toString());
            const farmerFarmIds = farmerFarms.map(f => f._id.toString());
            const farmerAnimals = animals.filter(a => farmerFarmIds.includes(a.farm_id.toString()));

            return {
                _id: farmer._id,
                full_name: userData.full_name || 'Unnamed Farmer',
                email: userData.email || '',
                created_at: userData.created_at || new Date(),
                contact_number: userData.contact_number || '',
                address: userData.address || '',
                nic_number: userData.nic || '',
                farmCount: farmerFarms.length,
                animalCount: farmerAnimals.length
            };
        });

        res.json({
            farmers: farmersWithCounts,
            count: farmersWithCounts.length,
            summary: {
                totalFarmers: farmersWithCounts.length,
                totalFarms: farms.length,
                totalAnimals: animals.length,
                totalHealthRecords: medicalHistories.length
            }
        });

    } catch (error) {
        console.error('Error fetching farmers by VS ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            farmers: []
        });
    }
};

exports.getFarmerDetails = async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log('Fetching details for Farmer ID:', farmerId);

        if (!farmerId) {
            return res.status(400).json({ message: 'Farmer ID is required' });
        }

        const farmer = await Farmer.findById(farmerId)
            .populate('user_id')
            .lean();

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const farms = await Farm.find({ farmer_id: farmerId }).lean();
        const farmIds = farms.map(farm => farm._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();

        res.json({
            farmer,
            farms: farms || [],
            animals: animals || [],
            summary: {
                farmCount: farms ? farms.length : 0,
                animalCount: animals ? animals.length : 0
            }
        });

    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================
// FARMS
// ============================================

exports.getFarmsByFarmerId = async (req, res) => {
    try {
        const userId = req.query.farmerId; // This is user_id, not farmer._id
        console.log('getFarmsByFarmerId called with userId:', userId);

        if (!userId) {
            console.log('No farmer userId provided');
            return res.status(400).json({ message: 'Farmer user ID is required' });
        }

        // Find farmer document by user_id
        const farmer = await Farmer.findOne({ user_id: userId }).select('_id').lean();
        if (!farmer) {
            console.log(`No farmer found for user_id: ${userId}`);
            return res.status(404).json({ message: 'Farmer not found for given user ID' });
        }

        // Query farms by farmer._id
        const farms = await Farm.find({ farmer_id: farmer._id }, '_id farm_name').lean();
        console.log(`Farms found for farmer._id ${farmer._id}:`, farms);

        res.status(200).json(farms);
    } catch (error) {
        console.error('Error fetching farms by farmer user ID:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getFarmByAnimalId = async (req, res) => {
    try {
        const { animalId } = req.params;

        if (!animalId) {
            return res.status(400).json({ message: 'Animal ID is required' });
        }

        const animal = await Animal.findById(animalId)
            .populate('farm_id')
            .populate('animal_type')
            .lean();

        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        if (!animal.farm_id) {
            return res.status(404).json({ message: 'Farm not associated with this animal' });
        }

        res.status(200).json({
            success: true,
            farm: animal.farm_id,
            animal: {
                id: animal._id,
                animal_tag: animal.animal_tag,
                animal_type: animal.animal_type
            }
        });
    } catch (error) {
        console.error('Error fetching farm by animal ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getAllAnimals = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;

        const userProfile = await User.findById(authenticatedUserId).select('division_id').lean();
        if (!userProfile || !userProfile.division_id) {
            return res.status(400).json({ message: "User's administrative division not found." });
        }

        const vsDivisionId = userProfile.division_id;

        const ldiDivisions = await AdministrativeDivision.find({
            parent_division_id: vsDivisionId,
            division_type: { $in: ['LDI', 'ldi_officer'] }
        }).select('_id').lean();
        const ldiDivisionIds = ldiDivisions.map(div => div._id);

        const farmerDivisions = await AdministrativeDivision.find({
            parent_division_id: { $in: ldiDivisionIds },
            division_type: 'GN'
        }).select('_id').lean();
        const farmerDivisionIds = farmerDivisions.map(div => div._id);

        const farmerRole = await UserRole.findOne({ role_name: { $in: ['Farmer', 'farmer'] } });
        const farmerRoleId = farmerRole ? farmerRole._id : null;

        if (!farmerRoleId) {
            return res.status(200).json([]);
        }

        const farmers = await User.find({
            division_id: { $in: farmerDivisionIds },
            role_id: farmerRoleId
        }).select('_id').lean();
        const farmerIds = farmers.map(f => f._id);

        const farms = await Farm.find({ registered_by: { $in: farmerIds } }).select('_id').lean();
        const farmIds = farms.map(f => f._id);

        const animals = await Animal.find({ farm_id: { $in: farmIds } }, '_id animal_tag animal_type').lean();

        res.status(200).json(animals);
    } catch (error) {
        console.error('Error fetching animals:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getAnimalsByFarmId = async (req, res) => {
    try {
        const { farmId } = req.query;

        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }

        const animals = await Animal.find({ farm_id: farmId })
            .populate('animal_type')
            .populate('farm_id')
            .lean();

        if (!animals || animals.length === 0) {
            return res.status(404).json({
                message: 'No animals found for this farm',
                success: true,
                count: 0,
                animals: []
            });
        }

        res.status(200).json({
            success: true,
            count: animals.length,
            animals: animals
        });
    } catch (error) {
        console.error('Error fetching animals by farm ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getMedicalHistoryByAnimalId = async (req, res) => {
    try {
        const { animalId } = req.params;

        if (!animalId) {
            return res.status(400).json({ message: 'Animal ID is required' });
        }

        const medicalHistories = await MedicalHistory.find({ animal_id: animalId })
            .populate('animal_id', 'animal_name tag_number')
            .populate('treated_by', 'full_name email')
            .sort({ treatment_date: -1 })
            .lean();

        res.json({
            medicalHistories: medicalHistories || [],
            count: medicalHistories ? medicalHistories.length : 0
        });

    } catch (error) {
        console.error('Error fetching medical history by animal ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            medicalHistories: []
        });
    }
};


exports.getComprehensiveReportData = async (req, res) => {
    try {
        const { vsId } = req.params;

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await User.findOne({ _id: vsId }).select('division_id').lean();
        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const farmerDivisionIds = await getFarmerDivisionIds(vsData.division_id);
        const farmerRoleId = await getFarmerRoleId();

        if (!farmerRoleId || farmerDivisionIds.length === 0) {
            return res.json({
                farmers: [], farms: [], animals: [], medicalHistories: [],
                summary: { farmerCount: 0, farmCount: 0, animalCount: 0, recordCount: 0 }
            });
        }

        const farmerUsers = await User.find({
            role_id: farmerRoleId,
            division_id: { $in: farmerDivisionIds }
        }).select('_id').lean();

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.json({
                farmers: [], farms: [], animals: [], medicalHistories: [],
                summary: { farmerCount: 0, farmCount: 0, animalCount: 0, recordCount: 0 }
            });
        }

        const farmerUserIds = farmerUsers.map(user => user._id);
        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } })
            .populate({
                path: 'user_id',
                select: '_id full_name email nic division_id contact_number address created_at'
            })
            .lean();

        const farmerIds = farmers.map(f => f._id);
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        const farmIds = farms.map(f => f._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        const animalIds = animals.map(a => a._id);
        const medicalHistories = await MedicalHistory.find({ animal_id: { $in: animalIds } })
            .sort({ treatment_date: -1 })
            .lean();

        res.json({
            farmers,
            farms,
            animals,
            medicalHistories,
            summary: {
                farmerCount: farmers.length,
                farmCount: farms.length,
                animalCount: animals.length,
                recordCount: medicalHistories.length
            }
        });

    } catch (error) {
        console.error('Error fetching comprehensive report data:', error);
        res.status(500).json({
            message: 'Internal server error',
            farmers: [], farms: [], animals: [], medicalHistories: []
        });
    }
};

exports.getDiseaseReportData = async (req, res) => {
    try {
        const { vsId } = req.params;

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await User.findOne({ _id: vsId }).select('division_id').lean();
        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const farmerDivisionIds = await getFarmerDivisionIds(vsData.division_id);
        const farmerRoleId = await getFarmerRoleId();

        if (!farmerRoleId || farmerDivisionIds.length === 0) {
            return res.json({
                diseaseSummary: [], diseaseTrends: [], recoveryRates: [], costAnalysis: [],
                summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
            });
        }

        const farmerUsers = await User.find({
            role_id: farmerRoleId,
            division_id: { $in: farmerDivisionIds }
        }).select('_id').lean();

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.json({
                diseaseSummary: [], diseaseTrends: [], recoveryRates: [], costAnalysis: [],
                summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
            });
        }

        const farmerUserIds = farmerUsers.map(u => u._id);
        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } }).lean();
        const farmerIds = farmers.map(f => f._id);
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        const farmIds = farms.map(f => f._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        const animalIds = animals.map(a => a._id);

        const medicalHistories = await MedicalHistory.find({
            animal_id: { $in: animalIds },
            treated_by: vsId
        }).lean();

        // Disease analytics
        const diseaseSummary = {};
        const monthlyTrends = {};
        const recoveryRates = {};
        const costAnalysis = {};

        medicalHistories.forEach(record => {
            const diagnosis = record.diagnosis || 'Unknown';
            const monthYear = record.treatment_date ?
                new Date(record.treatment_date).toISOString().slice(0, 7) : 'Unknown';

            // Disease summary
            if (!diseaseSummary[diagnosis]) {
                diseaseSummary[diagnosis] = {
                    count: 0,
                    totalCost: 0,
                    recoveryStatus: { Ongoing: 0, Healthy: 0, Critical: 0, Deceased: 0 }
                };
            }
            diseaseSummary[diagnosis].count++;
            diseaseSummary[diagnosis].totalCost += record.cost || 0;
            diseaseSummary[diagnosis].recoveryStatus[record.recovery_status || 'Ongoing']++;

            // Monthly trends
            if (!monthlyTrends[monthYear]) monthlyTrends[monthYear] = {};
            if (!monthlyTrends[monthYear][diagnosis]) monthlyTrends[monthYear][diagnosis] = 0;
            monthlyTrends[monthYear][diagnosis]++;

            // Recovery rates
            if (!recoveryRates[diagnosis]) {
                recoveryRates[diagnosis] = {
                    total: 0, recovered: 0, ongoing: 0, critical: 0, deceased: 0
                };
            }
            recoveryRates[diagnosis].total++;
            if (record.recovery_status === 'Healthy') recoveryRates[diagnosis].recovered++;
            if (record.recovery_status === 'Ongoing') recoveryRates[diagnosis].ongoing++;
            if (record.recovery_status === 'Critical') recoveryRates[diagnosis].critical++;
            if (record.recovery_status === 'Deceased') recoveryRates[diagnosis].deceased++;

            // Cost analysis
            if (!costAnalysis[diagnosis]) {
                costAnalysis[diagnosis] = { totalCost: 0, count: 0, averageCost: 0 };
            }
            costAnalysis[diagnosis].totalCost += record.cost || 0;
            costAnalysis[diagnosis].count++;
            costAnalysis[diagnosis].averageCost =
                costAnalysis[diagnosis].totalCost / costAnalysis[diagnosis].count;
        });

        res.json({
            diseaseSummary: Object.entries(diseaseSummary).map(([disease, data]) => ({
                disease, ...data
            })),
            diseaseTrends: Object.entries(monthlyTrends).map(([month, diseases]) => ({
                month, ...diseases
            })),
            recoveryRates: Object.entries(recoveryRates).map(([disease, data]) => ({
                disease,
                recoveryRate: data.total > 0 ? (data.recovered / data.total * 100).toFixed(1) : 0,
                ...data
            })),
            costAnalysis: Object.entries(costAnalysis).map(([disease, data]) => ({
                disease, ...data
            })),
            summary: {
                totalCases: medicalHistories.length,
                activeCases: medicalHistories.filter(h => h.recovery_status === 'Ongoing').length,
                recoveredCases: medicalHistories.filter(h => h.recovery_status === 'Healthy').length,
                criticalCases: medicalHistories.filter(h => h.recovery_status === 'Critical').length,
                deceasedCases: medicalHistories.filter(h => h.recovery_status === 'Deceased').length,
                totalCost: medicalHistories.reduce((sum, h) => sum + (h.cost || 0), 0)
            },
            medicalHistories
        });

    } catch (error) {
        console.error('Error fetching disease report data:', error);
        res.status(500).json({
            message: 'Internal server error',
            diseaseSummary: [], diseaseTrends: [], recoveryRates: [], costAnalysis: [],
            summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
        });
    }
};