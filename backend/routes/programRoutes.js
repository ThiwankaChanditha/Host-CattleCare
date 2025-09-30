const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExtensionProgram = require('../models/extension_programs');
const ExtensionParticipant = require('../models/extension_participants');
const ProgramAttachment = require('../models/program_attachments');
// No longer explicitly need to import User model here for aggregate,
// as $lookup references the collection name directly.

const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/program-attachments');
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

// @route   GET /api/programs
// @desc    Get all extension programs (with optional type filter and search)
// @access  Public (or protected if only logged-in users can see programs)
router.get('/programs', async (req, res) => {
    try {
        const { type, search } = req.query;
        let matchQuery = {}; // Use matchQuery for aggregate's $match stage

        // Only filter by type if a specific type is requested (not 'all' or undefined)
        if (type && type !== 'all') { // If a specific type is requested
            matchQuery.program_type = type;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            matchQuery.$or = [
                { program_name: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
            ];
        }

        // --- MODIFIED: Using aggregate instead of populate ---
        const programs = await ExtensionProgram.aggregate([
            {
                $match: matchQuery // Apply initial filters
            },
            {
                $lookup: {
                    from: 'users', // The name of the collection for the 'User' model (usually pluralized, lowercase)
                    localField: 'conducted_by', // Field from the ExtensionProgram document
                    foreignField: '_id', // Field from the 'users' collection
                    as: 'conducted_by_user' // Name of the new array field to add to the input documents
                }
            },
            {
                $unwind: {
                    path: '$conducted_by_user', // Deconstructs the array field 'conducted_by_user'
                    preserveNullAndEmptyArrays: true // Keep documents even if no match found
                }
            },
            {
                $addFields: {
                    // Create a 'conducted_by' field that is an object containing name and username,
                    // similar to what populate would return
                    conducted_by: {
                        _id: '$conducted_by_user._id',
                        name: '$conducted_by_user.name',
                        username: '$conducted_by_user.username'
                    }
                }
            },
            {
                $project: {
                    // Project the fields you want to keep, excluding the temporary 'conducted_by_user'
                    _id: 1,
                    program_name: 1,
                    program_type: 1,
                    description: 1,
                    conducted_by: 1, // This is the new, custom object field
                    program_date: 1,
                    location: 1,
                    participants_count: 1,
                    created_at: 1
                }
            },
            {
                $sort: { program_date: 1 } // Sort the results
            }
        ]);
        // ---------------------------------------------------

        res.json(programs);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ message: 'Server error fetching programs' });
    }
});

// @route   GET /api/programs/:id
// @desc    Get a specific extension program by ID
// @access  Public
router.get('/programs/:id', async (req, res) => {
    try {
        const program = await ExtensionProgram.findById(req.params.id)
            .populate('conducted_by', 'full_name username email');
        
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }
        
        res.json(program);
    } catch (error) {
        console.error('Error fetching program:', error);
        res.status(500).json({ message: 'Server error fetching program' });
    }
});

// @route   POST /api/programs
// @desc    Create a new extension program
// @access  Private (LDI officers only)
router.post('/programs', protect, async (req, res) => {
    try {
        const { program_name, program_type, description, program_date, location, participants_count } = req.body;
        
        // Validate required fields
        if (!program_name || !program_type || !program_date) {
            return res.status(400).json({ message: 'Program name, type, and date are required' });
        }

        // Create new program with the logged-in user as conducted_by
        const newProgram = new ExtensionProgram({
            program_name,
            program_type,
            description,
            conducted_by: req.user._id, // Use the logged-in user's ID
            program_date,
            location,
            participants_count: participants_count || 0
        });

        const savedProgram = await newProgram.save();
        
        // Populate the conducted_by field for the response
        const populatedProgram = await ExtensionProgram.findById(savedProgram._id)
            .populate('conducted_by', 'full_name username email');
        
        res.status(201).json(populatedProgram);
    } catch (error) {
        console.error('Error creating program:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error creating program' });
    }
});

// @route   PUT /api/programs/:id
// @desc    Update an extension program
// @access  Private (LDI officers only)
router.put('/programs/:id', protect, async (req, res) => {
    try {
        const { program_name, program_type, description, program_date, location, participants_count } = req.body;
        
        const updatedProgram = await ExtensionProgram.findByIdAndUpdate(
            req.params.id,
            {
                program_name,
                program_type,
                description,
                program_date,
                location,
                participants_count
            },
            { new: true }
        ).populate('conducted_by', 'full_name username email');
        
        if (!updatedProgram) {
            return res.status(404).json({ message: 'Program not found' });
        }
        
        res.json(updatedProgram);
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ message: 'Server error updating program' });
    }
});

