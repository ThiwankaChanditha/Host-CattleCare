const MonthlyFarmerReport = require('../models/farmer_monthly_reports');
const mongoose = require('mongoose');
// Assuming you have a Farm model if you ever need to validate farm_id exists in Farm collection
// const Farm = require('../models/farm'); 

// Function to check if a monthly report has already been submitted for a specific farm and month
exports.checkSubmissionStatus = async (req, res) => {
    try {
        const { farm_id, month } = req.query;

        if (!farm_id || !month) {
            return res.status(400).json({
                status: 'fail',
                message: 'Farm ID and month are required query parameters.'
            });
        }

        // Validate farm_id format if necessary
        if (!mongoose.Types.ObjectId.isValid(farm_id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid Farm ID format.'
            });
        }

        // Parse the month string (e.g., "2025-06-01T00:00:00.000Z") into a Date object
        // For accurate monthly comparison, ensure the month in query is the start of the month (e.g. June 1st)
        const reportMonthDate = new Date(month);

        // Find a report for the exact farm_id and the start of the specified month
        const existingReport = await MonthlyFarmerReport.findOne({
            farm_id: farm_id,
            report_month: reportMonthDate // This will match reports for exactly '2025-06-01T00:00:00.000Z'
        });

        if (existingReport) {
            return res.status(200).json({
                status: 'success',
                submitted: true,
                message: 'Report already submitted for this farm and month.'
            });
        } else {
            return res.status(200).json({
                status: 'success',
                submitted: false,
                message: 'No report found for this farm and month.'
            });
        }
    } catch (error) {
        console.error('Error checking submission status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check submission status.',
            details: error.message
        });
    }
};

// Function to handle the submission of a new monthly farmer report
exports.submitMonthlyReport = async (req, res) => {
    try {
        const {
            farm_id,
            report_month,
            total_milk_production,
            birth_reported,
            death_reported,
            purchase_reported,
            sale_reported,
            company_change_reported
        } = req.body;

        // The user ID should come from the authenticated user
        const submitted_by = req.user.id; // Assumes your authMiddleware adds user.id to req

        // Basic validation
        if (!farm_id || !report_month || total_milk_production === undefined || submitted_by === undefined) {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required fields: farm_id, report_month, total_milk_production, submitted_by.'
            });
        }

        // Validate farm_id format
        if (!mongoose.Types.ObjectId.isValid(farm_id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid Farm ID format.'
            });
        }

        // Validate total_milk_production
        if (typeof total_milk_production !== 'number' || total_milk_production < 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Total milk production must be a non-negative number.'
            });
        }

        // Ensure the report_month is a valid date string or Date object
        const parsedReportMonth = new Date(report_month);
        if (isNaN(parsedReportMonth.getTime())) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid report month date format.'
            });
        }

        // Optional: Check if the farm_id actually belongs to the submitted_by user
        // This requires fetching user's farms or checking a relationship
        // if (req.user.farm_id !== farm_id) {
        //     return res.status(403).json({ status: 'fail', message: 'Unauthorized to submit for this farm.' });
        // }

        // Optional: Check for duplicate submission using the unique index
        const existingReport = await MonthlyFarmerReport.findOne({
            farm_id: farm_id,
            report_month: parsedReportMonth
        });

        if (existingReport) {
            return res.status(409).json({ // 409 Conflict if already submitted
                status: 'fail',
                message: 'Report for this farm and month has already been submitted.'
            });
        }

        const newReport = await MonthlyFarmerReport.create({
            farm_id,
            report_month: parsedReportMonth,
            total_milk_production,
            birth_reported,
            death_reported,
            purchase_reported,
            sale_reported,
            company_change_reported,
            submitted_by
        });

        res.status(201).json({
            status: 'success',
            message: 'Monthly report submitted successfully!',
            data: {
                report: newReport
            }
        });

    } catch (error) {
        console.error('Error submitting monthly report:', error);
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'fail',
                message: errors.join(', ')
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit monthly report.',
            details: error.message
        });
    }
};

// Get all farmer monthly reports
exports.getAllMonthlyReports = async (req, res) => {
    try {
        const reports = await MonthlyFarmerReport.find()
            .populate('farm_id', 'farm_name')
            .populate('validated_by', 'full_name username');
        res.status(200).json({ status: 'success', data: reports });
    } catch (error) {
        console.error('Error fetching monthly reports:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch monthly reports.' });
    }
};

// Approve a monthly report
exports.approveMonthlyReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const validated_by = req.user._id; // LDI officer ID

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid report ID format.'
            });
        }

        const report = await MonthlyFarmerReport.findById(reportId);
        
        if (!report) {
            return res.status(404).json({
                status: 'fail',
                message: 'Report not found.'
            });
        }

        if (report.validation_status === 'Approved') {
            return res.status(400).json({
                status: 'fail',
                message: 'Report is already approved.'
            });
        }

        const updatedReport = await MonthlyFarmerReport.findByIdAndUpdate(
            reportId,
            {
                validation_status: 'Approved',
                validated_by: validated_by,
                validation_date: new Date()
            },
            { new: true }
        ).populate('farm_id', 'farm_name')
         .populate('validated_by', 'full_name username');

        res.status(200).json({
            status: 'success',
            message: 'Report approved successfully!',
            data: updatedReport
        });

    } catch (error) {
        console.error('Error approving monthly report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve monthly report.',
            details: error.message
        });
    }
};

// Reject a monthly report
exports.rejectMonthlyReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const validated_by = req.user._id; // LDI officer ID

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid report ID format.'
            });
        }

        const report = await MonthlyFarmerReport.findById(reportId);
        
        if (!report) {
            return res.status(404).json({
                status: 'fail',
                message: 'Report not found.'
            });
        }

        if (report.validation_status === 'Rejected') {
            return res.status(400).json({
                status: 'fail',
                message: 'Report is already rejected.'
            });
        }

        const updatedReport = await MonthlyFarmerReport.findByIdAndUpdate(
            reportId,
            {
                validation_status: 'Rejected',
                validated_by: validated_by,
                validation_date: new Date()
            },
            { new: true }
        ).populate('farm_id', 'farm_name')
         .populate('validated_by', 'full_name username');

        res.status(200).json({
            status: 'success',
            message: 'Report rejected successfully!',
            data: updatedReport
        });

    } catch (error) {
        console.error('Error rejecting monthly report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reject monthly report.',
            details: error.message
        });
    }
};