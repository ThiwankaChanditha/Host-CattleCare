const mongoose = require('mongoose');
const { Schema } = mongoose;

const inspectionTaskSchema = new Schema({
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    task_type: {
        type: String,
        enum: ['Calving Verification', 'Death Verification', 'Purchase Verification', 'Sale Verification', 'Routine Inspection'],
        required: true
    },
    task_description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
    created_date: { type: Date, default: Date.now },
    due_date: { type: Date },
    completed_date: { type: Date },
    notes: { type: String }
});

const InspectionTask = mongoose.model('InspectionTask', inspectionTaskSchema);

module.exports = InspectionTask;
