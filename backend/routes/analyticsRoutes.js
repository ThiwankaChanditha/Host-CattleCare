// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/farmer-analytics/:farmerId', protect, analyticsController.getFarmerAnalytics);

module.exports = router;