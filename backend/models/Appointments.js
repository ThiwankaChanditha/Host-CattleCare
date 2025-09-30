const mongoose = require('mongoose')
const { Schema } = mongoose

const appointmentSchema = new Schema({
    created_at: { type: Date, default: Date.now },
    date: { type: Date, required: true },
    hour: { type: Number, min: 0, max: 23 },
    minute: { type: Number, min: 0, max: 59 },
    animal_tag: { type: String, required: true },
    farmer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    procedure: { type: String },
    status_flag: { type: String, enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'] },
    notes: { type: String },
    veterinary_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Appointments = mongoose.model('Appointments', appointmentSchema);

module.exports = Appointments