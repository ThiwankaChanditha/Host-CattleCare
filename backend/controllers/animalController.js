const Animal = require('../models/animals');
const Farm = require('../models/farms');
const AnimalBreed = require('../models/animal_breeds');

// Add new animal
const addAnimal = async (req, res) => {
    try {
        const {
            farm_id,
            animal_tag,
            animal_type,
            category,
            birth_date,
            gender,
            purchase_date,
            purchase_price,
            current_status = 'Active'
        } = req.body;

        // Validate required fields
        if (!farm_id || !animal_type || !category || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: farm_id, animal_type, category, gender'
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

        // Get or create default breed based on animal type
        let breed_id;
        let defaultBreed = await AnimalBreed.findOne({ 
            animal_type: animal_type,
            breed_name: { $regex: /default/i }
        });
        
        if (!defaultBreed) {
            // Create a default breed if none exists
            defaultBreed = new AnimalBreed({
                breed_name: `Default ${animal_type}`,
                animal_type: animal_type,
                origin_country: 'Sri Lanka',
                characteristics: 'Default breed for system use'
            });
            await defaultBreed.save();
        }
        
        breed_id = defaultBreed._id;

        // Create new animal
        const newAnimal = new Animal({
            farm_id,
            animal_tag,
            breed_id,
            animal_type,
            category,
            birth_date,
            gender,
            purchase_date,
            purchase_price,
            current_status,
            created_at: new Date(),
            updated_at: new Date()
        });

        await newAnimal.save();

        // Populate references for response
        const populatedAnimal = await Animal.findById(newAnimal._id)
            .populate('farm_id', 'farm_name farm_registration_number')
            .populate('breed_id', 'breed_name animal_type');

        res.status(201).json({
            success: true,
            data: populatedAnimal,
            message: 'Animal added successfully'
        });
    } catch (error) {
        console.error('Error adding animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding animal',
            error: error.message
        });
    }
};

// Get animals by farm ID
const getAnimalsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;
        
        const animals = await Animal.find({ farm_id: farmId })
            .populate('farm_id', 'farm_name farm_registration_number')
            .populate('breed_id', 'breed_name animal_type')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: animals
        });
    } catch (error) {
        console.error('Error fetching animals:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching animals',
            error: error.message
        });
    }
};

// Get all animals for all farms under LDI officer
const getAllAnimalsForLDI = async (req, res) => {
    try {
        // First, find all farmers under the LDI officer
        const Farmer = require('../models/farmers');
        const Farm = require('../models/farms');
        
        const farmers = await Farmer.find({ ldi_officer_id: req.user._id }).select('_id');
        const farmerIds = farmers.map(farmer => farmer._id);

        // Then find all farms under these farmers
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).select('_id');
        const farmIds = farms.map(farm => farm._id);

        // Get all animals for these farms
        const animals = await Animal.find({ farm_id: { $in: farmIds } })
            .populate('farm_id', 'farm_name farm_registration_number')
            .populate('breed_id', 'breed_name animal_type')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: animals
        });
    } catch (error) {
        console.error('Error fetching all animals:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching animals',
            error: error.message
        });
    }
};

// Get AI records by animal ID
const getAIRecordsByAnimal = async (req, res) => {
    try {
        const { animalId } = req.params;
        
        // Check if animal exists
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).json({
                success: false,
                message: 'Animal not found'
            });
        }

        // Get AI records for this animal
        const ArtificialInsemination = require('../models/artificial_insemination');
        const aiRecords = await ArtificialInsemination.find({
            animal_id: animalId
        })
        .populate({
            path: 'performed_by',
            select: 'full_name'
        })
        .sort({ ai_date: -1 });

        // Format the data for frontend
        const formattedData = aiRecords.map(record => ({
            _id: record._id,
            ai_date: record.ai_date,
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
        console.error('Error fetching AI records:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching AI records',
            error: error.message
        });
    }
};

// Get all breeds
const getAllBreeds = async (req, res) => {
    try {
        const breeds = await AnimalBreed.find().sort({ animal_type: 1, breed_name: 1 });
        
        res.status(200).json({
            success: true,
            data: breeds
        });
    } catch (error) {
        console.error('Error fetching breeds:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching breeds',
            error: error.message
        });
    }
};

// Update animal
const updateAnimal = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            animal_tag,
            animal_type,
            category,
            birth_date,
            gender,
            purchase_date,
            purchase_price,
            current_status
        } = req.body;

        // Validate required fields
        if (!animal_type || !category || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: animal_type, category, gender'
            });
        }

        // Check if animal exists
        const animal = await Animal.findById(id);
        if (!animal) {
            return res.status(404).json({
                success: false,
                message: 'Animal not found'
            });
        }

        // Update animal fields
        animal.animal_tag = animal_tag;
        animal.animal_type = animal_type;
        animal.category = category;
        animal.birth_date = birth_date;
        animal.gender = gender;
        animal.purchase_date = purchase_date;
        animal.purchase_price = purchase_price;
        animal.current_status = current_status;
        animal.updated_at = new Date();

        await animal.save();

        // Populate references for response
        const updatedAnimal = await Animal.findById(id)
            .populate('farm_id', 'farm_name farm_registration_number')
            .populate('breed_id', 'breed_name animal_type');

        res.status(200).json({
            success: true,
            data: updatedAnimal,
            message: 'Animal updated successfully'
        });
    } catch (error) {
        console.error('Error updating animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating animal',
            error: error.message
        });
    }
};

module.exports = {
    addAnimal,
    getAnimalsByFarm,
    getAllAnimalsForLDI,
    getAllBreeds,
    updateAnimal,
    getAIRecordsByAnimal
};
