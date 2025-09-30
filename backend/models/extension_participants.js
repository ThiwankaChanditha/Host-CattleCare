// src/models/extension_participants.js (or the filename you prefer for this model)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const extensionParticipantSchema = new Schema({ // Renamed schema variable
    program_id: { type: Schema.Types.ObjectId, ref: 'ExtensionProgram', required: true },
    farmer_id: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    attendance_status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
    feedback: { type: String },
    created_at: { type: Date, default: Date.now }
});

// Ensure unique registration per farmer per program
extensionParticipantSchema.index({ program_id: 1, farmer_id: 1 }, { unique: true });

const ExtensionParticipant = mongoose.model('ExtensionParticipant', extensionParticipantSchema); // Renamed model name

module.exports = ExtensionParticipant;