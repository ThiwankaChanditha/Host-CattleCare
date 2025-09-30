const AnimalHealthRecord = require('../../models/animal_health_records');
const Animal = require('../../models/animals');
const Farm = require('../../models/farms');
const User = require('../../models/users');
const MedicalHistory = require('../../models/medicalhistory');

exports.getAnimalHistory = async (req, res) => { 
    try {
        const animalId = req.params.animalId;
        console.log('Fetching history for animal ID:', animalId);

        const history = await MedicalHistory.find({ animal_id: animalId })
            .populate('animal_id', 'animal_tag animal_type current_status')
            .populate('farm_id', 'farm_name')
            .populate('treated_by', 'full_name email')
            .sort({ treatment_date: -1 })
            .lean();

        if (!history || history.length === 0) {
            return res.status(404).json({ message: 'No health history found for this animal' });
        }

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching animal health history:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};