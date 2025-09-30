// controllers/analyticsController.js
const mongoose = require('mongoose');
const Farm = require('../models/farms');
const MonthlyMilkProduction = require('../models/monthly_milk_production');
const MonthlyEconomicRecord = require('../models/monthly_economic_records');
const Animal = require('../models/animals');
const Farmer = require('../models/farmers');

// Helper function to generate years
const getYearsRange = (startYear, endYear) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        years.push(year.toString());
    }
    return years;
};

exports.getFarmerAnalytics = async (req, res) => {
    // We still get farmerId from params, but it's crucial to understand it might be a User ID,
    // or if the frontend is configured differently, it could be a Farmer ID.
    // Our robust solution will derive the correct Farmer._id from the authenticated user.
    const requestedFarmerIdParam = req.params.farmerId; // Keeping the original param name for clarity in logs

    console.log('--- getFarmerAnalytics Started ---');
    console.log(`Requested Farmer ID (from params): ${requestedFarmerIdParam}`);
    console.log(`Authenticated User ID: ${req.user.id}, Role: ${req.user.role}`);

    if (!requestedFarmerIdParam || !mongoose.Types.ObjectId.isValid(requestedFarmerIdParam)) {
        console.log('Error: Invalid Farmer ID provided in parameters.');
        return res.status(400).json({ message: 'Valid Farmer ID is required.' });
    }

    try {
        // Find the Farmer profile associated with the authenticated user (req.user.id is User._id)
        const authenticatedUserFarmerProfile = await Farmer.findOne({ user_id: req.user.id });
        console.log(`Authenticated User's Farmer Profile found: ${authenticatedUserFarmerProfile ? authenticatedUserFarmerProfile._id : 'None'}`);

        if (!authenticatedUserFarmerProfile) {
            console.log(`Error: Authenticated user (ID: ${req.user.id}) does not have a linked Farmer Profile. Returning 404.`);
            return res.status(404).json({ message: 'Authenticated user does not have an associated farmer profile.' });
        }

        // Use the _id of the authenticated farmer's profile for all subsequent data queries.
        // This 'actualFarmerId' is the correct ID to link to Farms, Animals, etc.
        const actualFarmerIdForQueries = authenticatedUserFarmerProfile._id;
        console.log(`Using actual Farmer ID for queries: ${actualFarmerIdForQueries}`);


        // --- Authorization check (improved for clarity) ---
        // If the authenticated user is a 'farmer' and the requested ID (from params)
        // does NOT match their own *actual farmer profile ID*, then deny access.
        // We compare Farmer._id to Farmer._id for authorization now.
        if (req.user.role === 'farmer' && req.user.id !== requestedFarmerIdParam) {
            console.log(`Error: Unauthorized access attempt. Farmer user ${req.user.id} trying to access another farmer's analytics: ${requestedFarmerIdParam}.`);
            return res.status(403).json({ message: 'Unauthorized to view other farmers\' analytics.' });
        }

        // If you have other roles like 'admin' who can view any farmer's data, you'd add:
        // if (req.user.role !== 'admin' && req.user.role !== 'data_analyst' && actualFarmerIdForQueries.toString() !== requestedFarmerIdParam.toString()) {
        //     return res.status(403).json({ message: 'Unauthorized to view these analytics.' });
        // }
        // --- End Authorization check ---


        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 4;
        const years = getYearsRange(startYear, currentYear);
        console.log(`Analytics years range: ${years.join(', ')}`);

        // --- Find all farms belonging to this farmer ---
        // NOW using 'actualFarmerIdForQueries'
        const farms = await Farm.find({ farmer_id: actualFarmerIdForQueries }, '_id'); // Only fetch _id
        const farmIds = farms.map(farm => farm._id);
        console.log(`Farms found for farmer ${actualFarmerIdForQueries}: ${farmIds.length} farms. IDs: ${farmIds.map(id => id.toString()).join(', ')}`);

        if (farmIds.length === 0) {
            console.log('No farms found for this farmer. Returning empty analytics.');
            return res.status(200).json({
                cattleCount: years.map(() => 0),
                milkProduction: years.map(() => 0),
                expenses: years.map(() => 0),
                years: years,
                expenseDistribution: [0, 0, 0, 0],
            });
        }

        // --- 1. Cattle Count Over Years ---
        const cattleCountPromises = years.map(async (year) => {
            const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
            const count = await Animal.countDocuments({
                farm_id: { $in: farmIds },
                purchase_date: { $lte: endOfYear },
                current_status: 'Active',
            });
            console.log(`Cattle count for ${year} (ending ${endOfYear.toISOString()}): ${count}`);
            return { year, count };
        });
        const cattleCountResults = await Promise.all(cattleCountPromises);
        const cattleCount = years.map(year => {
            const found = cattleCountResults.find(item => item.year === year);
            return found ? found.count : 0;
        });
        console.log(`Final cattleCount array: ${cattleCount}`);

        // --- 2. Milk Production vs Expenses Over Years ---
        const annualMatchRange = { $gte: new Date(startYear, 0, 1), $lte: new Date(currentYear, 11, 31) };
        console.log(`Annual aggregation date range: ${annualMatchRange.$gte.toISOString()} to ${annualMatchRange.$lte.toISOString()}`);

        const milkAndExpensesAggregation = await MonthlyMilkProduction.aggregate([
            // NOW using 'actualFarmerIdForQueries'
            { $match: { farm_id: { $in: farmIds }, report_month: annualMatchRange } },
            {
                $group: {
                    _id: { year: { $year: "$report_month" } },
                    totalMilk: { $sum: "$total_milk_production" }
                }
            },
            { $sort: { "_id.year": 1 } }
        ]);
        console.log(`Milk Production Aggregation Result:`, JSON.stringify(milkAndExpensesAggregation));

        const expensesAnnualAggregation = await MonthlyEconomicRecord.aggregate([
            // NOW using 'actualFarmerIdForQueries'
            { $match: { farm_id: { $in: farmIds }, report_month: annualMatchRange } },
            {
                $group: {
                    _id: { year: { $year: "$report_month" } },
                    totalExpenses: { $sum: { $add: ["$feed_costs", "$labor_costs", "$veterinary_costs", "$other_costs"] } }
                }
            },
            { $sort: { "_id.year": 1 } }
        ]);
        console.log(`Expenses Annual Aggregation Result:`, JSON.stringify(expensesAnnualAggregation));

        const milkProductionMap = new Map(milkAndExpensesAggregation.map(item => [item._id.year.toString(), item.totalMilk]));
        const expensesAnnualMap = new Map(expensesAnnualAggregation.map(item => [item._id.year.toString(), item.totalExpenses]));

        const milkProduction = years.map(year => milkProductionMap.get(year) || 0);
        const expenses = years.map(year => expensesAnnualMap.get(year) || 0);
        console.log(`Final milkProduction array: ${milkProduction}`);
        console.log(`Final expenses array: ${expenses}`);

        // --- 3. Expense Distribution (last 12 months) ---
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        twelveMonthsAgo.setDate(1);
        console.log(`Expense distribution date range (last 12 months from): ${twelveMonthsAgo.toISOString()}`);

        const expenseDistributionAggregation = await MonthlyEconomicRecord.aggregate([
            // NOW using 'actualFarmerIdForQueries'
            { $match: { farm_id: { $in: farmIds }, report_month: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: null,
                    feed: { $sum: "$feed_costs" },
                    labor: { $sum: "$labor_costs" },
                    healthcare: { $sum: "$veterinary_costs" },
                    miscellaneous: { $sum: "$other_costs" }
                }
            }
        ]);
        const expenseDistributionResult = expenseDistributionAggregation[0];
        console.log(`Expense Distribution Aggregation Result:`, JSON.stringify(expenseDistributionAggregation));

        const expenseCategoriesOrder = ['Feed', 'Labor', 'Healthcare', 'Miscellaneous'];
        const expenseDistribution = expenseCategoriesOrder.map(category => {
            switch (category) {
                case 'Feed': return expenseDistributionResult?.feed || 0;
                case 'Labor': return expenseDistributionResult?.labor || 0;
                case 'Healthcare': return expenseDistributionResult?.healthcare || 0;
                case 'Miscellaneous': return expenseDistributionResult?.miscellaneous || 0;
                default: return 0;
            }
        });
        console.log(`Final expenseDistribution array: ${expenseDistribution}`);


        const analyticsData = {
            cattleCount,
            milkProduction,
            expenses,
            years,
            expenseDistribution,
        };

        console.log('--- getFarmerAnalytics Finished Successfully ---');
        console.log('Sending Analytics Data:', JSON.stringify(analyticsData, null, 2));
        res.status(200).json(analyticsData);

    } catch (error) {
        console.error('Error fetching farmer analytics:', error);
        res.status(500).json({ message: 'Failed to retrieve analytics data.', error: error.message });
        console.log('--- getFarmerAnalytics Finished with Error ---');
    }
};