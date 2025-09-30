const mongoose = require('mongoose');
const { Schema } = mongoose;

const animalSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animal_tag: { type: String, trim: true },
    breed_id: { type: Schema.Types.ObjectId, ref: 'AnimalBreed', required: true },
    animal_type: { type: String, enum: ['Cattle', 'Buffalo'], required: true },
    category: {
        type: String,
        enum: [
            'Milking Cow', 'Dry Cow', 'Pregnant Heifer', 'Non-Pregnant Heifer',
            'Female Calf (<3m)', 'Female Calf (3-12m)', 'Male Calf (<12m)', 'Bull'
        ],
        required: true
    },
    birth_date: { type: Date },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    purchase_date: { type: Date },
    purchase_price: { type: Number },
    current_status: { type: String, enum: ['Active', 'Sold', 'Dead'], default: 'Active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;
