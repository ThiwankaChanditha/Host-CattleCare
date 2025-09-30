const mongoose = require('mongoose');
const { Schema } = mongoose;

const calvingSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    mother_animal_id: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    calf_animal_id: { type: Schema.Types.ObjectId, ref: 'Animal' },
    calving_date: { type: Date, required: true },
    calving_type: { type: String, enum: ['Natural', 'Assisted', 'Caesarean'], default: 'Natural' },
    calf_gender: { type: String, enum: ['Male', 'Female'], required: true },
    calf_weight: { type: Number },
    complications: { type: String },
    reported_by_farmer: { type: Boolean, default: false },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validation_date: { type: Date },
    created_at: { type: Date, default: Date.now }
});

const Calving = mongoose.model('Calving', calvingSchema);

module.exports = Calving;
