const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmSchema = new Schema({
    farm_registration_number: { type: String, required: true, unique: true, trim: true },
    farmer_id: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    farm_name: { type: String, trim: true },
    location_address: { type: String, required: true, trim: true },
    gps_coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } 
    },
    gn_division_id: { type: Schema.Types.ObjectId, ref: 'AdministrativeDivision', required: true },
    farm_type: { type: String, enum: ['Intensive', 'Semi-Intensive', 'Extensive'], required: true },
    registration_date: { type: Date, required: true },
    registered_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

farmSchema.index({ gps_coordinates: '2dsphere' });

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
