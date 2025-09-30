const mongoose = require('mongoose');
const { Schema } = mongoose;

const monthlyMilkProductionSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    report_month: { type: Date, required: true },
    total_milk_production: { type: Number, required: true },
    company_id: { type: Schema.Types.ObjectId, ref: 'MilkCompany' },
    average_price_per_liter: { type: Number },
    milk_for_family_consumption: { type: Number, default: 0 },
    milk_for_value_added_products: { type: Number, default: 0 },
    average_daily_cost: { type: Number },
    is_continuous_supplier: { type: Boolean, default: false },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validation_date: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, {
    collection: 'monthly_milk_production',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const MonthlyMilkProduction = mongoose.model('MonthlyMilkProduction', monthlyMilkProductionSchema);

module.exports = MonthlyMilkProduction;
