const express = require('express');
const router = express.Router();
const { addAnimal, getAnimalsByFarm, getAllAnimalsForLDI, getAllBreeds, updateAnimal, getAIRecordsByAnimal } = require('../controllers/animalController');
const { protect } = require('../middleware/authMiddleware');

// Animal routes
router.post('/add', protect, addAnimal);
router.get('/farm/:farmId', protect, getAnimalsByFarm);
router.get('/farm/all', protect, getAllAnimalsForLDI);
router.get('/breeds', protect, getAllBreeds);
router.put('/update/:id', protect, updateAnimal);
router.get('/:animalId/ai-records', protect, getAIRecordsByAnimal);

module.exports = router; 