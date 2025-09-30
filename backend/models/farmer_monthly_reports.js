const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmerMonthlyReportSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    report_month: { type: Date, required: true },
    birth_reported: { type: Boolean, default: false },
    death_reported: { type: Boolean, default: false },
    purchase_reported: { type: Boolean, default: false },
    sale_reported: { type: Boolean, default: false },
    company_change_reported: { type: Boolean, default: false },
    total_milk_production: { type: Number },
    submitted_date: { type: Date, default: Date.now },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validation_date: { type: Date },
    validation_status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
},{
    collection: 'farmer_monthly_reports',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const FarmerMonthlyReport = mongoose.model('FarmerMonthlyReport', farmerMonthlyReportSchema);

module.exports = FarmerMonthlyReport;
