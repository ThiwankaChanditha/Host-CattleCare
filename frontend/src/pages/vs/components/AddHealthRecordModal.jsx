import React, { useState } from 'react';
import { X, Calendar, Plus, AlertCircle, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, footer, children, contentClassName = "" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 ${contentClassName}`}>
                    <div className="relative bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-6 rounded-t-3xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{title}</h3>
                                <p className="text-blue-100 text-sm mt-1">Fill in the details to create a new health record</p>
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

const Button = ({ variant, onClick, type, children, className, disabled, form, icon: Icon }) => {
    let baseStyle = "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg";

    if (variant === "primary") {
        baseStyle += " bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25";
    } else if (variant === "secondary") {
        baseStyle += " bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-gray-200/50";
    } else if (variant === "danger") {
        baseStyle += " bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-red-500/25";
    }

    return (
        <button
            type={type || "button"}
            onClick={onClick}
            className={`${baseStyle} ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
            disabled={disabled}
            form={form}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

const FormField = ({ label, required, children, icon: Icon }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Ongoing': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
        'Recovered': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
        'Healthy': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
        'Critical': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
        'Fatal': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: X }
    };

    const config = statusConfig[status] || statusConfig['Ongoing'];
    const IconComponent = config.icon;

    return (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <IconComponent className="w-3 h-3" />
            {status}
        </div>
    );
};

const AddHealthRecordModal = ({
    isAddModalOpen = true,
    setIsAddModalOpen = () => { },
    newRecord = {},
    handleInputChange = () => { },
    handleAddRecord = () => { },
    isLoading = false,
    farmers = [
        { _id: '1', full_name: 'John Smith' },
        { _id: '2', full_name: 'Sarah Johnson' },
        { _id: '3', full_name: 'Michael Brown' }
    ],
    animals = [
        { _id: '1', animal_tag: 'COW001', animal_type: 'Dairy Cow' },
        { _id: '2', animal_tag: 'COW002', animal_type: 'Beef Cattle' },
        { _id: '3', animal_tag: 'GOAT001', animal_type: 'Goat' }
    ],
    farms = [
        { _id: '1', farm_name: 'Green Valley Farm' },
        { _id: '2', farm_name: 'Sunrise Ranch' },
        { _id: '3', farm_name: 'Mountain View Farm' }
    ]
}) => {
    const [formData, setFormData] = useState({
        farmer_id: '',
        farm_id: '',
        animal_id: '',
        health_issue: '',
        diagnosis: '',
        treatment: '',
        treatment_date: new Date().toISOString().split('T')[0],
        follow_up_date: '',
        recovery_status: 'Ongoing',
        cost: '',
        ...newRecord
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        handleInputChange(e);
    };

    const handleFarmerChange = (e) => {
        const farmerId = e.target.value;
        handleChange(e);

        if (farmerId !== formData.farmer_id) {
            setTimeout(() => {
                handleInputChange({ target: { name: 'farm_id', value: '' } });
                handleInputChange({ target: { name: 'animal_id', value: '' } });
            }, 0);
        }
    };

    const handleFarmChange = (e) => {
        const farmId = e.target.value;
        handleChange(e);

        if (farmId !== formData.farm_id) {
            handleInputChange({ target: { name: 'animal_id', value: '' } });
        }
    };

    const inputClassName = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300";
    const selectClassName = "w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 cursor-pointer";

    return (
        <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Add New Health Record"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={() => setIsAddModalOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        onClick={handleAddRecord}
                        icon={Plus}
                    >
                        {isLoading ? 'Adding...' : 'Add Record'}
                    </Button>
                </>
            }
        >
            <div
                id="addHealthRecordForm"
                className="space-y-8"
            >
                {/* Primary Information Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Primary Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Farmer" required>
                            <select
                                name="farmer_id"
                                value={formData.farmer_id}
                                onChange={handleFarmerChange}
                                className={selectClassName}
                                required
                            >
                                <option value="">Select a Farmer</option>
                                {farmers.map((farmer) => (
                                    <option key={farmer._id} value={farmer._id}>
                                        {farmer.full_name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Farm Name" required>
                            <select
                                name="farm_id"
                                value={formData.farm_id}
                                onChange={handleFarmChange}
                                className={selectClassName}
                                required
                                disabled={!formData.farmer_id}
                            >
                                <option value="">
                                    {!formData.farmer_id ? 'Select a farmer first' : 'Select a Farm'}
                                </option>
                                {farms.map((farm) => (
                                    <option key={farm._id} value={farm._id}>
                                        {farm.farm_name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Animal Tag" required>
                            <select
                                name="animal_id"
                                value={formData.animal_id}
                                onChange={handleChange}
                                className={selectClassName}
                                required
                                disabled={!formData.farm_id}
                            >
                                <option value="">
                                    {!formData.farm_id ? 'Select a farm first' : 'Select an Animal'}
                                </option>
                                {animals.map((animal) => (
                                    <option key={animal._id} value={animal._id}>
                                        {animal.animal_tag} ({animal.animal_type})
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                </div>

                {/* Health Information Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Health Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Health Issue" required icon={AlertCircle}>
                            <input
                                type="text"
                                name="health_issue"
                                value={formData.health_issue}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="e.g., Lameness, Respiratory infection"
                                required
                            />
                        </FormField>

                        <FormField label="Recovery Status">
                            <div className="relative">
                                <select
                                    name="recovery_status"
                                    value={formData.recovery_status}
                                    onChange={handleChange}
                                    className={selectClassName}
                                >
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Recovered">Recovered</option>
                                    <option value="Healthy">Healthy</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Fatal">Fatal</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <StatusBadge status={formData.recovery_status} />
                                </div>
                            </div>
                        </FormField>

                        <div className="md:col-span-2">
                            <FormField label="Diagnosis">
                                <textarea
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    rows="3"
                                    className={inputClassName + " resize-none"}
                                    placeholder="Detailed diagnosis and observations..."
                                />
                            </FormField>
                        </div>

                        <div className="md:col-span-2">
                            <FormField label="Treatment">
                                <textarea
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleChange}
                                    rows="3"
                                    className={inputClassName + " resize-none"}
                                    placeholder="Treatment plan and medications administered..."
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Schedule & Cost Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-purple-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Schedule & Cost
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Treatment Date" required icon={Calendar}>
                            <input
                                type="date"
                                name="treatment_date"
                                value={formData.treatment_date}
                                onChange={handleChange}
                                className={inputClassName}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </FormField>

                        <FormField label="Follow-up Date" icon={Calendar}>
                            <input
                                type="date"
                                name="follow_up_date"
                                value={formData.follow_up_date}
                                onChange={handleChange}
                                className={inputClassName}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </FormField>

                        <FormField label="Cost (Rs)" icon={DollarSign}>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                className={inputClassName}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </FormField>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddHealthRecordModal;