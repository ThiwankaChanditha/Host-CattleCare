const mongoose = require('mongoose');
const { Schema } = mongoose;

const vaccineDetailSchema = new Schema({
    vaccine_name: {
        type: String,
        required: true,
        trim: true
    },
    batch_number: {
        type: String,
        required: false,
        trim: true
    },
    dose: {
        type: String,
        required: true,
        trim: true
    },
    administration_route: {
        type: String,
        required: true,
        trim: true
    },
    administration_date: {
        type: Date,
        required: true
    },
    next_due_date: {
        type: Date,
        required: false 
    },
    administered_by: { 
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: false
    },
    notes: {
        type: String,
        trim: true,
        required: false 
    }
});

const VaccineDetail = mongoose.model('VaccineDetail', vaccineDetailSchema);
module.exports = VaccineDetail;
