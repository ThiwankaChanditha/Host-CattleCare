const express = require('express');
const router = express.Router();
const animalDetailRecordsController = require('../../controllers/vs/animalDetailRecordsController');
const { protect } = require('../../middleware/authMiddleware');
const { authorizeRole } = require('../../middleware/roleMiddleware');

router.get('/:animalId/health-record/:id', protect, authorizeRole(['veterinarian']), animalDetailRecordsController.getHealthRecordById);
router.put('/:animalId/health-record/:id', protect, authorizeRole(['veterinarian']), animalDetailRecordsController.updateHealthRecord);
router.delete('/:animalId/health-record/:id', protect, authorizeRole(['veterinarian']), animalDetailRecordsController.deleteHealthRecord);


module.exports = router;