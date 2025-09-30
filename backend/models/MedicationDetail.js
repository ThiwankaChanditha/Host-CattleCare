const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicationDetail = new Schema({
    animalRecordId: {
        type: Schema.Types.ObjectId,
        ref: 'AnimalHealthRecord',
        required: true
    },
    animal_id: {
        type: Schema.Types.ObjectId,
        ref: 'Animal',
        required: true
    },
    medication_name: {
        type: String,
        required: true,
        trim: true
    },
    dosage: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String,
        required: true,
        trim: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: false
    },
    administration_method: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        required: false
    }
}, {
    collection: 'medicationdetail',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const MedicationDetail = mongoose.model('MedicationDetail', medicationDetail);
module.exports = MedicationDetail;

