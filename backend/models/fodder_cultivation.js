const mongoose = require('mongoose');
const { Schema } = mongoose;

const fodderCultivationSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    crop_type: { type: String, required: true, trim: true },
    cultivated_area: { type: Number, required: true },
    planting_date: { type: Date },
    harvest_date: { type: Date },
    yield_per_acre: { type: Number },
    total_yield: { type: Number },
    created_at: { type: Date, default: Date.now }
});

const FodderCultivation = mongoose.model('FodderCultivation', fodderCultivationSchema);

module.exports = FodderCultivation;
