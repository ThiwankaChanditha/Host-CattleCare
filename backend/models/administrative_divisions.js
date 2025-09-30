const mongoose = require('mongoose');
const { Schema } = mongoose;

const administrativeDivisionSchema = new Schema({
    division_name: { type: String, required: true, trim: true },
    division_type: {
        type: String,
        enum: ['GN', 'LDI', 'VS', 'RD', 'PD', 'DG'],
        required: true
    },
    parent_division_id: { type: Schema.Types.ObjectId, ref: 'AdministrativeDivision' },
    created_at: { type: Date, default: Date.now }
}, {
    collection: 'administrative_divisions',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const AdministrativeDivision = mongoose.model('AdministrativeDivision', administrativeDivisionSchema);

module.exports = AdministrativeDivision;
