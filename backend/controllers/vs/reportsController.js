const MedicalHistory = require('../../models/medicalhistory');
const Farmer = require('../../models/farmers');
const Farm = require('../../models/farms');
const Animal = require('../../models/animals');
const UserRole = require('../../models/user_roles');
const Users = require('../../models/users');
const AdministrativeDivision = require('../../models/administrative_divisions');

const getFarmersByVsId = async (req, res) => {
    try {
        const { vsId } = req.params;
        console.log('Fetching farmers for VS ID:', vsId);

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await Users.findOne({ _id: vsId }).select('division_id').lean();
        console.log('VS Data:', vsData);

        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const vsDivisionId = vsData.division_id;
        console.log('Veterinary Service Division ID:', vsDivisionId);

        const gnDivisions = await AdministrativeDivision.find({
            division_type: 'GN',
            parent_division_id: vsDivisionId
        }).lean();
        console.log('GN Divisions:', gnDivisions.length);

        if (!gnDivisions || gnDivisions.length === 0) {
            return res.status(404).json({
                message: 'No administrative divisions found for this veterinary service',
                farmers: []
            });
        }

        const gnDivisionIds = gnDivisions.map(div => div._id);
        console.log('GN Division IDs:', gnDivisionIds);

        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' }).select('_id').lean();
        if (!farmerRole) {
            return res.status(404).json({ message: 'Farmer role not found' });
        }
        const farmerRoleId = farmerRole._id;
        console.log('Farmer Role ID:', farmerRoleId);

        const farmerUsers = await Users.find({
            role_id: farmerRoleId,
            division_id: { $in: gnDivisionIds }
        }).select('_id full_name email division_id').lean();

        console.log('Farmer Users Found:', farmerUsers.length);

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.status(404).json({
                message: 'No farmers found under these divisions',
                farmers: []
            });
        }

        const farmerUserIds = farmerUsers.map(user => user._id);
        console.log('Farmer User IDs:', farmerUserIds);

        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } })
            .populate({
                path: 'user_id',
                select: '_id full_name email nic division_id contact_number address created_at'
            })
            .lean();

        console.log('Farmers Found:', farmers.length);

        const farmerIds = farmers.map(f => f._id);

        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        console.log('Farms Found:', farms.length);

        const farmIds = farms.map(f => f._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        console.log('Animals Found:', animals.length);

        const animalIds = animals.map(a => a._id);
        const medicalHistories = await MedicalHistory.find({ animal_id: { $in: animalIds } }).lean();
        console.log('Medical History Records Found:', medicalHistories.length);
        
        const medicalHistory = await MedicalHistory.find({treated_by: vsId}).lean();
        const medicalDetails = medicalHistories.filter(mh => mh.treated_by.toString() === vsId.toString());

        const farmersWithCounts = farmers.map(farmer => {
            const userData = farmer.user_id || {};
            const farmerFarms = farms.filter(farm => farm.farmer_id.toString() === farmer._id.toString());
            const farmerFarmIds = farmerFarms.map(f => f._id.toString());
            const farmerAnimals = animals.filter(a => farmerFarmIds.includes(a.farm_id.toString()));

            return {
                _id: farmer._id,
                full_name: userData.full_name || 'Unnamed Farmer',
                email: userData.email || '',
                created_at: userData.created_at || new Date(),
                contact_number: userData.contact_number || '',
                address: userData.address || '',
                farmCount: farmerFarms.length,
                nic_number: userData.nic || '',
                animalCount: farmerAnimals.length
            };
        });

        res.json({
            farmers: farmersWithCounts,
            count: farmersWithCounts.length,
            summary: {
                totalFarmers: farmersWithCounts.length,
                totalFarms: farms.length,
                totalAnimals: animals.length,
                totalHealthRecords: medicalHistories.length
            }
        });

    } catch (error) {
        console.error('Error fetching farmers by VS ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            farmers: []
        });
    }
};


