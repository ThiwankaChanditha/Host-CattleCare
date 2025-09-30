const mongoose = require('mongoose');
const { Schema } = mongoose;

const vaccinationProgramSchema = new Schema({
    program_name: { type: String, required: true, trim: true },
    disease_target: { type: String, required: true, trim: true },
    vaccine_type: { type: String, trim: true },
    frequency_months: { type: Number },
    description: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const VaccinationProgram = mongoose.model('VaccinationProgram', vaccinationProgramSchema);

module.exports = VaccinationProgram;
