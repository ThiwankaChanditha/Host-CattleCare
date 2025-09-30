const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllFarmers, getAllFarms, getFarmCount, getFarmerCount, createFarmer, updateFarmer, getUserByNIC, createFarm, updateFarm, getFarmById, getAnimalsByFarmId, getFarmerById, getFarmsByFarmerId, getValidationsByLdiId, getMilkProductionByFarmId, getAIByFarmId, getAllAIRecords, getAllMilkProduction, createAIRecord, updateAIRecord, updatePregnancyStatus, getAIAttachments, uploadAIAttachment, deleteAIAttachment, downloadAIAttachment, getDashboardData, getMemos, createMemo, updateMemo, deleteMemo } = require('../controllers/ldiController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for AI attachment uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/ai-attachments');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'), false);
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: error.message });
    } else if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
};

// LDI routes
router.get('/farmers', protect, getAllFarmers);
router.get('/farms',protect, getAllFarms);
router.get('/farm-count', protect, getFarmCount);
router.get('/farmer-count', protect, getFarmerCount);
router.post('/create-farmer', protect, createFarmer);
router.put('/farmers/:id', protect, updateFarmer);
router.post('/create-farm', protect, createFarm);
router.put('/farms/:id', protect, updateFarm);
router.get('/user-by-nic/:nic', protect, getUserByNIC);
router.get('/farmdetails/:id', protect, getFarmById);
router.get('/farmdetails/:id/animals', protect, getAnimalsByFarmId);
router.get('/farmerdetails/:id', protect, getFarmerById);
router.get('/farmerdetails/:id/farms', protect, getFarmsByFarmerId);
router.get('/validations/:id', protect, getValidationsByLdiId);
router.get('/farmdetails/:id/milk', protect, getMilkProductionByFarmId);
router.get('/farmdetails/:id/ai', protect, getAIByFarmId);
router.get('/ai-records/all', protect, getAllAIRecords);
router.get('/milk-production/all', protect, getAllMilkProduction);
router.post('/ai', protect, createAIRecord);
router.put('/ai/:id', protect, updateAIRecord);
router.put('/ai/:id/pregnancy-status', protect, updatePregnancyStatus);
router.get('/ai/:id/attachments', protect, getAIAttachments);
router.post('/ai/:id/attachments', protect, upload.single('file'), handleMulterError, uploadAIAttachment);
router.get('/ai/:id/attachments/:attachmentId/download', protect, downloadAIAttachment);
router.delete('/ai/:id/attachments/:attachmentId', protect, deleteAIAttachment);
router.get('/dashboard', protect, getDashboardData);

// Memo routes
router.get('/memos', protect, getMemos);
router.post('/memos', protect, createMemo);
router.put('/memos/:id', protect, updateMemo);
router.delete('/memos/:id', protect, deleteMemo);


module.exports = router;