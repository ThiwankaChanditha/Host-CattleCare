const express = require("express");
const {
    createMilkProduction,
    getMilk,
    updateMilkProduction,
    deleteMilkProduction,
    getMilkProductionByDistrict,
    getTotalMilkProduction
} = require("../controllers/monthly_milk_production.controller");

const router = express.Router();

router.get("/", getMilk);
router.get("/by-district", getMilkProductionByDistrict);
router.get("/total", getTotalMilkProduction);
router.post("/", createMilkProduction);
router.put("/:id", updateMilkProduction);
router.delete("/:id", deleteMilkProduction);

module.exports = router;
