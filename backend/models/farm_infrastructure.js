const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmInfrastructureSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    housing_type: { type: String, enum: ['Open', 'Closed', 'Semi-Closed'], required: true },
    milking_system: { type: String, enum: ['Manual', 'Semi-Automated', 'Fully-Automated'], required: true },
    water_source_available: { type: Boolean, default: false },
    fodder_land_area: { type: Number },
    milk_cooling_tank: { type: Boolean, default: false },
    feed_storage_facility: { type: Boolean, default: false },
    biogas_plant: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now }
});

const FarmInfrastructure = mongoose.model('FarmInfrastructure', farmInfrastructureSchema);

module.exports = FarmInfrastructure;
