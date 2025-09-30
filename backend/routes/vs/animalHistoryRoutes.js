const express = require('express');
const router = express.Router();
const animalHistoryController = require('../../controllers/vs/animalHistoryController');
const { protect } = require('../../middleware/authMiddleware');
const { authorizeRole } = require('../../middleware/roleMiddleware');

router.get('/:animalId/health-history', protect, authorizeRole(['veterinarian']), animalHistoryController.getAnimalHistory);

module.exports = router;
