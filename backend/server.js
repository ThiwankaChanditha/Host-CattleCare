const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

require('./models/users');
require('./models/user_roles');
require('./models/extension_programs');
require('./models/extension_participants');
require('./models/farmers');
require('./models/farmer_monthly_reports');
require('./models/animals');
require('./models/animal_health_records');
require('./models/farms');
require('./models/Appointments');
require('./models/medicalhistory');
require('./models/program_attachments');
require('./models/monthly_milk_production');
require('./models/administrative_divisions');


const authRoutes = require('./routes/auth');
const forumRoutes = require('./controllers/forum');
const programRoutes = require('./routes/programRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const farmerReportRoutes = require('./routes/farmerReportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const profilePicRoutes = require('./routes/profilePicRoutes');
const vsDashboardRoutes = require('./routes/vs/dashboardRoutes');
const vsAppointmentRoutes = require('./routes/vs/appointmentRoutes');
const vsAnimalHealthRecordsRoutes = require('./routes/vs/animalHealthRecordsRoutes');
const vsAnimalDetailRecordsRoutes = require('./routes/vs/animalDetailRoutes');
const vsAnimalHistoryRoutes = require('./routes/vs/animalHistoryRoutes');
const vsReportsRoutes = require('./routes/vs/reportsRoutes');
const animalRoutes = require('./routes/animalRoutes');
const ldiRoutes = require('./routes/ldiRoutes');
const userRoutes = require('./routes/user.routes');
const adminFarmerRoutes = require("./routes/farmer.route");
const adminFarmRoutes = require('./routes/farm.route');
const adminAnimalRoutes = require('./routes/animal.route');
const adminMonthlyMilkCollectionRoute = require('./routes/monthly_milk_production.route');
const adminFarmerMonthlyReportRoute = require('./routes/farmer_monthly_report.route');
const adminAdministrativeDivisionRoute = require('./routes/administrative_division.route');
const adminUserRoleRoute = require('./routes/user_role_routes');


const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uploadsDir = path.join(__dirname, 'uploads');
const profileUploadsDir = path.join(uploadsDir, 'profile');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(profileUploadsDir, { recursive: true });
console.log(`Ensured upload directories exist: ${uploadsDir}, ${profileUploadsDir}`);

app.use('/uploads', (req, res, next) => {
    console.log('--- Express Static Debugging ---');
    console.log(`Request for static file received: ${req.originalUrl}`);
    const absolutePathAttempt = path.join(__dirname, 'uploads', req.path);
    console.log(`Attempting to serve physical file from: ${absolutePathAttempt}`);

    if (fs.existsSync(absolutePathAttempt)) {
        const stats = fs.statSync(absolutePathAttempt);
        console.log(`File EXISTS! Size: ${stats.size} bytes.`);
        if (stats.size === 0) {
            console.warn('WARNING: File exists but is 0 bytes! It might be corrupted or empty.');
        }
    } else {
        console.error(`ERROR: File DOES NOT EXIST at: ${absolutePathAttempt}`);
    }
    console.log('--- End Express Static Debugging ---');
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', programRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farmer-reports', farmerReportRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/users', profilePicRoutes);
app.use('/api/vs/dashboard', vsDashboardRoutes);
app.use('/api/vs/appointments', vsAppointmentRoutes);
app.use('/api/vs/animal-health-records', vsAnimalHealthRecordsRoutes);
app.use('/api/vs/animal-detail', vsAnimalDetailRecordsRoutes);
app.use('/api', vsAnimalDetailRecordsRoutes);
app.use('/api/vs/animal-history', vsAnimalHistoryRoutes);
app.use('/api/vs/reports', vsReportsRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/ldi', ldiRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/admin/farmers', adminFarmerRoutes);
app.use('/api/admin/farms', adminFarmRoutes);
app.use('/api/admin/animals', adminAnimalRoutes);
app.use('/api/admin/monthly_milk_production', adminMonthlyMilkCollectionRoute);
app.use('/api/admin/farmer_monthly_reports', adminFarmerMonthlyReportRoute);
app.use('/api/admin/administrative_division', adminAdministrativeDivisionRoute);
app.use('/api/admin/user_roles', adminUserRoleRoute);


app.get('/', (req, res) => {
    res.send('Cattle Management App Backend is running!');
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

async function startServer() {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cattlecare';

        if (!mongoURI) {
            throw new Error("❌ MONGO_URI is not defined in .env file");
        }

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

startServer();
