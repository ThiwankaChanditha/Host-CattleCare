const express = require('express');
const router = express.Router();
const reportsController = require('../../controllers/vs/reportsController');

router.get('/medical-history/:animalId', reportsController.getMedicalHistoryByAnimalId);
router.get('/farmer-details/:farmerId', reportsController.getFarmerDetails);

router.get('/farmers/:vsId', reportsController.getFarmersByVsId);
router.get('/farms/:farmerId', reportsController.getFarmsByFarmerId);
router.get('/animals/:farmId', reportsController.getAnimalsByFarmId);
router.get('/comprehensive/:vsId', reportsController.getComprehensiveReportData);
router.get('/disease-report/:vsId', reportsController.getDiseaseReportData);

module.exports = router;
