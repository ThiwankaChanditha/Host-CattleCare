import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Stethoscope, FileText, Plus, CheckCircle2, Play, Ban } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Scheduled': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar },
        'In-Progress': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Play },
        'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
        'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: Ban }
    };

    const config = statusConfig[status] || statusConfig['Scheduled'];
    const IconComponent = config.icon;

    return (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <IconComponent className="w-3 h-3" />
            {status}
        </div>
    );
};

const FormField = ({ label, required, children, icon: Icon, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const Button = ({ variant, onClick, type, children, className, disabled, icon: Icon }) => {
    let baseStyle = "inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg";

    if (variant === "primary") {
        baseStyle += " bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-500/25";
    } else if (variant === "secondary") {
        baseStyle += " bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-gray-200/50";
    }

    return (
        <button
            type={type || "button"}
            onClick={onClick}
            className={`${baseStyle} ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
            disabled={disabled}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

const LandscapeModal = ({
    title = "Schedule Appointment",
    isOpen = true,
    onClose = () => { },
    newAppointment = {},
    handleInputChange = () => { },
    allFarmers = [
        { _id: '1', full_name: 'John Smith' },
        { _id: '2', full_name: 'Sarah Johnson' },
        { _id: '3', full_name: 'Michael Brown' }
    ],
    availableFarms = [
        { _id: '1', farm_name: 'Green Valley Farm' },
        { _id: '2', farm_name: 'Sunrise Ranch' },
        { _id: '3', farm_name: 'Mountain View Farm' }
    ],
    availableAnimals = [
        { animal_tag: 'COW001', animal_type: 'Dairy Cow' },
        { animal_tag: 'COW002', animal_type: 'Beef Cattle' },
        { animal_tag: 'GOAT001', animal_type: 'Goat' }
    ],
    procedures = [
        'Vaccination',
        'Health Checkup',
        'Artificial Insemination',
        'Surgery',
        'Dental Care',
        'Hoof Trimming'
    ],
    onSubmit = () => { },
    isLoading = false
}) => {
    const [formData, setFormData] = useState({
        farmerId: '',
        farmId: '',
        animalTag: '',
        date: '',
        time: '',
        procedure: '',
        status_flag: 'Scheduled',
        notes: '',
        ...newAppointment
    });

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            ...newAppointment
        }));
    }, [newAppointment, availableFarms, availableAnimals]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        handleInputChange(e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    if (!isOpen) return null;

    const inputClassName = "w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 hover:border-gray-300";
    const selectClassName = "w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 hover:border-gray-300 cursor-pointer";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 ">
                    <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{title}</h3>
                                <p className="text-green-100 text-sm mt-1">Schedule a new veterinary appointment</p>
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
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border-2 border-green-100">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField label="Farmer" required icon={User}>
                                        <select
                                            name="farmerId"
                                            value={formData.farmerId}
                                            onChange={handleChange}
                                            className={selectClassName}
                                            required
                                        >
                                            <option value="">Select farmer</option>
                                            {allFarmers.map(farmer => (
                                                <option key={farmer._id} value={farmer._id}>
                                                    {farmer.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Farm" required icon={MapPin}>
                                        <select
                                            name="farmId"
                                            value={formData.farmId}
                                            onChange={handleChange}
                                            className={selectClassName}
                                            required
                                            disabled={!formData.farmerId || availableFarms.length === 0}
                                        >
                                            <option value="">Select farm</option>
                                            {availableFarms.map(farm => (
                                                <option key={farm._id} value={farm._id}>
                                                    {farm.farm_name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Animal" required>
                                        <select
                                            name="animalTag"
                                            value={formData.animalTag}
                                            onChange={handleChange}
                                            className={selectClassName}
                                            required
                                            disabled={!formData.farmId || availableAnimals.length === 0}
                                        >
                                            <option value="">Select animal</option>
                                            {availableAnimals.map(animal => (
                                                <option key={animal.animal_tag} value={animal.animal_tag}>
                                                    {animal.animal_type} ({animal.animal_tag})
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border-2 border-green-100">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Appointment Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <FormField label="Date" required icon={Calendar}>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Time" required icon={Clock}>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Procedure" required icon={Stethoscope}>
                                        <select
                                            name="procedure"
                                            value={formData.procedure}
                                            onChange={handleChange}
                                            className={selectClassName}
                                            required
                                        >
                                            <option value="">Select procedure</option>
                                            {procedures.map((procedure, index) => (
                                                <option key={index} value={typeof procedure === 'string' ? procedure : procedure.name}>
                                                    {typeof procedure === 'string' ? procedure : procedure.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Status" required>
                                        <div className="relative">
                                            <select
                                                name="status_flag"
                                                value={formData.status_flag}
                                                onChange={handleChange}
                                                className={selectClassName}
                                                required
                                            >
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="In-Progress">In-Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <StatusBadge status={formData.status_flag} />
                                            </div>
                                        </div>
                                    </FormField>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border-2 border-green-100">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    Additional Information
                                </h4>
                                <FormField label="Notes" icon={FileText}>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={4}
                                        className={inputClassName + " resize-none"}
                                        placeholder="Add any additional notes or special instructions for the appointment..."
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex justify-end gap-4 px-8 py-6 bg-gray-50 border-t-2 border-gray-100 rounded-b-3xl">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            icon={Plus}
                        >
                            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandscapeModal;
