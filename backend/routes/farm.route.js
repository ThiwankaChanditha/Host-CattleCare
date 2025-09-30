const express = require('express');
const {
    createFarm,
    getFarm,
    updateFarm,
    deleteFarm,
    getFarmClusterData,
    getTotalFarmsCount,
    getFarmTypeDistribution,
    getFarmDistributionByProvince
} = require('../controllers/farm.controller');

const router = express.Router();

router.get("/", getFarm);
router.get("/cluster", getFarmClusterData);
router.get("/total", getTotalFarmsCount);
router.get("/farm-type-distribution", getFarmTypeDistribution);
router.get("/distribution-by-province", getFarmDistributionByProvince);

router.post("/", createFarm);
router.put("/:id", updateFarm);
router.delete("/:id", deleteFarm);

module.exports = router;
