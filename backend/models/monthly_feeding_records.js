const mongoose = require('mongoose');
const { Schema } = mongoose;

const monthlyFeedingRecordSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    report_month: { type: Date, required: true },
    feed_type_id: { type: Schema.Types.ObjectId, ref: 'FeedType', required: true },
    quantity_used: { type: Number, required: true },
    cost: { type: Number },
    created_at: { type: Date, default: Date.now }
});

const MonthlyFeedingRecord = mongoose.model('MonthlyFeedingRecord', monthlyFeedingRecordSchema);

module.exports = MonthlyFeedingRecord;