const getFarmsByFarmerId = async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log('Fetching farms for Farmer ID:', farmerId);

        if (!farmerId) {
            return res.status(400).json({ message: 'Farmer ID is required' });
        }

        const farms = await Farm.find({ farmer_id: farmerId }).lean();
        console.log('Farms Found:', farms.length);

        res.json({
            farms: farms || [],
            count: farms ? farms.length : 0
        });

    } catch (error) {
        console.error('Error fetching farms by farmer ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            farms: []
        });
    }
};

const getAnimalsByFarmId = async (req, res) => {
    try {
        const { farmId } = req.params;
        console.log('Fetching animals for Farm ID:', farmId);

        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }

        const animals = await Animal.find({ farm_id: farmId }).lean();
        console.log('Animals Found:', animals.length);

        console.log('Animal Data:', animals);
        res.json({
            animals: animals || [],
            count: animals ? animals.length : 0
        });

    } catch (error) {
        console.error('Error fetching animals by farm ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            animals: []
        });
    }
};

const getMedicalHistoryByAnimalId = async (req, res) => {
    try {
        const { animalId } = req.params;
        console.log('Fetching medical history for Animal ID:', animalId);

        if (!animalId) {
            return res.status(400).json({ message: 'Animal ID is required' });
        }

        const medicalHistories = await MedicalHistory.find({ animal_id: animalId })
            .populate('animal_id', 'animal_name tag_number')
            .sort({ date: -1 })
            .lean();
        console.log('Medical History Records:', medicalHistories);



        res.json({
            medicalHistories: medicalHistories || [],
            count: medicalHistories ? medicalHistories.length : 0
        });

    } catch (error) {
        console.error('Error fetching medical history by animal ID:', error);
        res.status(500).json({
            message: 'Internal server error',
            medicalHistories: []
        });
    }
};

const getFarmerDetails = async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log('Fetching details for Farmer ID:', farmerId);

        if (!farmerId) {
            return res.status(400).json({ message: 'Farmer ID is required' });
        }

        const farmer = await Farmer.findById(farmerId).lean();
        console.log('Farmer Data:', farmer);

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const farms = await Farm.find({ farmer_id: farmerId }).lean();
        const farmIds = farms.map(farm => farm._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        console.log('Farms Found:', farms.length, 'Animals Found:', animals.length);

        res.json({
            farmer,
            farms: farms || [],
            animals: animals || [],
            summary: {
                farmCount: farms ? farms.length : 0,
                animalCount: animals ? animals.length : 0
            }
        });

    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getComprehensiveReportData = async (req, res) => {
    try {
        const { vsId } = req.params;
        console.log('Fetching comprehensive report for VS ID:', vsId);

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await Users.findOne({ _id: vsId }).select('division_id').lean();
        console.log('VS Data:', vsData);

        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const vsDivisionId = vsData.division_id;
        console.log('Veterinary Service Division ID:', vsDivisionId);

        // Use the same approach as getFarmersByVsId to find GN divisions
        const gnDivisions = await AdministrativeDivision.find({
            division_type: 'GN',
            parent_division_id: vsDivisionId
        }).lean();
        console.log('GN Divisions:', gnDivisions.length);

        if (!gnDivisions || gnDivisions.length === 0) {
            return res.json({
                farmers: [],
                farms: [],
                animals: [],
                medicalHistories: [],
                summary: { farmerCount: 0, farmCount: 0, animalCount: 0, recordCount: 0 }
            });
        }

        const gnDivisionIds = gnDivisions.map(div => div._id);
        console.log('GN Division IDs:', gnDivisionIds);

        // Find users with farmer role in these GN divisions
        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' }).select('_id').lean();
        if (!farmerRole) {
            return res.status(404).json({ message: 'Farmer role not found' });
        }
        const farmerRoleId = farmerRole._id;
        console.log('Farmer Role ID:', farmerRoleId);

        const farmerUsers = await Users.find({
            role_id: farmerRoleId,
            division_id: { $in: gnDivisionIds }
        }).select('_id').lean();
        console.log('Farmer Users Found:', farmerUsers.length);

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.json({
                farmers: [],
                farms: [],
                animals: [],
                medicalHistories: [],
                summary: { farmerCount: 0, farmCount: 0, animalCount: 0, recordCount: 0 }
            });
        }

        const farmerUserIds = farmerUsers.map(user => user._id);
        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } })
            .populate({
                path: 'user_id',
                select: '_id full_name email nic division_id contact_number address created_at'
            })
            .lean();
        console.log('Farmers Found:', farmers.length);

        const farmerIds = farmers.map(farmer => farmer._id);
        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        console.log('Farms Found:', farms.length);

        const farmIds = farms.map(farm => farm._id);
        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        console.log('Animals Found:', animals.length);

        const animalIds = animals.map(animal => animal._id);
        const medicalHistories = await MedicalHistory.find({ animal_id: { $in: animalIds } })
            .sort({ date: -1 })
            .lean();
        console.log('Medical History Records:', medicalHistories.length);

        res.json({
            farmers: farmers || [],
            farms: farms || [],
            animals: animals || [],
            medicalHistories: medicalHistories || [],
            summary: {
                farmerCount: farmers ? farmers.length : 0,
                farmCount: farms ? farms.length : 0,
                animalCount: animals ? animals.length : 0,
                recordCount: medicalHistories ? medicalHistories.length : 0
            }
        });

    } catch (error) {
        console.error('Error fetching comprehensive report data:', error);
        res.status(500).json({
            message: 'Internal server error',
            farmers: [],
            farms: [],
            animals: [],
            medicalHistories: []
        });
    }
};

