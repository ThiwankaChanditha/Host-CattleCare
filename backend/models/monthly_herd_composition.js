const mongoose = require('mongoose');
const { Schema } = mongoose;

const monthlyHerdCompositionSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    report_month: { type: Date, required: true },
    milking_cows: { type: Number, default: 0 },
    dry_cows: { type: Number, default: 0 },
    pregnant_heifers: { type: Number, default: 0 },
    non_pregnant_heifers: { type: Number, default: 0 },
    female_calves_under_3m: { type: Number, default: 0 },
    female_calves_3_12m: { type: Number, default: 0 },
    male_calves_under_12m: { type: Number, default: 0 },
    bulls: { type: Number, default: 0 },
    total_animals: { type: Number },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validation_date: { type: Date },
    created_at: { type: Date, default: Date.now }
});

monthlyHerdCompositionSchema.pre('save', function (next) {
    this.total_animals =
        this.milking_cows + this.dry_cows + this.pregnant_heifers + this.non_pregnant_heifers +
        this.female_calves_under_3m + this.female_calves_3_12m + this.male_calves_under_12m + this.bulls;
    next();
});

const MonthlyHerdComposition = mongoose.model('MonthlyHerdComposition', monthlyHerdCompositionSchema);

module.exports = MonthlyHerdComposition;
