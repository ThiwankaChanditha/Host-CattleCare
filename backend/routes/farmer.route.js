const express = require('express');
const { createFarmer, getFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmer.controller');

const router = express.Router();

router.get("/", getFarmer);
router.post("/", createFarmer);
router.put("/:id", updateFarmer);
router.delete("/:id", deleteFarmer);

module.exports = router;
