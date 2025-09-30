const mongoose = require('mongoose');
const { Schema } = mongoose;

const milkCollectionPointSchema = new Schema({
    point_name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    ldi_division_id: { type: Schema.Types.ObjectId, ref: 'AdministrativeDivision', required: true },
    company_id: { type: Schema.Types.ObjectId, ref: 'MilkCompany' },
    capacity_liters: { type: Number },
    operational_status: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const MilkCollectionPoint = mongoose.model('MilkCollectionPoint', milkCollectionPointSchema);

module.exports = MilkCollectionPoint;
