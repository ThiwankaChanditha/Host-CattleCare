const express = require('express');
const router = express.Router();
const animalHealthRecordsController = require('../../controllers/vs/animalHealthRecordsController');
const { protect } = require('../../middleware/authMiddleware');
const { authorizeRole } = require('../../middleware/roleMiddleware');

router.get('/', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.getAllHealthRecords);

router.post('/', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.createHealthRecord);

router.get('/animals', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.getAnimalsByFarmId);

router.get('/farms', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.getFarmsByFarmerId);

router.get('/farmers', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.getAllFarmers);

router.get('/animals/:animalId/farm', protect, authorizeRole(['veterinarian']), animalHealthRecordsController.getFarmByAnimalId);

module.exports = router;
