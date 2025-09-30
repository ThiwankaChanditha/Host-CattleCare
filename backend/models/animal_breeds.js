const mongoose = require('mongoose');
const { Schema } = mongoose;

const animalBreedSchema = new Schema({
    breed_name: { type: String, required: true, trim: true },
    animal_type: { type: String, enum: ['Cattle', 'Buffalo'], required: true },
    origin_country: { type: String, trim: true },
    characteristics: { type: String },
    created_at: { type: Date, default: Date.now }
});

const AnimalBreed = mongoose.model('AnimalBreed', animalBreedSchema);

module.exports = AnimalBreed;
