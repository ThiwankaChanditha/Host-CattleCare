const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('../models/users');
const path = require('path');
const fs = require('fs');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/profile');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${req.params.id}-${uniqueSuffix}${fileExtension}`);
    },
});

// Configure file filter if you want to restrict file types (e.g., only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Upload profile picture
router.post('/:id/upload-profile', upload.single('image'), async (req, res) => {
    console.log("Upload request received for user ID:", req.params.id);

    try {
        if (!req.file) {
            console.log("No file uploaded or file filter failed.");
            return res.status(400).json({ error: "No file uploaded or invalid file type." });
        }

        const userId = req.params.id;
        const newProfileImagePath = `/uploads/profile/${req.file.filename}`;

        const user = await User.findById(userId);
        if (user && user.profileImage) {
            const oldImagePath = path.join(__dirname, '../', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old profile image:", oldImagePath, err);
                    else console.log("Old profile image deleted:", oldImagePath);
                });
            }
        }

        await User.findByIdAndUpdate(userId, { profileImage: newProfileImagePath });
        console.log("Profile image updated for user:", userId, "Path:", newProfileImagePath);
        res.json({ success: true, imagePath: newProfileImagePath });
    } catch (err) {
        console.error("Upload failed for user:", req.params.id, "Error:", err);
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: "File too large, max 5MB." });
            }
        }
        res.status(500).json({ error: "Upload failed: " + err.message });
    }
});

// Remove profile picture
router.delete('/:id/remove-profile', async (req, res) => {
    console.log("Remove profile picture request received for user ID:", req.params.id);

    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (user && user.profileImage) {
            const imagePathToDelete = path.join(__dirname, '../', user.profileImage);
            if (fs.existsSync(imagePathToDelete)) {
                fs.unlink(imagePathToDelete, (err) => {
                    if (err) {
                        console.error("Error deleting file from disk:", imagePathToDelete, err);
                    } else {
                        console.log("File deleted from disk:", imagePathToDelete);
                    }
                });
            }
        }

        await User.findByIdAndUpdate(userId, { profileImage: null });
        console.log("Profile image removed from DB for user:", userId);
        res.json({ success: true });
    } catch (err) {
        console.error("Removal failed for user:", req.params.id, "Error:", err);
        res.status(500).json({ error: "Removal failed: " + err.message });
    }
});

module.exports = router; 