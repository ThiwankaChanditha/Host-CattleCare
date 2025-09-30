const express = require("express");
const {
    createMonthlyReport,
    getMonthlyReport,
    updateMonthlyReport,
    deleteMonthlyReport
} = require("../controllers/farmer_monthly_report.controller");

const router = express.Router();

router.get("/", getMonthlyReport);
router.post("/", createMonthlyReport);
router.put("/:id", updateMonthlyReport);
router.delete("/:id", deleteMonthlyReport);

module.exports = router;