const getDiseaseReportData = async (req, res) => {
    try {
        const { vsId } = req.params;
        console.log('Fetching disease report for VS ID:', vsId);

        if (!vsId) {
            return res.status(400).json({ message: 'Veterinary Service ID is required' });
        }

        const vsData = await Users.findOne({ _id: vsId }).select('division_id').lean();
        if (!vsData || !vsData.division_id) {
            return res.status(404).json({ message: 'VS division not found' });
        }

        const vsDivisionId = vsData.division_id;

        // Get GN divisions under this VS
        const gnDivisions = await AdministrativeDivision.find({
            division_type: 'GN',
            parent_division_id: vsDivisionId
        }).lean();

        if (!gnDivisions || gnDivisions.length === 0) {
            return res.json({
                diseaseSummary: [],
                diseaseTrends: [],
                recoveryRates: [],
                costAnalysis: [],
                summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
            });
        }

        const gnDivisionIds = gnDivisions.map(div => div._id);

        // Get farmer users in these divisions
        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' }).select('_id').lean();
        if (!farmerRole) {
            return res.status(404).json({ message: 'Farmer role not found' });
        }

        const farmerUsers = await Users.find({
            role_id: farmerRole._id,
            division_id: { $in: gnDivisionIds }
        }).select('_id').lean();

        if (!farmerUsers || farmerUsers.length === 0) {
            return res.json({
                diseaseSummary: [],
                diseaseTrends: [],
                recoveryRates: [],
                costAnalysis: [],
                summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
            });
        }

        const farmerUserIds = farmerUsers.map(user => user._id);
        const farmers = await Farmer.find({ user_id: { $in: farmerUserIds } }).lean();
        const farmerIds = farmers.map(farmer => farmer._id);

        const farms = await Farm.find({ farmer_id: { $in: farmerIds } }).lean();
        const farmIds = farms.map(farm => farm._id);

        const animals = await Animal.find({ farm_id: { $in: farmIds } }).lean();
        const animalIds = animals.map(animal => animal._id);

        // Get medical histories for disease analysis
        const medicalHistories = await MedicalHistory.find({ 
            animal_id: { $in: animalIds },
            treated_by: vsId 
        }).lean();

        // Disease summary by diagnosis
        const diseaseSummary = {};
        const monthlyTrends = {};
        const recoveryRates = {};
        const costAnalysis = {};

        medicalHistories.forEach(record => {
            const diagnosis = record.diagnosis || 'Unknown';
            const monthYear = record.treatment_date ? 
                new Date(record.treatment_date).toISOString().slice(0, 7) : 'Unknown';
            
            // Disease summary
            if (!diseaseSummary[diagnosis]) {
                diseaseSummary[diagnosis] = {
                    count: 0,
                    totalCost: 0,
                    recoveryStatus: { Ongoing: 0, Healthy: 0, Critical: 0, Deceased: 0 }
                };
            }
            diseaseSummary[diagnosis].count++;
            diseaseSummary[diagnosis].totalCost += record.cost || 0;
            diseaseSummary[diagnosis].recoveryStatus[record.recovery_status || 'Ongoing']++;

            // Monthly trends
            if (!monthlyTrends[monthYear]) {
                monthlyTrends[monthYear] = {};
            }
            if (!monthlyTrends[monthYear][diagnosis]) {
                monthlyTrends[monthYear][diagnosis] = 0;
            }
            monthlyTrends[monthYear][diagnosis]++;

            // Recovery rates
            if (!recoveryRates[diagnosis]) {
                recoveryRates[diagnosis] = { total: 0, recovered: 0, ongoing: 0, critical: 0, deceased: 0 };
            }
            recoveryRates[diagnosis].total++;
            if (record.recovery_status === 'Healthy') recoveryRates[diagnosis].recovered++;
            if (record.recovery_status === 'Ongoing') recoveryRates[diagnosis].ongoing++;
            if (record.recovery_status === 'Critical') recoveryRates[diagnosis].critical++;
            if (record.recovery_status === 'Deceased') recoveryRates[diagnosis].deceased++;

            // Cost analysis
            if (!costAnalysis[diagnosis]) {
                costAnalysis[diagnosis] = { totalCost: 0, count: 0, averageCost: 0 };
            }
            costAnalysis[diagnosis].totalCost += record.cost || 0;
            costAnalysis[diagnosis].count++;
            costAnalysis[diagnosis].averageCost = costAnalysis[diagnosis].totalCost / costAnalysis[diagnosis].count;
        });

        // Convert to arrays for frontend
        const diseaseSummaryArray = Object.entries(diseaseSummary).map(([disease, data]) => ({
            disease,
            ...data
        }));

        const diseaseTrendsArray = Object.entries(monthlyTrends).map(([month, diseases]) => ({
            month,
            ...diseases
        }));

        const recoveryRatesArray = Object.entries(recoveryRates).map(([disease, data]) => ({
            disease,
            recoveryRate: data.total > 0 ? (data.recovered / data.total * 100).toFixed(1) : 0,
            ...data
        }));

        const costAnalysisArray = Object.entries(costAnalysis).map(([disease, data]) => ({
            disease,
            ...data
        }));

        // Calculate summary
        const summary = {
            totalCases: medicalHistories.length,
            activeCases: medicalHistories.filter(h => h.recovery_status === 'Ongoing').length,
            recoveredCases: medicalHistories.filter(h => h.recovery_status === 'Healthy').length,
            criticalCases: medicalHistories.filter(h => h.recovery_status === 'Critical').length,
            deceasedCases: medicalHistories.filter(h => h.recovery_status === 'Deceased').length,
            totalCost: medicalHistories.reduce((sum, h) => sum + (h.cost || 0), 0)
        };

        res.json({
            diseaseSummary: diseaseSummaryArray,
            diseaseTrends: diseaseTrendsArray,
            recoveryRates: recoveryRatesArray,
            costAnalysis: costAnalysisArray,
            summary,
            medicalHistories: medicalHistories || []
        });

    } catch (error) {
        console.error('Error fetching disease report data:', error);
        res.status(500).json({
            message: 'Internal server error',
            diseaseSummary: [],
            diseaseTrends: [],
            recoveryRates: [],
            costAnalysis: [],
            summary: { totalCases: 0, activeCases: 0, recoveredCases: 0, totalCost: 0 }
        });
    }
};

module.exports = {
    getFarmersByVsId,
    getFarmsByFarmerId,
    getAnimalsByFarmId,
    getMedicalHistoryByAnimalId,
    getFarmerDetails,
    getComprehensiveReportData,
    getDiseaseReportData
};
