const mongoose = require('mongoose');
const { Schema } = mongoose;

const artificialInseminationSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animal_id: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    ai_date: { type: Date, required: true },
    bull_breed: { type: String, trim: true },
    technician_name: { type: String, trim: true },
    technician_code: { type: String, trim: true },
    semen_code: { type: String, trim: true },
    pregnancy_status: { type: String, enum: ['Unknown', 'Pregnant', 'Not Pregnant', 'Aborted'], default: 'Unknown' },
    pregnancy_check_date: { type: Date },
    expected_calving_date: { type: Date },
    performed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

const ArtificialInsemination = mongoose.model('ArtificialInsemination', artificialInseminationSchema);

module.exports = ArtificialInsemination;
