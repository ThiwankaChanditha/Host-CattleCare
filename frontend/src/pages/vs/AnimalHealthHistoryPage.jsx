/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from './components/Button';
import { Activity, Calendar, Stethoscope, FileText, BarChart3, ArrowLeft, Eye, Search, ChevronDown, ChevronUp, Heart, Thermometer, Weight, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';

const AnimalHealthHistoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [animalInfo, setAnimalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRecordId, setExpandedRecordId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();
    const { showError } = useToast();

    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchAnimalHistory = async () => {
        if (!id || !token) {
            setLoading(false);
            setError("Animal ID or authentication token missing.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/vs/animal-history/${id}/health-history`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch animal history');
            }
            const data = await response.json();

            if (data.animal) {
                setAnimalInfo(data.animal);
            }
            if (data.healthRecords) {
                setHistory(data.healthRecords);
                setFilteredHistory(data.healthRecords);
            } else if (Array.isArray(data)) {
                setHistory(data);
                setFilteredHistory(data);
            }
        } catch (err) {
            console.error('Error fetching animal history:', err);
            setError(err.message);
            showError(`Error fetching history: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimalHistory();
    }, [id, token]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredHistory(history);
            return;
        }
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = history.filter(record => {
            const dateStr = formatDate(record.treatment_date).toLowerCase();
            const healthIssue = (record.health_issue || '').toLowerCase();
            const diagnosis = (record.diagnosis || '').toLowerCase();
            const treatment = (record.treatment || '').toLowerCase();
            const recoveryStatus = (record.recovery_status || '').toLowerCase();
            const followUp = formatDate(record.follow_up_date).toLowerCase();

            return (
                dateStr.includes(lowerSearch) ||
                healthIssue.includes(lowerSearch) ||
                diagnosis.includes(lowerSearch) ||
                treatment.includes(lowerSearch) ||
                recoveryStatus.includes(lowerSearch) ||
                followUp.includes(lowerSearch)
            );
        });
        setFilteredHistory(filtered);
    }, [searchTerm, history]);

    const getRecoveryStatusColor = (status) => {
        switch (status) {
            case 'Healthy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Ongoing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Critical':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Fatal':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Not available';

        let dateObj;
        if (typeof date === 'object' && date.$date) {
            dateObj = new Date(date.$date);
        } else {
            dateObj = new Date(date);
        }

        return dateObj.toLocaleDateString();
    };

    const handleViewRecord = (recordId) => {
        if (expandedRecordId === recordId) {
            setExpandedRecordId(null);
        } else {
            setExpandedRecordId(recordId);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = "green" }) => (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto p-6">
                {/* Header Section with Search */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-cyan-600 rounded-t-3xl px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="text-white">
                                <h1 className="text-3xl font-bold mb-2">Health History</h1>
                                {animalInfo && (
                                    <div className="flex items-center gap-4 text-white/90">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-5 h-5" />
                                            <span className="text-lg font-medium">{animalInfo.animal_tag}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="w-5 h-5" />
                                            <span>{animalInfo.animal_type}</span>
                                        </div>
                                    </div>
                                )}
                                {!animalInfo && (
                                    <p className="text-white/90">Animal ID: {id}</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/vs/animals')}
                                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Records
                            </button>
                        </div>
                    </div>

                    {/* Search Bar inside header container */}
                    <div className="px-8 py-6">
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search by date, health issue, diagnosis, treatment, or status..."
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200">
                    <div className="p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent absolute top-0"></div>
                                </div>
                                <p className="text-lg text-gray-700 mt-6">Loading health history...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
                                <p className="text-gray-600 mb-6">Error: {error}</p>
                                <button
                                    onClick={fetchAnimalHistory}
                                    className="bg-gradient-to-r from-green-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-cyan-700 transition-all duration-200"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No health records found</h3>
                                <p className="text-gray-600">Health records will appear here once they are added.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredHistory.map((record) => (
                                    <div key={record._id} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                        {/* Record Header */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-5 h-5" />
                                                        <span className="font-semibold">{formatDate(record.treatment_date)}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRecoveryStatusColor(record.recovery_status)}`}>
                                                        {record.recovery_status || 'Unknown'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleViewRecord(record._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-cyan-50 text-green-700 rounded-xl hover:from-green-100 hover:to-cyan-100 transition-all duration-200 font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>{expandedRecordId === record._id ? 'Hide Details' : 'View Details'}</span>
                                                    {expandedRecordId === record._id ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Health Issue</h4>
                                                    <p className="text-gray-900 font-medium">{record.health_issue}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Diagnosis</h4>
                                                    <p className="text-gray-700">{record.diagnosis || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Treatment Cost</h4>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                        <span className="text-gray-900 font-medium">
                                                            {record.cost ? `${record.cost.toFixed(2)}` : 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedRecordId === record._id && (
                                            <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50/50 to-white p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* Basic Information */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                <FileText className="w-5 h-5 text-green-600" />
                                                                Medical Information
                                                            </h3>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Record ID:</span>
                                                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{record.animalHealthRecordId || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Treatment Date:</span>
                                                                    <span className="font-medium">{formatDate(record.treatment_date)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Follow-up Date:</span>
                                                                    <span className="font-medium">{formatDate(record.follow_up_date)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Treated By:</span>
                                                                    <span className="font-medium">{record.treated_by?.full_name || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 mb-2">Treatment Details</h4>
                                                            <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{record.treatment || 'Not specified'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Vitals and Medications */}
                                                    <div className="space-y-6">
                                                        {record.vitals && (
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                    <Activity className="w-5 h-5 text-blue-600" />
                                                                    Vital Signs
                                                                </h3>
                                                                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Thermometer className="w-4 h-4 text-red-500" />
                                                                            <span>Temperature</span>
                                                                        </div>
                                                                        <span className="font-medium">{record.vitals.temperature || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Heart className="w-4 h-4 text-red-500" />
                                                                            <span>Heart Rate</span>
                                                                        </div>
                                                                        <span className="font-medium">{record.vitals.heart_rate || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Activity className="w-4 h-4 text-blue-500" />
                                                                            <span>Respiration</span>
                                                                        </div>
                                                                        <span className="font-medium">{record.vitals.respiration_rate || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Weight className="w-4 h-4 text-green-500" />
                                                                            <span>Weight</span>
                                                                        </div>
                                                                        <span className="font-medium">{record.vitals.weight || 'N/A'}</span>
                                                                    </div>
                                                                    {record.vitals.notes && (
                                                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                                                            <p className="text-sm text-gray-700">{record.vitals.notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {record.medication && record.medication.length > 0 && (
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                                    <Stethoscope className="w-5 h-5 text-purple-600" />
                                                                    Medications
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {record.medication.map((med, index) => (
                                                                        <div key={index} className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <h4 className="font-semibold text-gray-900">{med.medication_name}</h4>
                                                                                <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                                                    {med.dosage}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                                <p><strong>Frequency:</strong> {med.frequency}</p>
                                                                                <p><strong>Method:</strong> {med.administration_method}</p>
                                                                                <p><strong>Duration:</strong> {formatDate(med.start_date)} - {formatDate(med.end_date)}</p>
                                                                                {med.notes && <p><strong>Notes:</strong> {med.notes}</p>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimalHealthHistoryPage;