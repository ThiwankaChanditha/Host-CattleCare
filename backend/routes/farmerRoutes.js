// routes/farmerRoutes.js
const express = require('express');
const { getFarmerProfile, updateFarmerProfile } = require('../controllers/farmerController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

const router = express.Router();

router.route('/profile').get(protect, getFarmerProfile);
router.route('/profile').put(protect, updateFarmerProfile); // Or router.put('/profile', protect, updateFarmerProfile);

module.exports = router;