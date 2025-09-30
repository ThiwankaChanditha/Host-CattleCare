const mongoose = require('mongoose');
const { Schema } = mongoose;

const milkCompanySchema = new Schema({
    company_name: { type: String, required: true, trim: true },
    contact_person: { type: String, trim: true },
    contact_number: { type: String, trim: true },
    address: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const MilkCompany = mongoose.model('MilkCompany', milkCompanySchema);

module.exports = MilkCompany;