// @route   GET /api/programs/:id/attachments
// @desc    Get all attachments for a specific program
// @access  Public
router.get('/programs/:id/attachments', async (req, res) => {
    try {
        const attachments = await ProgramAttachment.find({ program_id: req.params.id })
            .populate('uploaded_by', 'full_name username')
            .sort({ uploaded_at: -1 });
        
        res.json(attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Server error fetching attachments' });
    }
});

// @route   POST /api/programs/:id/attachments
// @desc    Upload attachment for a specific program
// @access  Private
router.post('/programs/:id/attachments', protect, upload.single('file'), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { description } = req.body;
        const programId = req.params.id;
        const uploadedBy = req.user ? req.user._id : null; // Will be set by auth middleware

        // Check if program exists
        const program = await ExtensionProgram.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        const attachment = new ProgramAttachment({
            program_id: programId,
            file_name: req.file.filename,
            original_name: req.file.originalname,
            file_path: req.file.path,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            description: description || '',
            uploaded_by: uploadedBy
        });

        await attachment.save();

        const populatedAttachment = await ProgramAttachment.findById(attachment._id)
            .populate('uploaded_by', 'full_name username');

        res.status(201).json(populatedAttachment);
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ message: 'Server error uploading attachment' });
    }
});

// @route   DELETE /api/programs/:programId/attachments/:attachmentId
// @desc    Delete a specific attachment
// @access  Private
router.delete('/programs/:programId/attachments/:attachmentId', protect, async (req, res) => {
    try {
        const { programId, attachmentId } = req.params;

        const attachment = await ProgramAttachment.findById(attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        if (attachment.program_id.toString() !== programId) {
            return res.status(400).json({ message: 'Attachment does not belong to this program' });
        }

        // Delete file from filesystem
        if (fs.existsSync(attachment.file_path)) {
            fs.unlinkSync(attachment.file_path);
        }

        await ProgramAttachment.findByIdAndDelete(attachmentId);

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Server error deleting attachment' });
    }
});

// @route   GET /api/programs/:programId/attachments/:attachmentId/download
// @desc    Download a specific attachment
// @access  Private
router.get('/programs/:programId/attachments/:attachmentId/download', protect, async (req, res) => {
    try {
        const { programId, attachmentId } = req.params;

        const attachment = await ProgramAttachment.findById(attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        if (attachment.program_id.toString() !== programId) {
            return res.status(400).json({ message: 'Attachment does not belong to this program' });
        }

        // Check if file exists
        if (!fs.existsSync(attachment.file_path)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', attachment.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
        res.setHeader('Content-Length', attachment.file_size);

        // Stream the file
        const fileStream = fs.createReadStream(attachment.file_path);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error downloading file' });
            }
        });

    } catch (error) {
        console.error('Error downloading attachment:', error);
        res.status(500).json({ message: 'Server error downloading attachment' });
    }
});

// @route   GET /api/extension_participants/:farmerId
// @desc    Get all program registrations for a specific farmer
// @access  Private (should be protected to ensure farmerId matches logged-in user)
router.get('/extension_participants/:farmerId', async (req, res) => {
    try {
        // In a real app, you'd add middleware here to ensure req.params.farmerId matches req.user.id
        // if (req.user.id !== req.params.farmerId) return res.status(403).json({ message: 'Unauthorized' });

        const registrations = await ExtensionParticipant.find({ farmer_id: req.params.farmerId });
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching farmer program registrations:', error);
        res.status(500).json({ message: 'Server error fetching registrations' });
    }
});


// @route   POST /api/extension_participants
// @desc    Register a farmer for an extension program
// @access  Private (requires authentication)
router.post('/extension_participants', async (req, res) => {
    const { program_id, farmer_id } = req.body;

    // In a real app, you'd verify farmer_id against the authenticated user's ID
    // For now, assuming farmer_id is provided and valid.
    // if (req.user._id.toString() !== farmer_id) return res.status(403).json({ message: 'Unauthorized action.' });

    try {
        const existingRegistration = await ExtensionParticipant.findOne({ program_id, farmer_id });
        if (existingRegistration) {
            return res.status(400).json({ message: 'Already registered for this program' });
        }

        const newRegistration = new ExtensionParticipant({
            program_id,
            farmer_id,
            attendance_status: 'Present',
        });

        await newRegistration.save();
        res.status(201).json({ message: 'Successfully registered for the program', registration: newRegistration });
    } catch (error) {
        console.error('Error during program registration:', error);
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ message: 'Duplicate registration detected.' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   DELETE /api/extension_participants/:programId/:farmerId
// @desc    Cancel a farmer's registration for a program
// @access  Private (requires authentication and authorization)
router.delete('/extension_participants/:programId/:farmerId', async (req, res) => {
    const { programId, farmerId } = req.params;

    // In a real app, you'd verify farmerId against the authenticated user's ID
    // if (req.user._id.toString() !== farmerId) return res.status(403).json({ message: 'Unauthorized action.' });

    try {
        const result = await ExtensionParticipant.deleteOne({
            program_id: programId,
            farmer_id: farmerId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.status(200).json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error('Error during registration cancellation:', error);
        res.status(500).json({ message: 'Server error during cancellation' });
    }
});

module.exports = router;