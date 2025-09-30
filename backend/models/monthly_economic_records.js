const mongoose = require('mongoose');
const { Schema } = mongoose;

const monthlyEconomicRecordSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    report_month: { type: Date, required: true },
    milk_income: { type: Number, default: 0 },
    other_income: { type: Number, default: 0 },
    feed_costs: { type: Number, default: 0 },
    labor_costs: { type: Number, default: 0 },
    veterinary_costs: { type: Number, default: 0 },
    other_costs: { type: Number, default: 0 },
    net_profit: { type: Number },
    created_at: { type: Date, default: Date.now }
}, {
    collection: 'monthly_economic_records',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

monthlyEconomicRecordSchema.pre('save', function (next) {
    this.net_profit = (this.milk_income + this.other_income) - (this.feed_costs + this.labor_costs + this.veterinary_costs + this.other_costs);
    next();
});

const MonthlyEconomicRecord = mongoose.model('MonthlyEconomicRecord', monthlyEconomicRecordSchema);

module.exports = MonthlyEconomicRecord;
