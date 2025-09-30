const express = require('express');
const router = express.Router();
const farmerReportController = require('../controllers/farmerReportController'); // Adjust path as needed
const { protect } = require('../middleware/authMiddleware'); // Adjust path to your auth middleware

// Make the GET /monthly/all route public (no authentication required)
router.get('/monthly/all', farmerReportController.getAllMonthlyReports);

// Apply authentication middleware to all other farmer report routes
router.use(protect);

// GET /api/farmer-reports/check-submission?farm_id=<id>&month=<date>
// Checks if a report for a given farm and month already exists.
router.get('/check-submission', farmerReportController.checkSubmissionStatus);

// POST /api/farmer-reports/monthly
// Submits a new monthly farmer report.
router.post('/monthly', farmerReportController.submitMonthlyReport);

// PUT /api/farmer-reports/:reportId/approve
// Approves a monthly farmer report.
router.put('/:reportId/approve', farmerReportController.approveMonthlyReport);

// PUT /api/farmer-reports/:reportId/reject
// Rejects a monthly farmer report.
router.put('/:reportId/reject', farmerReportController.rejectMonthlyReport);

module.exports = router;