const mongoose = require('mongoose');
const VaccineDetail = require('./VaccineDetail');
const { Schema } = mongoose;

const animalHealthRecordSchema = new Schema({
    animal_id: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    health_issue: { type: String, required: true },
    diagnosis: { type: String },
    treatment: { type: String },
    treatment_date: { type: Date, required: true },
    treated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    follow_up_date: { type: Date },
    vitalsID: { type: Schema.Types.ObjectId, ref: 'Vitals' },
    labReportsID: { type: Schema.Types.ObjectId, ref: 'LabReports' },
    vaccineId: { type: Schema.Types.ObjectId, ref: 'VaccineDetail' },
    medicationIds: [{ type: Schema.Types.ObjectId, ref: 'MedicationDetail' }],
    recovery_status: { type: String, enum: ['Ongoing', 'Critical', 'Healthy', 'Death'], default: 'Ongoing' },
    cost: { type: Number },
    created_at: { type: Date, default: Date.now }
}, {
    collection: 'animal_health_records',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const AnimalHealthRecord = mongoose.model('AnimalHealthRecord', animalHealthRecordSchema);

module.exports = AnimalHealthRecord;
