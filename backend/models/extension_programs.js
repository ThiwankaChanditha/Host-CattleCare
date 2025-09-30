const mongoose = require('mongoose');
const { Schema } = mongoose;

const extensionProgramSchema = new Schema({
    program_name: { type: String, required: true, trim: true },
    program_type: {
        type: String,
        enum: ['Training', 'Field Day', 'Workshop', 'Demonstration'],
        required: true
    },
    description: { type: String },
    conducted_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    program_date: { type: Date, required: true },
    location: { type: String },
    participants_count: { type: Number, default: 0 },
    flyer: { type: String },
    created_at: { type: Date, default: Date.now }
});

const ExtensionProgram = mongoose.model('ExtensionProgram', extensionProgramSchema);

module.exports = ExtensionProgram;
