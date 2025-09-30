/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Home, Clipboard, Calendar, BarChart, Settings, Trash2, Activity, FileText, Stethoscope, BarChart3, History } from 'lucide-react'; // Import History icon
import Button from '../vs/components/Button';
import Modal from '../vs/components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';
import EditHealthRecordModal from './components/EditHealthRecordModal';



const AnimalDetail = () => {
    const { id, '*': healthRecordPath } = useParams();
    const recordId = healthRecordPath.split('/').pop();

    console.log('Record ID:', recordId);
    console.log('ID from params:', id);
    const navigate = useNavigate();

    const { showSuccess, showError, showInfo } = useToast();
    const [healthRecord, setHealthRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedRecordData, setEditedRecordData] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { token } = useAuth();


    const API_BASE_URL = "https://host-cattlecare.onrender.com/api" || 'http://localhost:5000';

    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const [isLoading, setIsLoading] = useState(false);

    const fetchHealthRecord = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/vs/animals/${id}/health-record/${recordId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('Fetch response:', response);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch health record');
            }
            const data = await response.json();

            console.log('**Fetched health record data**:', data);

            const normalizedData = { ...data };
            if (normalizedData.treatment_date && typeof normalizedData.treatment_date === 'object' && normalizedData.treatment_date.$date) {
                normalizedData.treatment_date = normalizedData.treatment_date.$date;
            }
            if (normalizedData.follow_up_date && typeof normalizedData.follow_up_date === 'object' && normalizedData.follow_up_date.$date) {
                normalizedData.follow_up_date = normalizedData.follow_up_date.$date;
            }
            setHealthRecord(data);
            setEditedRecordData(normalizedData);
        } catch (err) {
            console.error('Error fetching health record:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (recordId && token) {
            fetchHealthRecord();
        } else if (recordId && !token) {
            setError("Authentication required. Please log in.");
            setLoading(false);
        } else {
            setError("No health record ID provided.");
            setLoading(false);
        }
    }, [recordId, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRecordData({
            ...editedRecordData,
            [name]: value
        });
    };

    const handleVitalsChange = (e) => {
        const { name, value } = e.target;
        setEditedRecordData(prevState => ({
            ...prevState,
            vitals: {
                ...(prevState.vitals || {}),
                [name]: value
            }
        }));
    };

    const handlePrescriptionChange = (index, e) => {
        const { name, value } = e.target;
        const updatedPrescriptions = editedRecordData.prescriptions.map((item, i) =>
            i === index ? { ...item, [name]: value } : item
        );
        setEditedRecordData({
            ...editedRecordData,
            prescriptions: updatedPrescriptions
        });
    };

    const addPrescription = () => {
        setEditedRecordData(prevState => ({
            ...prevState,
            prescriptions: [...(prevState.prescriptions || []), { medication: '', dosage: '' }]
        }));
    };

    const removePrescription = (index) => {
        setEditedRecordData(prevState => ({
            ...prevState,
            prescriptions: prevState.prescriptions.filter((_, i) => i !== index)
        }));
    };

    const handleLabReportChange = (index, e) => {
        const { name, value } = e.target;
        const updatedLabReports = editedRecordData.lab_reports.map((item, i) =>
            i === index ? { ...item, [name]: value } : item
        );
        setEditedRecordData({
            ...editedRecordData,
            lab_reports: updatedLabReports
        });
    };

    const addLabReport = () => {
        setEditedRecordData(prevState => ({
            ...prevState,
            lab_reports: [...(prevState.lab_reports || []), { name: '', url: '' }]
        }));
    };

    const removeLabReport = (index) => {
        setEditedRecordData(prevState => ({
            ...prevState,
            lab_reports: prevState.lab_reports.filter((_, i) => i !== index)
        }));
    };

    const handleSaveEdit = async () => {
        try {
            showInfo('Saving health record changes...');
            if (!token) {
                showError('Authentication required. Please log in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/${id}/health-record/${recordId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(editedRecordData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update health record');
            }

            const updatedRecord = await response.json();
            setHealthRecord(updatedRecord);
            setIsEditModalOpen(false);
            showSuccess('Health record updated successfully!');
        } catch (err) {
            console.error('Error updating health record:', err);
            showError(`Error updating health record: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            showInfo('Deleting health record...');
            if (!token) {
                showError('Authentication required. Please log in.');
                return;
            }

            const response = await fetch(`/api/${id}/health-record/${recordId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to delete health record');
            }

            showSuccess('Health record deleted successfully!');
            setIsDeleteModalOpen(false);
            navigate('/vs/animals');
        } catch (err) {
            console.error('Error deleting health record:', err);
            showError(`Error deleting health record: ${err.message}`);
        }
    };

    const renderTabContent = () => {
        if (!healthRecord) return null;

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Basic Health Record Information */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    Basic Health Record Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Health Issue</label>
                                        <p className="text-gray-900 font-medium">{healthRecord.health_issue}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                                        <p className="text-gray-900 font-medium">{healthRecord.diagnosis}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Treatment</label>
                                        <p className="text-gray-900 font-medium">{healthRecord.treatment}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Recovery Status</label>
                                            <div className="flex items-center mt-1">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${healthRecord.recovery_status === 'Recovered' ? 'bg-green-400' :
                                                    healthRecord.recovery_status === 'Ongoing' ? 'bg-amber-400' : 'bg-red-400'
                                                    }`}></div>
                                                <p className="text-gray-900 font-medium">{healthRecord.recovery_status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-sm font-medium text-gray-600">Treatment Date</label>
                                            <p className="text-gray-900 font-medium">{new Date(healthRecord.treatment_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Information */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    Related Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Animal Tag</span>
                                        <span className="text-gray-900 font-mono  bg-gray-100 px-2 py-1 rounded text-sm">{healthRecord.animal_id?.animal_tag}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Animal Type</span>
                                        <span className="text-gray-900 font-medium">{healthRecord.animal_id?.animal_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Current Status</span>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${healthRecord.animal_id?.current_status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                                                }`}></div>
                                            <span className={`font-medium ${healthRecord.animal_id?.current_status === 'Active' ? 'text-green-700' : 'text-gray-700'
                                                }`}>{healthRecord.animal_id?.current_status}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Farm Name</span>
                                        <span className="text-gray-900 font-medium">{healthRecord.farm_id?.farm_name}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">Treated By</span>
                                        <p className="text-gray-900 font-medium mt-1">{healthRecord.treated_by?.full_name} ({healthRecord.treated_by?.email})</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'vitals':
                return (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                            Vitals
                        </h3>
                        {healthRecord.vitals ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm font-medium text-gray-600">Temperature</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{healthRecord.vitals.temp || 'N/A'}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{healthRecord.vitals.heartRate || 'N/A'}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm font-medium text-gray-600">Respiratory Rate</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{healthRecord.vitals.respiratoryRate || 'N/A'}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm font-medium text-gray-600">Weight</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{healthRecord.vitals.weight || 'N/A'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No vitals available for this record.</p>
                            </div>
                        )}
                    </div>
                );
            case 'prescriptions':
                return (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                            Prescriptions
                        </h3>
                        {healthRecord.prescriptions && healthRecord.prescriptions.length > 0 ? (
                            <div className="space-y-3">
                                {healthRecord.prescriptions.map((p, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-400">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{p.medication}</p>
                                                <p className="text-sm text-gray-600">{p.dosage}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold text-sm">{index + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No prescriptions found for this record.</p>
                            </div>
                        )}
                    </div>
                );
            case 'lab_reports':
                return (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                            Lab Reports
                        </h3>
                        {healthRecord.lab_reports && healthRecord.lab_reports.length > 0 ? (
                            <div className="space-y-3">
                                {healthRecord.lab_reports.map((report, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <a
                                                        href={report.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                                    >
                                                        {report.name}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Report #{index + 1}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No lab reports found for this record.</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading health record details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-red-600">
                            Error: {error}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Could not load the health record. Please try again.
                        </p>
                        <Button variant="primary" className="mt-4" onClick={() => navigate('/vs/animals')}>
                            Back to Animal Records
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!healthRecord) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Health record not found
                        </h2>
                        <p className="mt-2 text-gray-600">
                            The health record you're looking for doesn't exist or has been removed.
                        </p>
                        <Button variant="primary" className="mt-4" onClick={() => navigate('/vs/animals')}>
                            Back to Animal Records
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { name: 'Overview', key: 'overview', icon: Activity },
        { name: 'Vitals', key: 'vitals', icon: Stethoscope },
        { name: 'Prescriptions', key: 'prescriptions', icon: FileText },
        { name: 'Lab Reports', key: 'lab_reports', icon: BarChart3 },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/vs/animals')}
                            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Health Record: M-{recordId?.slice(-5).toUpperCase()} for {healthRecord.animal_id?.animal_tag}
                                </h1>
                                <button
                                    onClick={() => navigate(`/vs/animals/${healthRecord.animal_id?._id}/health-history`)}
                                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-500 hover:to-indigo-500 text-blue-700 hover:text-white font-semibold py-3 px-6 border border-blue-200 hover:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <div className="relative">
                                        <History className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <span className="relative">
                                        Show History
                                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></div>
                                    </span>
                                </button>
                            </div>
                            <div className="border-t border-gray-200 mt-2" />
                        </div>

                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                        {/* Tabs Navigation */}
                        <div className="bg-gradient-to-r from-gray-50 to-white">
                            <nav className="flex space-x-1 p-2" aria-label="Tabs">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex-1 justify-center
                                                ${activeTab === tab.key
                                                    ? 'bg-white text-green-600 shadow-sm ring-1 ring-green-100'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <Button
                            variant="primary"
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center space-x-2"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit Health Record</span>
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center space-x-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Health Record</span>
                        </Button>
                    </div>
                </div>

                {/* Edit Health Record Modal */}
                <EditHealthRecordModal className="max-w-3xl"
                    isEditModalOpen={isEditModalOpen}
                    setIsEditModalOpen={setIsEditModalOpen}
                    editedRecordData={editedRecordData}
                    handleInputChange={handleInputChange}
                    handleVitalsChange={handleVitalsChange}
                    handlePrescriptionChange={handlePrescriptionChange}
                    addPrescription={addPrescription}
                    removePrescription={removePrescription}
                    handleLabReportChange={handleLabReportChange}
                    addLabReport={addLabReport}
                    removeLabReport={removeLabReport}
                    handleSaveEdit={handleSaveEdit}
                    isLoading={isLoading}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Confirm Delete"
                    footer={
                        <>
                            <div>
                                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                                <Button variant="danger" className="ml-3" onClick={handleDelete}>Delete</Button>
                            </div>
                        </>
                    }
                >
                    <div className="flex justify-between">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg" role="alert">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.344a1.5 1.5 0 012.986 0l3.078 6.098a1.5 1.5 0 01-.646 2.05L10.5 13.784l-2.071 1.055a1.5 1.5 0 01-1.286-2.05L8.257 3.344zM10 16a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">
                                        Are you sure you want to delete this health record?
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AnimalDetail;