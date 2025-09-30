const AnimalHealthRecord = require('../../models/animal_health_records');
const Animal = require('../../models/animals');
const Farm = require('../../models/farms');
const User = require('../../models/users');
const Vitals = require('../../models/vitals');
const LabReports = require('../../models/labreports');
const MedicationDetail = require('../../models/MedicationDetail');
const MedicalHistory = require('../../models/medicalhistory');

exports.getHealthRecordById = async (req, res) => {
    try {
        const recordId = req.params.id;

        const record = await AnimalHealthRecord.findById(recordId)
            .populate('animal_id', 'animal_tag animal_type current_status')
            .populate('farm_id', 'farm_name')
            .populate('treated_by', 'full_name email')
            .populate('vitalsID')
            .populate('medicationIds')
            .lean();

        if (!record) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        record.vitals = record.vitalsID ? {
            temp: record.vitalsID.temperature,
            heartRate: record.vitalsID.heart_rate,
            respiratoryRate: record.vitalsID.respiration_rate,
            weight: record.vitalsID.weight,
            notes: record.vitalsID.notes || ''
        } : null;
        delete record.vitalsID;

        record.prescriptions = (record.medicationIds || []).map(med => ({
            medication: med.medication_name,
            dosage: med.dosage,
            frequency: med.frequency,
            administrationMethod: med.administration_method,
            start_date: med.start_date,
            end_date: med.end_date,
            notes: med.notes || ''
        }));
        delete record.medicationIds;

        res.status(200).json(record);
    } catch (error) {
        console.error('Error fetching health record:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateHealthRecord = async (req, res) => {
    try {
        const recordId = req.params.id;
        const updateData = req.body;

        const normalizeDateField = (dateValue) => {
            if (!dateValue) return dateValue;
            if (typeof dateValue === 'object' && dateValue.$date) {
                return new Date(dateValue.$date);
            }
            return new Date(dateValue);
        };

        const normalizedUpdateData = { ...updateData };
        if (normalizedUpdateData.treatment_date)
            normalizedUpdateData.treatment_date = normalizeDateField(normalizedUpdateData.treatment_date);
        if (normalizedUpdateData.follow_up_date)
            normalizedUpdateData.follow_up_date = normalizeDateField(normalizedUpdateData.follow_up_date);

        const oldRecord = await AnimalHealthRecord.findById(recordId)
            .populate('vitalsID')
            .populate('medicationIds')
            .lean();

        if (!oldRecord) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        let healthRecordUpdate = { ...normalizedUpdateData };
        let newVitalsDocument = null;

        if (normalizedUpdateData.vitals) {
            const vitalsData = {
                temperature: normalizedUpdateData.vitals.temp || normalizedUpdateData.vitals.temperature,
                heart_rate: normalizedUpdateData.vitals.heartRate || normalizedUpdateData.vitals.heart_rate,
                respiration_rate: normalizedUpdateData.vitals.respiratoryRate || normalizedUpdateData.vitals.respiration_rate,
                weight: normalizedUpdateData.vitals.weight,
                notes: normalizedUpdateData.vitals.notes || '',
                animalRecordId: recordId,
                animal_id: oldRecord.animal_id._id
            };
            newVitalsDocument = await Vitals.create(vitalsData);
            healthRecordUpdate.vitalsID = newVitalsDocument._id;
        } else if (normalizedUpdateData.vitalsID) {
            healthRecordUpdate.vitalsID = normalizedUpdateData.vitalsID;
        } else if (oldRecord.vitalsID) {
            healthRecordUpdate.vitalsID = oldRecord.vitalsID._id;
        } else {
            healthRecordUpdate.vitalsID = undefined;
        }

        const medIDs = [];
        if (Array.isArray(normalizedUpdateData.prescriptions)) {
            for (const prescription of normalizedUpdateData.prescriptions) {
                const medData = {
                    medication_name: prescription.medication || '',
                    dosage: prescription.dosage || '',
                    frequency: prescription.frequency || '',
                    administration_method: prescription.administrationMethod || '',
                    start_date: normalizeDateField(prescription.start_date),
                    end_date: normalizeDateField(prescription.end_date),
                    notes: prescription.notes || '',
                    animalRecordId: recordId,
                    animal_id: oldRecord.animal_id._id
                };
                const createdMed = await MedicationDetail.create(medData);
                medIDs.push(createdMed._id);
            }
        } else if (oldRecord.medicationIds) {
            medIDs.push(...oldRecord.medicationIds.map(m => m._id));
        }

        healthRecordUpdate.medicationIds = medIDs;

        const updatedRecord = await AnimalHealthRecord.findByIdAndUpdate(recordId, healthRecordUpdate, { new: true })
            .populate('animal_id', 'animal_tag animal_type current_status')
            .populate('farm_id', 'farm_name')
            .populate('treated_by', 'full_name email')
            .populate('vitalsID')
            .populate('medicationIds')
            .lean();

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Health record not found after update' });
        }

        let createHistoryEntry = false;
        const fieldsToMonitor = ['health_issue', 'diagnosis', 'treatment', 'recovery_status', 'treatment_date', 'follow_up_date', 'cost'];

        for (const field of fieldsToMonitor) {
            const oldVal = oldRecord[field] instanceof Date ? oldRecord[field].toISOString() : oldRecord[field];
            const newVal = updatedRecord[field] instanceof Date ? updatedRecord[field].toISOString() : updatedRecord[field];
            if (newVal !== oldVal) {
                createHistoryEntry = true;
                break;
            }
        }

        if (!createHistoryEntry && ((oldRecord.vitalsID && updatedRecord.vitalsID && oldRecord.vitalsID._id.toString() !== updatedRecord.vitalsID._id.toString())
            || (!oldRecord.vitalsID && updatedRecord.vitalsID)
            || (oldRecord.vitalsID && !updatedRecord.vitalsID))) {
            createHistoryEntry = true;
        }

        if (!createHistoryEntry && (
            (oldRecord.medicationIds && updatedRecord.medicationIds &&
                oldRecord.medicationIds.map(m => m._id.toString()).sort().join(',') !== updatedRecord.medicationIds.map(m => m._id.toString()).sort().join(','))
            || (!oldRecord.medicationIds && updatedRecord.medicationIds.length > 0)
            || (oldRecord.medicationIds && updatedRecord.medicationIds.length === 0))) {
            createHistoryEntry = true;
        }

        if (createHistoryEntry) {
            await MedicalHistory.create({
                animalHealthRecordId: updatedRecord._id,
                animal_id: updatedRecord.animal_id._id,
                farm_id: updatedRecord.farm_id._id,
                health_issue: updatedRecord.health_issue,
                diagnosis: updatedRecord.diagnosis,
                treatment: updatedRecord.treatment,
                treatment_date: updatedRecord.treatment_date,
                treated_by: updatedRecord.treated_by._id,
                follow_up_date: updatedRecord.follow_up_date,
                recovery_status: updatedRecord.recovery_status,
                cost: updatedRecord.cost,
                vitals: updatedRecord.vitalsID ? {
                    temperature: updatedRecord.vitalsID.temperature,
                    heart_rate: updatedRecord.vitalsID.heart_rate,
                    respiration_rate: updatedRecord.vitalsID.respiration_rate,
                    weight: updatedRecord.vitalsID.weight,
                    notes: updatedRecord.vitalsID.notes || ''
                } : null,
                medication: (updatedRecord.medicationIds || []).map(m => ({
                    medication_name: m.medication_name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    start_date: normalizeDateField(m.start_date),
                    end_date: normalizeDateField(m.end_date),
                    administration_method: m.administration_method,
                    notes: m.notes || ''
                })),
                recorded_at: updatedRecord.updated_at || Date.now()
            });
        }

        updatedRecord.vitals = updatedRecord.vitalsID ? {
            temp: updatedRecord.vitalsID.temperature,
            heartRate: updatedRecord.vitalsID.heart_rate,
            respiratoryRate: updatedRecord.vitalsID.respiration_rate,
            weight: updatedRecord.vitalsID.weight,
            notes: updatedRecord.vitalsID.notes || ''
        } : null;
        delete updatedRecord.vitalsID;

        updatedRecord.prescriptions = (updatedRecord.medicationIds || []).map(med => ({
            medication: med.medication_name,
            dosage: med.dosage,
            frequency: med.frequency,
            administrationMethod: med.administration_method,
            start_date: med.start_date,
            end_date: med.end_date,
            notes: med.notes || ''
        }));
        delete updatedRecord.medicationIds;

        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Error updating health record:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.deleteHealthRecord = async (req, res) => {
    try {
        const recordId = req.params.id;
        const deletedRecord = await AnimalHealthRecord.findByIdAndDelete(recordId);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        res.status(200).json({ message: 'Health record deleted successfully' });
    } catch (error) {
        console.error('Error deleting health record:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
