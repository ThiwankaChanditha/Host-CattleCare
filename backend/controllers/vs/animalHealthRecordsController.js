const AnimalHealthRecord = require('../../models/animal_health_records');
const Animal = require('../../models/animals');
const Farm = require('../../models/farms');
const User = require('../../models/users');
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
            medicationId, // This might not be directly used if 'prescriptions' is the main way meds are added
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
            vitals, // Vitals are already structured correctly here
            prescriptions, // Prescriptions are already structured correctly here
            lab_reports
        });

        const savedRecord = await newRecord.save();

        // Helper function to normalize date fields for MedicalHistory
        const normalizeDateField = (dateValue) => {
            if (!dateValue) return dateValue;
            if (typeof dateValue === 'object' && dateValue.$date) {
                return new Date(dateValue.$date);
            }
            return new Date(dateValue);
        };

        // Create an entry in MedicalHistory for the newly added record
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
            recorded_at: savedRecord.created_at || Date.now() // Use created_at of the health record
        });

        res.status(201).json(savedRecord);
    } catch (error) {
        console.error('Error creating animal health record:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getAllFarmers = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;

        const userProfile = await User.findById(authenticatedUserId).select('division_id').lean();
        if (!userProfile || !userProfile.division_id) {
            return res.status(400).json({ message: "User's administrative division not found." });
        }

        const vsDivisionId = userProfile.division_id;
        const childDivisions = await AdministrativeDivision.find({ parent_division_id: vsDivisionId }).select('_id division_type').lean();
        const farmerDivisionIds = childDivisions.filter(div => div.division_type === 'GN').map(div => div._id);

        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
        const farmerRoleId = farmerRole ? farmerRole._id : null;

        if (!farmerRoleId) {
            return res.status(200).json([]);
        }

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

exports.getAllAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({}, '_id animal_tag animal_type').lean();
        res.status(200).json(animals);
    } catch (error) {
        console.error('Error fetching animals:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getFarmsByFarmerId = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const farmerId = req.query.farmerId;
        let filter = {};

        if (farmerId) {
            filter = { registered_by: farmerId };
        } else {
            const userProfile = await User.findById(authenticatedUserId).select('division_id').lean();
            if (!userProfile || !userProfile.division_id) {
                return res.status(400).json({ message: "User's administrative division not found." });
            }

            const vsDivisionId = userProfile.division_id;
            const childDivisions = await AdministrativeDivision.find({ parent_division_id: vsDivisionId }).select('_id division_type').lean();
            const farmerDivisionIds = childDivisions.filter(div => div.division_type === 'GN').map(div => div._id);

            const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
            const farmerRoleId = farmerRole ? farmerRole._id : null;

            let farmerIdsInVSDivision = [];
            if (farmerRoleId) {
                const farmers = await User.find({
                    division_id: { $in: farmerDivisionIds },
                    role_id: farmerRoleId
                }).select('_id').lean();
                farmerIdsInVSDivision = farmers.map(f => f._id);
            }

            if (farmerIdsInVSDivision.length === 0) {
                return res.status(200).json([]);
            }
            filter = { registered_by: { $in: farmerIdsInVSDivision } };
        }

        const farms = await Farm.find(filter, '_id farm_name').lean();
        res.status(200).json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getAnimalsByFarmId = async (req, res) => {
    try {
        const { farmId } = req.query;

        console.log('Fetching animals for farm ID:', farmId);

        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }

        const animals = await Animal.find({ farm_id: farmId })
            .populate('animal_type')
            .populate('farm_id')
            .lean();
        console.log('Animals found:', animals.length);
        if (!animals || animals.length === 0) {
            return res.status(404).json({ message: 'No animals found for this farm' });
        }
        console.log('Animals found:', animals.length);
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

exports.getFarmByAnimalId = async (req, res) => {
    try {
        const { animalId } = req.params;

        console.log('Fetching farm for animal ID:', animalId);

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