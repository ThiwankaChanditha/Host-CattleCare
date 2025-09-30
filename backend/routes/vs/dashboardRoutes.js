const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/vs/dashboardController');
const { protect } = require('../../middleware/authMiddleware');
const { authorizeRole } = require('../../middleware/roleMiddleware');

router.get('/', protect, authorizeRole(['veterinarian']), dashboardController.getDashboardData);
router.get('/settings', protect, authorizeRole(['veterinarian']), dashboardController.getUserSettings);
router.put('/settings', protect, authorizeRole(['veterinarian']), dashboardController.updateUserSettings);
router.put('/settings/password', protect, authorizeRole(['veterinarian']), dashboardController.updateUserPassword);

module.exports = router;
