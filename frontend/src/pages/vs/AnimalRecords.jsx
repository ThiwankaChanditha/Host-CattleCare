/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon, ChevronRight } from 'lucide-react';
import Button from './components/Button';
import Card from './components/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';
import AddHealthRecordModal from './components/AddHealthRecordModal';
import CommonDiseases from './CommonDiseases';
import axios from 'axios';

const getStatusBadgeClasses = (status) => {
    switch (status) {
        case 'Healthy':
            return 'bg-green-100 text-green-800';
        case 'Ongoing':
            return 'bg-yellow-100 text-yellow-800';
        case 'Critical':
            return 'bg-red-100 text-red-800';
        case 'Fatal':
            return 'bg-gray-800 text-white';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
const formatDate = (dateInput) => {
    if (!dateInput) return 'No date';

    let date;

    if (typeof dateInput === 'object' && dateInput.$date) {
        date = new Date(dateInput.$date);
    }
    else if (dateInput instanceof Date) {
        date = dateInput;
    }
    else {
        date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    return date.toISOString().split('T')[0];
};

const isValidDate = (dateInput) => {
    if (!dateInput) return false;

    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput);
    }

    return !isNaN(date.getTime());
};

const safeCreateDate = (dateInput) => {
    if (!dateInput) return null;

    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput);
    }
    return isNaN(date.getTime()) ? null : date;
};

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const AnimalRecords = () => {
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [loading, setLoading] = useState(true);
    const [healthRecords, setHealthRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('healthRecords');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { token, user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [newRecord, setNewRecord] = useState({
        animal_id: '',
        farm_id: '',
        farmer_id: '',
        health_issue: '',
        diagnosis: '',
        treatment: '',
        treatment_date: new Date().toISOString().split('T')[0],
        follow_up_date: '',
        vaccineId: '',
        medicationId: '',
        recovery_status: 'Ongoing',
        cost: '',
        vitals: {},
        prescriptions: [],
        lab_reports: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [animals, setAnimals] = useState([]);
    const [farms, setFarms] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loadingFarms, setLoadingFarms] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(5);
    const [totalRecordsCount, setTotalRecordsCount] = useState(0);

    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterButtonRef = useRef(null);
    const [filters, setFilters] = useState({
        animalType: '',
        recoveryStatus: '',
        dateRange: {
            startDate: '',
            endDate: '',
        },
    });

    const navigate = useNavigate();

    const api = axios.create({
        baseURL: '/api/vs/animal-health-records',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchHealthRecords = async () => {
        try {
            setLoading(true);
            if (activeTab === 'healthRecords') {
                const response = await api.get(`/?page=${currentPage}&limit=${recordsPerPage}&search=${encodeURIComponent(debouncedSearchTerm)}`);
                setHealthRecords(response.data.records);
                setTotalRecordsCount(response.data.totalRecords);
            }
        } catch (error) {
            console.error('Error fetching health records:', error);
            showError('Failed to load health records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) return;
            try {
                const farmersResponse = await api.get('/farmers');
                setFarmers(farmersResponse.data);
            } catch (error) {
                console.error('Error fetching farmers:', error);
                showError('Failed to load farmers data.');
            }
        };

        if (isAuthenticated && !authLoading) {
            fetchInitialData();
        }
    }, [token, isAuthenticated, authLoading]);

    const fetchFarmsByFarmer = async (farmerId) => {
        if (!farmerId) {
            setFarms([]);
            return;
        }

        try {
            setLoadingFarms(true);
            const response = await api.get(`/farms?farmerId=${farmerId}`);
            setFarms(response.data);
        } catch (error) {
            console.error('Error fetching farms for farmer:', error);
            showError('Failed to load farms for selected farmer.');
            setFarms([]);
        } finally {
            setLoadingFarms(false);
        }
    };

    const fetchAnimalsByFarm = async (farmId) => {
        if (!farmId) {
            setAnimals([]);
            return;
        }

        console.log('Fetching animals for farm:', farmId);

        try {
            const response = await api.get(`/animals?farmId=${farmId}`);

            console.log('Animals response:', response.data);
            if (response.data && response.data.animals && response.data.animals.length > 0) {
                setAnimals(response.data.animals);
                console.log(`Found ${response.data.animals.length} animals for farm ${farmId}`);
            } else {
                setAnimals([]);
                showInfo('No animals found for the selected farm.');
            }
        } catch (error) {
            console.error('Error fetching animals for farm:', error);

            if (error.response?.status === 400) {
                showError('Invalid farm ID provided.');
            } else if (error.response?.status === 404) {
                showInfo('No animals found for the selected farm.');
                setAnimals([]);
            } else if (error.response?.status === 500) {
                showError('Server error occurred while fetching animals.');
            } else {
                showError('Failed to load animals for selected farm.');
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchHealthRecords();
        }
    }, [debouncedSearchTerm, currentPage, recordsPerPage, token, isAuthenticated, authLoading, activeTab]);

    const applyFilters = (records) => {
        return records.filter((record) => {
            const matchesAnimalType =
                !filters.animalType ||
                (record.animal_id?.animal_type?.toLowerCase() === filters.animalType.toLowerCase());

            const matchesRecoveryStatus =
                !filters.recoveryStatus ||
                (record.recovery_status?.toLowerCase() === filters.recoveryStatus.toLowerCase());

            const recordDate = safeCreateDate(record.treatment_date);
            const startDate = safeCreateDate(filters.dateRange.startDate);
            const endDate = safeCreateDate(filters.dateRange.endDate);

            const matchesDateRange =
                (!startDate || (recordDate && recordDate >= startDate)) &&
                (!endDate || (recordDate && recordDate <= endDate));

            return matchesAnimalType && matchesRecoveryStatus && matchesDateRange;
        });
    };

    const filteredRecords = applyFilters(healthRecords);
    const totalPages = Math.ceil(totalRecordsCount / recordsPerPage);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const allFetchedHealthyAnimals = healthRecords.filter((record) => record.recovery_status === 'Healthy').length;
    const allFetchedUnderTreatment = healthRecords.filter((record) => record.recovery_status === 'Ongoing').length;
    const allFetchedCriticalCondition = healthRecords.filter((record) => record.recovery_status === 'Critical').length;

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'farmer_id') {
            setNewRecord(prevRecord => ({
                ...prevRecord,
                [name]: value,
                farm_id: '',
                animal_id: ''
            }));

            fetchFarmsByFarmer(value);
            setAnimals([]);
        }
        else if (name === 'farm_id') {
            setNewRecord(prevRecord => ({
                ...prevRecord,
                [name]: value,
                animal_id: ''
            }));

            fetchAnimalsByFarm(value);
        }
        else {
            setNewRecord(prevRecord => ({
                ...prevRecord,
                [name]: value,
            }));
        }
    };

    const handleAddRecord = async () => {
        setIsLoading(true);

        try {
            const requiredFields = {
                farmer_id: 'Farmer',
                farm_id: 'Farm Name',
                animal_id: 'Animal Tag',
                health_issue: 'Health Issue',
                treatment_date: 'Treatment Date'
            };

            const missingFields = [];
            for (const [field, label] of Object.entries(requiredFields)) {
                if (!newRecord[field] || newRecord[field].toString().trim() === '') {
                    missingFields.push(label);
                }
            }

            if (missingFields.length > 0) {
                showWarning(`Please fill in the following required fields: ${missingFields.join(', ')}`);
                setIsLoading(false);
                return;
            }

            if (newRecord.treatment_date && !isValidDate(newRecord.treatment_date)) {
                showWarning('Please enter a valid treatment date.');
                setIsLoading(false);
                return;
            }

            if (newRecord.follow_up_date && !isValidDate(newRecord.follow_up_date)) {
                showWarning('Please enter a valid follow-up date.');
                setIsLoading(false);
                return;
            }

            if (newRecord.follow_up_date && newRecord.treatment_date) {
                const treatmentDate = new Date(newRecord.treatment_date);
                const followUpDate = new Date(newRecord.follow_up_date);
                if (followUpDate <= treatmentDate) {
                    showWarning('Follow-up date must be after the treatment date.');
                    setIsLoading(false);
                    return;
                }
            }

            if (newRecord.cost && (isNaN(parseFloat(newRecord.cost)) || parseFloat(newRecord.cost) < 0)) {
                showWarning('Please enter a valid cost (must be a positive number).');
                setIsLoading(false);
                return;
            }

            const recordPayload = {
                animal_id: newRecord.animal_id.trim(),
                farmer_id: newRecord.farmer_id.trim(),
                farm_id: newRecord.farm_id.trim(),
                health_issue: newRecord.health_issue.trim(),
                diagnosis: newRecord.diagnosis?.trim() || '',
                treatment: newRecord.treatment?.trim() || '',
                treatment_date: newRecord.treatment_date,
                follow_up_date: newRecord.follow_up_date || null,
                vaccineId: newRecord.vaccineId?.trim() || null,
                medicationId: newRecord.medicationId?.trim() || null,
                recovery_status: newRecord.recovery_status || 'Ongoing',
                cost: newRecord.cost ? parseFloat(newRecord.cost) : 0,
                vitals: newRecord.vitals || {},
                prescriptions: newRecord.prescriptions || [],
                lab_reports: newRecord.lab_reports || [],
            };

            console.log('Sending payload:', recordPayload);


            const response = await api.post('/', recordPayload);

            setCurrentPage(1);
            setSearchTerm('');
            setFilters({
                animalType: '',
                recoveryStatus: '',
                dateRange: {
                    startDate: '',
                    endDate: '',
                },
            });

            await fetchHealthRecords();

            const initialRecord = {
                animal_id: '',
                farmer_id: '',
                farm_id: '',
                health_issue: '',
                diagnosis: '',
                treatment: '',
                treatment_date: new Date().toISOString().split('T')[0],
                follow_up_date: '',
                vaccineId: '',
                medicationId: '',
                recovery_status: 'Ongoing',
                cost: '',
                vitals: {},
                prescriptions: [],
                lab_reports: []
            };

            setNewRecord(initialRecord);

            setFarms([]);
            setAnimals([]);

            setIsAddModalOpen(false);
            showSuccess('Health record created successfully!');

        } catch (error) {
            console.error('Error creating health record:', error);

            let errorMessage = 'Failed to create health record.';

            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    errorMessage = data.message || 'Invalid data provided. Please check all fields.';
                } else if (status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                } else if (status === 403) {
                    errorMessage = 'You do not have permission to create health records.';
                } else if (status === 409) {
                    errorMessage = 'A health record with similar details already exists.';
                } else if (status >= 500) {
                    errorMessage = 'Server error occurred. Please try again later.';
                } else {
                    errorMessage = data.message || `Error: ${status}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred.';
            }

            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isValidDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value === 'All' ? '' : value,
        }));
        setCurrentPage(1);
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            dateRange: {
                ...prevFilters.dateRange,
                [name]: value,
            },
        }));
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            animalType: '',
            recoveryStatus: '',
            dateRange: {
                startDate: '',
                endDate: '',
            },
        });
        setCurrentPage(1);
        setIsFilterMenuOpen(false);
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setCurrentPage(1);
        setSearchTerm('');
        handleClearFilters();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'healthRecords':
                return (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <Card className="flex items-center p-4">
                                <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Records</p>
                                    <p className="text-2xl font-semibold text-gray-900">{totalRecordsCount}</p>
                                </div>
                            </Card>
                            <Card className="flex items-center p-4">
                                <div className="bg-green-100 rounded-full p-3 flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Healthy Animals</p>
                                    <p className="text-2xl font-semibold text-gray-900">{allFetchedHealthyAnimals}</p>
                                </div>
                            </Card>
                            <Card className="flex items-center p-4">
                                <div className="bg-yellow-100 rounded-full p-3 flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Under Treatment</p>
                                    <p className="text-2xl font-semibold text-gray-900">{allFetchedUnderTreatment}</p>
                                </div>
                            </Card>
                            <Card className="flex items-center p-4">
                                <div className="bg-red-100 rounded-full p-3 flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Critical Condition</p>
                                    <p className="text-2xl font-semibold text-gray-900">{allFetchedCriticalCondition}</p>
                                </div>
                            </Card>
                        </div>

                        {/* Health Records List */}
                        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <div
                                        key={record._id}
                                        className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                        onClick={() =>
                                            navigate(`/vs/animals/${record.animal_id._id}/health-record/${record._id}`, {
                                                state: { record },
                                            })
                                        }
                                    >
                                        <div className="flex items-start">
                                            {record.recovery_status === 'Healthy' && (
                                                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                                                    <svg
                                                        className="h-5 w-5 text-green-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            {record.recovery_status === 'Ongoing' && (
                                                <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
                                                    <svg
                                                        className="h-5 w-5 text-yellow-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            {record.recovery_status === 'Critical' && (
                                                <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                                                    <svg
                                                        className="h-5 w-5 text-red-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            {record.recovery_status === 'Fatal' && (
                                                <div className="flex-shrink-0 bg-gray-700 p-2 rounded-full">
                                                    <svg
                                                        className="h-5 w-5 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div className="inline-block mb-2">
                                                    <p className="text-sm font-medium text-gray-900 mt-2 mb-1">
                                                        Record M-{record._id.slice(-5).toUpperCase()}
                                                        <span className="ml-1 bg-cyan-100 text-black text-sm px-3 py-1 rounded-full">
                                                            {formatDate(record.treatment_date)}
                                                        </span>
                                                    </p>
                                                    <div className="mt-2 h-0.5 bg-green-400 w-full rounded-2xl"></div>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Animal Tag:</span>{' '}
                                                    {record.animal_id?.animal_tag} &middot;{' '}
                                                    <span className="font-semibold">Animal Type:</span>{' '}
                                                    {record.animal_id?.animal_type}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Farm:</span> {record.farm_id?.farm_name}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Health Issue:</span> {record.health_issue}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Diagnosis:</span> {record.diagnosis}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Treatment:</span> {record.treatment}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
                                                    record.recovery_status
                                                )}`}
                                            >
                                                {record.recovery_status}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-gray-500 text-center">No health records found.</p>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalRecordsCount > recordsPerPage && (
                            <div className="flex justify-between items-center mt-6">
                                <Button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <span className="text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                );
            case 'commonDiseases':
                return <CommonDiseases />;
            default:
                return null;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-gray-700">Loading Animal Health Records...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    return (
        <div className="container mx-auto p-6 bg-white-100 min-h-screen">
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'healthRecords'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => handleTabChange('healthRecords')}
                >
                    Health Records
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'commonDiseases'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => handleTabChange('commonDiseases')}
                >
                    Common Diseases
                </button>
            </div>

            {activeTab === 'healthRecords' && (
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search records (health issue, diagnosis, treatment)"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <Button
                                onClick={() => setIsFilterMenuOpen(prev => !prev)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                                ref={filterButtonRef}
                            >
                                <FilterIcon className="mr-2" size={20} />
                                Filters
                            </Button>
                            {isFilterMenuOpen && (
                                <Card className="absolute right-0 mt-3 w-72 p-6 bg-white shadow-lg border border-gray-200 rounded-xl z-10 transition-all duration-300 transform scale-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="font-semibold text-gray-800 text-lg">Filter Records</h4>
                                        <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="group">
                                            <label htmlFor="animalType" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                                                Animal Type
                                            </label>
                                            <select
                                                id="animalType"
                                                name="animalType"
                                                value={filters.animalType}
                                                onChange={handleFilterChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-gray-700"
                                            >
                                                <option value="">All Types</option>
                                                {[...new Set(animals.map(a => a.animal_type))].map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="group">
                                            <label htmlFor="recoveryStatus" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                                                Recovery Status
                                            </label>
                                            <select
                                                id="recoveryStatus"
                                                name="recoveryStatus"
                                                value={filters.recoveryStatus}
                                                onChange={handleFilterChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-gray-700"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="Healthy">Healthy</option>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Critical">Critical</option>
                                                <option value="Fatal">Fatal</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="group">
                                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                                    From
                                                </label>
                                                <input
                                                    type="date"
                                                    id="startDate"
                                                    name="startDate"
                                                    value={filters.dateRange.startDate}
                                                    onChange={handleDateFilterChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-700"
                                                />
                                            </div>
                                            <div className="group">
                                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                                    To
                                                </label>
                                                <input
                                                    type="date"
                                                    id="endDate"
                                                    name="endDate"
                                                    value={filters.dateRange.endDate}
                                                    onChange={handleDateFilterChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleClearFilters}
                                        className="w-full mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium border border-gray-300"
                                    >
                                        Clear All Filters
                                    </Button>
                                </Card>
                            )}
                        </div>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-700"
                        >
                            <PlusIcon className="mr-2" size={20} />
                            Add Health Record
                        </Button>
                    </div>
                </div>
            )}

            {renderTabContent()}

            <AddHealthRecordModal
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                newRecord={newRecord}
                handleInputChange={handleInputChange}
                handleAddRecord={handleAddRecord}
                isLoading={isLoading}
                animals={animals}
                farms={farms}
                farmers={farmers}
            />
        </div>
    );
};

export default AnimalRecords;