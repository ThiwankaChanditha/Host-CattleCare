const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmerRatingSchema = new Schema({
    farmer_id: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    rating_period_start: { type: Date, required: true },
    rating_period_end: { type: Date, required: true },
    months_of_continuous_updates: { type: Number, required: true },
    star_rating: { type: Number, required: true, min: 1, max: 5 },
    calculated_date: { type: Date, default: Date.now }
});

const FarmerRating = mongoose.model('FarmerRating', farmerRatingSchema);

module.exports = FarmerRating;
