const MonthlyEconomicRecord = require('../models/monthly_economic_records');
const MonthlyMilkProduction = require('../models/monthly_milk_production');
const Calving = require('../models/calvings');
const Farm = require('../models/farms');
const Animal = require('../models/animals');
const Farmer = require('../models/farmers');

exports.getDashboardSummary = async (req, res) => {
    const userId = req.user.id;

    try {
        console.log('--- getDashboardSummary Started ---');
        console.log(`Debug: Authenticated userId: ${userId}`);

        const farmerProfile = await Farmer.findOne({ user_id: userId });

        if (!farmerProfile) {
            console.log(`Debug: Farmer profile not found for userId: ${userId}. Returning 404.`);
            return res.status(404).json({ status: 'error', message: 'Farmer profile not found for this user.' });
        }

        const actualFarmerId = farmerProfile._id;
        console.log(`Debug: Found Farmer profile. Actual Farmer ID (from Farmer model): ${actualFarmerId}`);

        const farms = await Farm.find({ farmer_id: actualFarmerId }, '_id farm_name');
        const farmIds = farms.map(f => f._id);
        const numberOfFarms = farms.length;

        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

        console.log('Farms found:', farms);
        console.log('Farm IDs derived:', farmIds);
        console.log('Date Range (UTC):', startOfMonth.toISOString(), 'to', startOfNextMonth.toISOString());

        const cattleCount = await Animal.countDocuments({
            farm_id: { $in: farmIds },
            animal_type: 'Cattle',
            current_status: 'Active'
        });
        console.log(`Debug: Cattle count: ${cattleCount}`);


        const calvingsCount = await Calving.countDocuments({
            farm_id: { $in: farmIds },
            calving_date: { $gte: startOfMonth, $lt: startOfNextMonth }
        });
        console.log(`Debug: Calvings count: ${calvingsCount}`);


        const monthlyMilkProduction = await MonthlyMilkProduction.aggregate([
            {
                $match: {
                    farm_id: { $in: farmIds },
                    report_month: { $gte: startOfMonth, $lt: startOfNextMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMilk: { $sum: "$total_milk_production" }
                }
            }
        ]);
        const milkCollection = monthlyMilkProduction[0]?.totalMilk || 0;
        console.log(`Debug: Total milk collection: ${milkCollection}`);

        const monthlyEconomicRecords = await MonthlyEconomicRecord.aggregate([
            {
                $match: {
                    farm_id: { $in: farmIds },
                    report_month: { $gte: startOfMonth, $lt: startOfNextMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMilkIncome: { $sum: "$milk_income" },
                    totalOtherIncome: { $sum: "$other_income" }
                }
            }
        ]);
        const sales = monthlyEconomicRecords.length > 0
            ? (monthlyEconomicRecords[0].totalMilkIncome + (monthlyEconomicRecords[0].totalOtherIncome || 0))
            : 0;
        console.log(`Debug: Total sales: ${sales}`);

        console.log('Final Dashboard Data (Backend sending):', {
            numberOfFarms,
            cattleCount,
            calvingsCount,
            milkCollection,
            sales,
            farms
        });

        res.status(200).json({
            status: 'success',
            data: {
                numberOfFarms,
                cattleCount,
                calvingsCount,
                milkCollection,
                sales,
                farms
            }
        });
        console.log('--- getDashboardSummary Finished Successfully ---');

    } catch (error) {
        console.error('Error in getDashboardSummary:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve dashboard data',
            error: error.message
        });
        console.log('--- getDashboardSummary Finished with Error ---');
    }
};