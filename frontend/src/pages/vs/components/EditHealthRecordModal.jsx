import DatePicker from "react-datepicker";
import { Trash2, X, Plus } from 'lucide-react';

const DatePickerStyles = () => (
    <style>{`
        .react-datepicker-wrapper {
            width: 100%;
            display: block;
        }
        .react-datepicker__input-container {
            width: 100%;
            display: block;
        }
        .react-datepicker__input-container input {
            width: 100%;
        }
        .react-datepicker-popper {
            z-index: 9999 !important;
        }
        .react-datepicker {
            font-family: inherit;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            background-color: white;
        }
        .react-datepicker__header {
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            border-radius: 0.75rem 0.75rem 0 0;
            padding: 1rem 0.5rem 0.5rem;
            border-top-left-radius: 0.75rem;
        }
        .react-datepicker__current-month {
            font-weight: 600;
            color: #374151;
            font-size: 0.9375rem;
            margin-bottom: 0.5rem;
        }
        .react-datepicker__day-names {
            margin-top: 0.5rem;
        }
        .react-datepicker__day-name {
            color: #6b7280;
            font-weight: 600;
            font-size: 0.75rem;
            width: 2rem;
            line-height: 2rem;
            margin: 0.166rem;
        }
        .react-datepicker__month {
            margin: 0.5rem;
        }
        .react-datepicker__week {
            display: flex;
        }
        .react-datepicker__day {
            color: #374151;
            border-radius: 0.375rem;
            transition: all 0.2s;
            width: 2rem;
            line-height: 2rem;
            margin: 0.166rem;
            cursor: pointer;
        }
        .react-datepicker__day:hover {
            background-color: #f3f4f6;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
            background-color: #10b981 !important;
            color: white !important;
            font-weight: 600;
        }
        .react-datepicker__day--selected:hover,
        .react-datepicker__day--keyboard-selected:hover {
            background-color: #059669 !important;
        }
        .react-datepicker__day--disabled {
            color: #d1d5db;
            cursor: not-allowed;
        }
        .react-datepicker__day--disabled:hover {
            background-color: transparent;
        }
        .react-datepicker__day--outside-month {
            color: #d1d5db;
        }
        .react-datepicker__day--today {
            font-weight: 600;
            border: 1px solid #10b981;
        }
        .react-datepicker__navigation {
            top: 1rem;
            width: 2rem;
            height: 2rem;
            border-radius: 0.375rem;
            transition: all 0.2s;
        }
        .react-datepicker__navigation:hover {
            background-color: #f3f4f6;
        }
        .react-datepicker__navigation-icon::before {
            border-color: #6b7280;
            border-width: 2px 2px 0 0;
            height: 7px;
            width: 7px;
            top: 10px;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
            border-color: #374151;
        }
        .react-datepicker__navigation--previous {
            left: 1rem;
        }
        .react-datepicker__navigation--next {
            right: 1rem;
        }
        .react-datepicker__triangle {
            display: none;
        }
    `}</style>
);

