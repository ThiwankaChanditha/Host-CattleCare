import React from 'react';
import { XCircle, Pill, Activity, Calendar, Stethoscope } from 'lucide-react';

const MedicalHistoryModal = ({ isOpen, onClose, medicalHistory, getDisplayValue, animalDetails }) => {
    if (!isOpen) return null;

    const hiddenColumns = ['_id', 'farmer_id', 'farm_id', 'treated_by', 'animal_id', '__v'];

    const formatFieldName = (fieldName) => {
        return fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCellValue = (key, record) => {
        let value;

        if (getDisplayValue && typeof getDisplayValue === 'function') {
            value = getDisplayValue(key, record);
        } else {
            value = record[key];
        }

        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        if (key.toLowerCase().includes('animalhealthrecordid') ||
            key.toLowerCase().includes('animal_health_record_id') ||
            key.toLowerCase().includes('healthrecordid') ||
            key.toLowerCase().includes('recordid')) {
            if (typeof value === 'string' && value.length >= 5) {
                return `M-${value.slice(-5)}`;
            }
            return `M-${String(value).slice(-5)}`;
        }

        if (key.includes('date') && typeof value === 'string') {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            } catch (e) {
                console.log('Invalid date format:', e);
                return value;
            }
        }

        if (key.toLowerCase().includes('medication')) {
            if (Array.isArray(value)) {
                return value.map(med => {
                    if (typeof med === 'object' && med !== null) {
                        const parts = [];
                        if (med.medication_name || med.name) parts.push(med.medication_name || med.name);
                        if (med.dosage) parts.push(`${med.dosage}`);
                        if (med.frequency) parts.push(`${med.frequency}`);
                        return parts.length > 0 ? parts.join(' - ') : 'Medication';
                    }
                    return String(med);
                }).join('; ') || 'N/A';
            }

            if (typeof value === 'string') {
                if (value.startsWith('[') || value.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) {
                            return parsed.map(med => {
                                if (typeof med === 'object' && med !== null) {
                                    const parts = [];
                                    if (med.medication_name || med.name) parts.push(med.medication_name || med.name);
                                    if (med.dosage) parts.push(`${med.dosage}`);
                                    if (med.frequency) parts.push(`${med.frequency}`);
                                    return parts.length > 0 ? parts.join(' - ') : 'Medication';
                                }
                                return String(med);
                            }).join('; ') || 'N/A';
                        } else if (typeof parsed === 'object' && parsed !== null) {
                            const parts = [];
                            if (parsed.medication_name || parsed.name) parts.push(parsed.medication_name || parsed.name);
                            if (parsed.dosage) parts.push(`${parsed.dosage}`);
                            if (parsed.frequency) parts.push(`${parsed.frequency}`);
                            return parts.length > 0 ? parts.join(' - ') : 'Medication';
                        }
                    } catch (e) {
                        console.log('Failed to parse medication JSON:', e);
                        return value;
                    }
                }

                if (value.includes('[object Object]')) {
                    return 'Medication data available';
                }

                return value;
            }

            if (typeof value === 'object' && value !== null) {
                const parts = [];
                if (value.medication_name || value.name) parts.push(value.medication_name || value.name);
                if (value.dosage) parts.push(`${value.dosage}`);
                if (value.frequency) parts.push(`${value.frequency}`);
                return parts.length > 0 ? parts.join(' - ') : 'Medication';
            }
        }

        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed.length > 0 ? parsed.join(', ') : 'N/A';
                }
                return JSON.stringify(parsed, null, 2);
            } catch (e) {
                console.log('Failed to parse JSON:', e);
                return value;
            }
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
    };

    const getVisibleColumns = () => {
        if (medicalHistory.length === 0) return [];
        return Object.keys(medicalHistory[0]).filter(key => !hiddenColumns.includes(key));
    };

    const visibleColumns = getVisibleColumns();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Medical History
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {animalDetails?.animal_tag || animalDetails?.tag_number || 'Selected Animal'}
                            </p>
                        </div>
                    </div>
                    <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={onClose}
                    >
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {medicalHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Stethoscope className="h-10 w-10 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No Medical History
                            </h4>
                            <p className="text-gray-600">
                                No medical records are available for this animal yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                            <div className="overflow-x-auto max-h-[65vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {visibleColumns.map((key, index) => (
                                                <th
                                                    key={key}
                                                    scope="col"
                                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${index === 0 ? 'rounded-tl-xl' : ''
                                                        } ${index === visibleColumns.length - 1 ? 'rounded-tr-xl' : ''}`}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        {key.includes('date') && (
                                                            <Calendar className="h-3 w-3" />
                                                        )}
                                                        {key.includes('medication') && (
                                                            <Pill className="h-3 w-3" />
                                                        )}
                                                        <span>{formatFieldName(key)}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {medicalHistory.map((record, recordIndex) => (
                                            <tr
                                                key={record._id || recordIndex}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                {visibleColumns.map((key, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-6 py-4 text-sm text-gray-900"
                                                    >
                                                        <div className="max-w-xs">
                                                            <span className="block truncate">
                                                                {formatCellValue(key, record)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                        {medicalHistory.length > 0 && (
                            <span>
                                Showing {medicalHistory.length} record{medicalHistory.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryModal;