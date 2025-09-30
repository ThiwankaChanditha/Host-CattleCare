const mongoose = require('mongoose');
const { Schema } = mongoose;

const vaccinationSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animal_id: { type: Schema.Types.ObjectId, ref: 'Animal' },
    program_id: { type: Schema.Types.ObjectId, ref: 'VaccinationProgram', required: true },
    vaccination_date: { type: Date, required: true },
    batch_number: { type: String, trim: true },
    administered_by: { type: Schema.Types.ObjectId, ref: 'User' },
    next_due_date: { type: Date },
    created_at: { type: Date, default: Date.now }
});

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);

module.exports = Vaccination;