const Modal = ({ isOpen, onClose, title, footer, children, contentClassName = "" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <DatePickerStyles />
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 ${contentClassName}`}>
                    <div className="relative bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-6 rounded-t-3xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{title}</h3>
                                <p className="text-white/80 text-sm mt-1">Update the health record details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 p-2 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        {children}
                    </div>

                    {footer && (
                        <div className="flex-shrink-0 flex justify-end gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Button = ({ variant, onClick, type, children, className, disabled }) => {
    let baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    if (variant === "primary") {
        baseStyle += " bg-gradient-to-r from-green-600 to-cyan-600 text-white hover:from-green-700 hover:to-cyan-700 focus:ring-green-500";
    } else if (variant === "secondary") {
        baseStyle += " bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500";
    } else if (variant === "danger") {
        baseStyle += " bg-red-500 text-white hover:bg-red-600 focus:ring-red-500";
    }

    return (
        <button
            type={type || "button"}
            onClick={onClick}
            className={`${baseStyle} ${className || ''}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

const InputField = ({ label, name, type = "text", value, onChange, placeholder, rows, children, required = false }) => {
    const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none";

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "textarea" ? (
                <textarea
                    name={name}
                    id={name}
                    rows={rows || 3}
                    className={inputClasses}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            ) : type === "select" ? (
                <select
                    name={name}
                    id={name}
                    className={inputClasses}
                    value={value}
                    onChange={onChange}
                >
                    {children}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    className={inputClasses}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

const Section = ({ title, children, icon, className = "" }) => (
    <div className={`bg-gradient-to-br from-green-50/30 to-cyan-50/30 rounded-2xl border border-green-100/50 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-green-100/50">
            {icon && <div className="w-6 h-6 text-green-600">{icon}</div>}
            <h4 className="text-lg font-bold text-gray-800">
                {title}
            </h4>
            <div className="flex-1">
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full ml-4"></div>
            </div>
        </div>
        {children}
    </div>
);

const EditHealthRecordModal = ({
    isEditModalOpen,
    setIsEditModalOpen,
    editedRecordData,
    handleInputChange,
    handleVitalsChange,
    handlePrescriptionChange,
    addPrescription,
    removePrescription,
    handleLabReportChange,
    addLabReport,
    removeLabReport,
    handleSaveEdit,
    isLoading
}) => {
    return (
        <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Health Record"
            footer={
                <>
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                        form="editHealthRecordForm"
                        onClick={handleSaveEdit}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </>
            }
        >
            <form id="editHealthRecordForm" onSubmit={handleSaveEdit} className="space-y-8" noValidate>
                {/* Basic Information */}
                <Section title="Health Information" icon="🏥">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <InputField
                            label="Health Issue"
                            name="health_issue"
                            value={editedRecordData.health_issue || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., Lameness, Respiratory infection"
                            required
                        />
                        <InputField
                            label="Recovery Status"
                            name="recovery_status"
                            type="select"
                            value={editedRecordData.recovery_status || ''}
                            onChange={handleInputChange}
                        >
                            <option value="">Select status</option>
                            <option value="Ongoing">🔄 Ongoing</option>
                            <option value="Critical">⚠️ Critical</option>
                            <option value="Healthy">✅ Healthy</option>
                            <option value="Fatal">❌ Fatal</option>
                        </InputField>
                    </div>

                    <div className="mt-6">
                        <InputField
                            label="Diagnosis"
                            name="diagnosis"
                            type="textarea"
                            rows={3}
                            value={editedRecordData.diagnosis || ''}
                            onChange={handleInputChange}
                            placeholder="Detailed diagnosis and observations..."
                        />
                    </div>

                    <div className="mt-6">
                        <InputField
                            label="Treatment"
                            name="treatment"
                            type="textarea"
                            rows={4}
                            value={editedRecordData.treatment || ''}
                            onChange={handleInputChange}
                            placeholder="Describe the treatment plan and procedures..."
                        />
                    </div>
                </Section>

                {/* Vitals Section */}
                <Section title="Vital Signs" icon="📊">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InputField
                            label="Temperature"
                            name="temp"
                            value={editedRecordData.vitals?.temp || ''}
                            onChange={handleVitalsChange}
                            placeholder="°F or °C"
                        />
                        <InputField
                            label="Heart Rate"
                            name="heartRate"
                            value={editedRecordData.vitals?.heartRate || ''}
                            onChange={handleVitalsChange}
                            placeholder="bpm"
                        />
                        <InputField
                            label="Respiratory Rate"
                            name="respiratoryRate"
                            value={editedRecordData.vitals?.respiratoryRate || ''}
                            onChange={handleVitalsChange}
                            placeholder="breaths/min"
                        />
                        <InputField
                            label="Weight"
                            name="weight"
                            value={editedRecordData.vitals?.weight || ''}
                            onChange={handleVitalsChange}
                            placeholder="kg or lbs"
                        />
                    </div>

                    <div className="mt-6">
                        <InputField
                            label="Vitals Notes"
                            name="notes"
                            type="textarea"
                            rows={3}
                            value={editedRecordData.vitals?.notes || ''}
                            onChange={handleVitalsChange}
                            placeholder="Additional notes about vital signs..."
                        />
                    </div>
                </Section>

                {/* Prescriptions Section */}
                <Section title="Prescriptions" icon="💊">
                    <div className="space-y-6">
                        {editedRecordData.prescriptions?.map((p, index) => (
                            <div key={index} className="bg-white/80 rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        Prescription {index + 1}
                                    </h5>
                                    <Button
                                        variant="danger"
                                        onClick={() => removePrescription(index)}
                                        className="p-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <InputField
                                        label="Medication Name"
                                        name="medication"
                                        value={p.medication || ''}
                                        onChange={(e) => handlePrescriptionChange(index, e)}
                                        placeholder="Enter medication name"
                                    />
                                    <InputField
                                        label="Dosage"
                                        name="dosage"
                                        value={p.dosage || ''}
                                        onChange={(e) => handlePrescriptionChange(index, e)}
                                        placeholder="e.g., 500mg"
                                    />
                                    <InputField
                                        label="Frequency"
                                        name="frequency"
                                        value={p.frequency || ''}
                                        onChange={(e) => handlePrescriptionChange(index, e)}
                                        placeholder="e.g., Once daily, BID"
                                    />
                                    <InputField
                                        label="Administration"
                                        name="administrationMethod"
                                        value={p.administrationMethod || ''}
                                        onChange={(e) => handlePrescriptionChange(index, e)}
                                        placeholder="e.g., Oral, Injection"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                                        <DatePicker
                                            selected={p.start_date ? new Date(p.start_date) : null}
                                            onChange={(date) => handlePrescriptionChange(index, { target: { name: 'start_date', value: date ? date.toISOString() : null } })}
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            placeholderText="Select start date"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">End Date</label>
                                        <DatePicker
                                            selected={p.end_date ? new Date(p.end_date) : null}
                                            onChange={(date) => handlePrescriptionChange(index, { target: { name: 'end_date', value: date ? date.toISOString() : null } })}
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            placeholderText="Select end date"
                                        />
                                    </div>
                                </div>

                                <InputField
                                    label="Notes"
                                    name="notes"
                                    type="textarea"
                                    rows={2}
                                    value={p.notes || ''}
                                    onChange={(e) => handlePrescriptionChange(index, e)}
                                    placeholder="Additional notes for this medication..."
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addPrescription}
                            className="w-full border-2 border-dashed border-green-300 rounded-xl p-4 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Prescription
                        </button>
                    </div>
                </Section>

                {/* Lab Reports Section */}
                <Section title="Lab Reports" icon="🔬">
                    <div className="space-y-4">
                        {editedRecordData.lab_reports?.map((r, index) => (
                            <div key={index} className="bg-white/80 rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <InputField
                                            label="Report Name"
                                            name="name"
                                            value={r.name || ''}
                                            onChange={(e) => handleLabReportChange(index, e)}
                                            placeholder="Enter report name"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <InputField
                                            label="Report URL"
                                            name="url"
                                            value={r.url || ''}
                                            onChange={(e) => handleLabReportChange(index, e)}
                                            placeholder="Enter report URL"
                                        />
                                    </div>
                                    <Button
                                        variant="danger"
                                        onClick={() => removeLabReport(index)}
                                        className="p-3 h-12 mb-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addLabReport}
                            className="w-full border-2 border-dashed border-green-300 rounded-xl p-4 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Lab Report
                        </button>
                    </div>
                </Section>
            </form>
        </Modal>
    );
};

export default EditHealthRecordModal;
