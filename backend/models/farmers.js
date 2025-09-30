const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmerSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nic: { type: String, required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    education_level: { type: String },
    income_level: { type: String },
    occupation: { type: String },
    ethnicity: { type: String },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    religion: { type: String },
    marital_status: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    household_size: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    ldi_officer_id: { type: Schema.Types.ObjectId, ref: 'User', required: false } // LDI officer who added this farmer
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
