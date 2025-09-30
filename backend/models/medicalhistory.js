const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
    animalHealthRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnimalHealthRecord',
        required: true
    },
    animal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal',
        required: true
    },
    farm_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    health_issue: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: true
    },
    treatment_date: {
        type: Date,
        required: true
    },
    treated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    follow_up_date: {
        type: Date
    },
    recovery_status: {
        type: String,
        enum: ['Ongoing', 'Healthy', 'Critical', 'Deceased'],
        default: 'Ongoing'
    },
    cost: {
        type: Number,
        default: 0
    },
    vitals: {
        temperature: Number,
        heart_rate: Number,
        respiration_rate: Number,
        weight: Number,
        notes: String
    },
    medication: [{
        medication_name: String,
        dosage: String,
        frequency: String,
        start_date: Date,
        end_date: Date,
        administration_method: String,
        notes: String
    }],
    recorded_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);
