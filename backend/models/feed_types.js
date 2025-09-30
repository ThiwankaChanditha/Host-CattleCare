const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedTypeSchema = new Schema({
    feed_name: { type: String, required: true, trim: true },
    feed_category: { type: String, enum: ['Green Fodder', 'Concentrate', 'Silage', 'Minerals', 'Other'], required: true },
    nutritional_content: { type: String },
    cost_per_unit: { type: Number },
    unit_of_measure: { type: String, trim: true },
    created_at: { type: Date, default: Date.now }
});

const FeedType = mongoose.model('FeedType', feedTypeSchema);

module.exports = FeedType;
