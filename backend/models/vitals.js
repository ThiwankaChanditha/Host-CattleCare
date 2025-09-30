const mongoose = require('mongoose');
const { Schema } = mongoose;

const vitals = new Schema({
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
    temperature: {
        type: Number,
        required: true
    },
    heart_rate: {
        type: Number,
        required: true
    },
    respiration_rate: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        required: false
    }
}, {
    collection: 'vitals',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Vitals = mongoose.model('Vitals', vitals);

module.exports = Vitals;