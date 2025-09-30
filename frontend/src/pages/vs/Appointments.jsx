/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, EditIcon, TrashIcon, ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import Button from './components/Button';
import Modal from './components/Modal';
import Card from './components/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';
import LandscapeModal from './components/LandscapeModal';

const Appointments = () => {
    const { token, isAuthenticated, loading: authLoading, logout } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [loading, setLoading] = useState(true);
    const [appointmentsList, setAppointmentsList] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isLandscapeModalOpen, setIsLandscapeModalOpen] = useState(false);
    const openLandscapeModal = () => setIsLandscapeModalOpen(true);
    const closeLandscapeModal = () => setIsLandscapeModalOpen(false);
    const [newAppointment, setNewAppointment] = useState({
        farmerId: '',
        farmId: '',
        animalTag: '',
        date: '',
        time: '',
        procedure: '',
        notes: '',
        status_flag: 'Scheduled'
    });

    const [allFarmers, setAllFarmers] = useState([]);
    const [availableFarms, setAvailableFarms] = useState([]);
    const [availableAnimals, setAvailableAnimals] = useState([]);
    const [procedures, setProcedures] = useState([]);

    const [isEditMode, setIsEditMode] = useState(false);
    const editModeRef = useRef(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            console.error("User not authenticated. Redirecting to login.");
            return;
        }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (authLoading) return;

            if (!isAuthenticated || !token) {
                console.error("No authentication token found. Please log in.");
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const appointmentsRes = await fetch('/api/vs/appointments', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!appointmentsRes.ok) {
                    if (appointmentsRes.status === 401) {
                        logout();
                        return;
                    }
                    const errorData = await appointmentsRes.json();
                    throw new Error(errorData.message || `HTTP error! status: ${appointmentsRes.status}`);
                }
                const appointmentsData = await appointmentsRes.json();
                console.log("Fetched appointmentsData:", appointmentsData);
                setAppointmentsList(appointmentsData);

                const farmersRes = await fetch('/api/vs/appointments/farmers-by-division', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!farmersRes.ok) {
                    if (farmersRes.status === 401) {
                        logout();
                        return;
                    }
                    const errorData = await farmersRes.json();
                    throw new Error(errorData.message || `HTTP error! status: ${farmersRes.status}`);
                }
                const farmersData = await farmersRes.json();
                setAllFarmers(farmersData);

                const defaultProcedures = [
                    'Routine Check-up',
                    'Vaccination',
                    'De-worming',
                    'Castration/Neutering',
                    'Artificial Insemination',
                    'Pregnancy Diagnosis',
                    'Treatment of Illness',
                    'Surgery',
                    'Hoof Trimming',
                    'Wound Dressing',
                    'Disease Testing (e.g., TB, Brucellosis)',
                    'Ultrasound Scanning',
                    'Parasite Control',
                    'Follow-up Visit',
                    'Nutritional Consultation',
                    'Dental Care'
                ];

                setProcedures(defaultProcedures);

                setSelectedDate(null);
                setCurrentMonth(new Date());

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                if (error.message.includes('401')) {
                    logout();
                } else {
                    showError(`Error fetching initial data: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [authLoading, isAuthenticated, token, logout, showError]);

    useEffect(() => {
        if (isEditMode || !newAppointment.farmerId || !isAuthenticated || !token) {
            return;
        }

        const fetchFarms = async () => {
            console.log("Fetching farms for farmer ID:", newAppointment.farmerId);
            if (!newAppointment.farmerId || !isAuthenticated || !token) {
                setAvailableFarms([]);
                setNewAppointment(prev => ({ ...prev, farmId: '', animalTag: '' }));
                return;
            }

            try {
                const farmer = allFarmers.find(f => f._id === newAppointment.farmerId);
                if (farmer && farmer.farms && farmer.farms.length > 0) {
                    setAvailableFarms(farmer.farms);
                    setNewAppointment(prev => ({ ...prev, farmId: '', animalTag: '' }));
                } else {
                    const res = await fetch(`/api/vs/appointments/farms-by-farmer/${newAppointment.farmerId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!res.ok) {
                        if (res.status === 401) {
                            logout();
                            return;
                        }
                        const errorData = await res.json();
                        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
                    }

                    const data = await res.json();
                    setAvailableFarms(data);
                    setNewAppointment(prev => ({ ...prev, farmId: '', animalTag: '' }));
                }
            } catch (error) {
                console.error("Failed to fetch farms:", error);
                if (error.message.includes('401')) {
                    logout();
                } else {
                    showError(`Error fetching farms: ${error.message}`);
                }
            }
        };

        fetchFarms();
    }, [newAppointment.farmerId, allFarmers, token, isAuthenticated, logout, showError, isEditMode]);

    useEffect(() => {
        if (isEditMode || !newAppointment.farmId || !isAuthenticated || !token) {
            return;
        }

        const fetchAnimals = async () => {
            if (!newAppointment.farmId || !isAuthenticated || !token) {
                setAvailableAnimals([]);
                setNewAppointment(prev => ({ ...prev, animalTag: '' }));
                return;
            }

            try {
                const res = await fetch(`/api/vs/appointments/animals-by-farm/${newAppointment.farmId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        logout();
                        return;
                    }
                    const errorData = await res.json();
                    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setAvailableAnimals(data);
                setNewAppointment(prev => ({ ...prev, animalTag: '' }));
            } catch (error) {
                console.error("Failed to fetch animals:", error);
                if (error.message.includes('401')) {
                    logout();
                } else {
                    showError(`Error fetching animals: ${error.message}`);
                }
            }
        };

        fetchAnimals();
    }, [newAppointment.farmId, token, isAuthenticated, logout, showError, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment({
            ...newAppointment,
            [name]: value
        });
    };

    const handleAddAppointment = async () => {
        if (!isAuthenticated || !token) {
            showWarning('You must be logged in to schedule an appointment.');
            return;
        }

        const { animalTag, date, time, procedure, notes, farmerId, farmId, status_flag } = newAppointment;

        if (!farmerId || !farmId || !animalTag || !date || !time || !procedure || !status_flag) {
            showWarning('Please fill all required fields: Farmer, Farm, Animal, Date, Time, Procedure, and Status.');
            return;
        }

        const [hour, minute] = time.split(':').map(Number);
        const selectedAnimal = availableAnimals.find(animal => animal.animal_tag === animalTag);
        const formattedAnimalTag = selectedAnimal ? `${selectedAnimal.animal_type} (${selectedAnimal.animal_tag})` : animalTag;

        const appointmentData = {
            animal_tag: formattedAnimalTag,
            farmer_id: farmerId,
            farm_id: farmId,
            date: date,
            hour: hour,
            minute: minute,
            procedure: procedure,
            notes: notes,
            status_flag: status_flag
        };

        try {
            showInfo('Scheduling appointment...');

            const response = await fetch('/api/vs/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const addedAppointment = await response.json();
            setAppointmentsList(prevList => [...prevList, addedAppointment]);

            setNewAppointment({
                farmerId: '',
                farmId: '',
                animalTag: '',
                date: '',
                time: '',
                procedure: '',
                notes: '',
                status_flag: 'Scheduled'
            });
            setIsAddModalOpen(false);
            setIsLandscapeModalOpen(false);
            showSuccess('Appointment scheduled successfully!');
        } catch (error) {
            console.error("Failed to schedule appointment:", error);
            if (error.message.includes('401')) {
                logout();
            } else {
                showError(`Error scheduling appointment: ${error.message}`);
            }
        }
    };

    const handleEditAppointment = async () => {
        if (!isAuthenticated || !token || !selectedAppointment) {
            showWarning('You must be logged in to edit an appointment.');
            return;
        }

        const { animalTag, date, time, procedure, notes, farmerId, farmId, status_flag } = newAppointment;

        if (!farmerId || !farmId || !animalTag || !date || !time || !procedure || !status_flag) {
            showWarning('Please fill all required fields: Farmer, Farm, Animal, Date, Time, Procedure, and Status.');
            return;
        }

        const [hour, minute] = time.split(':').map(Number);
        const selectedAnimal = availableAnimals.find(animal => animal.animal_tag === animalTag);
        const formattedAnimalTag = selectedAnimal ? `${selectedAnimal.animal_type} (${selectedAnimal.animal_tag})` : animalTag;

        const appointmentData = {
            animal_tag: formattedAnimalTag,
            farmer_id: farmerId,
            farm_id: farmId,
            date: date,
            hour: hour,
            minute: minute,
            procedure: procedure,
            notes: notes,
            status_flag: status_flag
        };

        try {
            showInfo('Updating appointment...');

            const response = await fetch(`/api/vs/appointments/${selectedAppointment._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const updatedAppointment = await response.json();
            setAppointmentsList(prevList =>
                prevList.map(appointment =>
                    appointment._id === selectedAppointment._id ? updatedAppointment : appointment
                )
            );

            setNewAppointment({
                farmerId: '',
                farmId: '',
                animalTag: '',
                date: '',
                time: '',
                procedure: '',
                notes: '',
                status_flag: 'Scheduled'
            });
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
            showSuccess('Appointment updated successfully!');
        } catch (error) {
            console.error("Failed to update appointment:", error);
            if (error.message.includes('401')) {
                logout();
            } else {
                showError(`Error updating appointment: ${error.message}`);
            }
        }
    };

    const handleDeleteAppointment = async () => {
        if (!isAuthenticated || !token || !selectedAppointment) {
            showWarning('You must be logged in to delete an appointment.');
            return;
        }

        try {
            showInfo('Deleting appointment...');

            const response = await fetch(`/api/vs/appointments/${selectedAppointment._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setAppointmentsList(prevList =>
                prevList.filter(appointment => appointment._id !== selectedAppointment._id)
            );

            setIsDeleteModalOpen(false);
            setSelectedAppointment(null);
            showSuccess('Appointment deleted successfully!');
        } catch (error) {
            console.error("Failed to delete appointment:", error);
            if (error.message.includes('401')) {
                logout();
            } else {
                showError(`Error deleting appointment: ${error.message}`);
            }
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        if (!isAuthenticated || !token) {
            showWarning('You must be logged in to update appointment status.');
            return;
        }

        try {
            const response = await fetch(`/api/vs/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setAppointmentsList(prevList =>
                prevList.map(appointment =>
                    appointment._id === appointmentId ? { ...appointment, status: newStatus } : appointment
                )
            );
            showSuccess('Appointment status updated!');
        } catch (error) {
            console.error("Failed to update status:", error);
            if (error.message.includes('401')) {
                logout();
            } else {
                showError(`Error updating status: ${error.message}`);
            }
        }
    };

    const openEditModal = async (appointment) => {
        setIsEditMode(true);
        setSelectedAppointment(appointment);

        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toISOString().split('T')[0];
        const farmerId = appointment.farmer_id?._id || appointment.farmer_id || '';
        const farmId = appointment.farm_id?._id || appointment.farm_id || '';

        const originalAnimalTag = appointment.animal_tag;
        const extractedTag = originalAnimalTag.includes('(')
            ? originalAnimalTag.substring(originalAnimalTag.indexOf('(') + 1, originalAnimalTag.indexOf(')'))
            : originalAnimalTag;

        let tempAppointmentData = {
            farmerId,
            farmId,
            animalTag: extractedTag,
            date: formattedDate,
            time: appointment.time || '',
            procedure: appointment.procedure || '',
            notes: appointment.notes || '',
            status_flag: appointment.status_flag || 'Scheduled'
        };

        setAvailableFarms([]);
        setAvailableAnimals([]);

        try {
            if (farmerId) {
                const farmsRes = await fetch(`/api/vs/appointments/farms-by-farmer/${farmerId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const farmsData = farmsRes.ok ? await farmsRes.json() : [];
                setAvailableFarms(farmsData);

                if (farmId) {
                    const animalsRes = await fetch(`/api/vs/appointments/animals-by-farm/${farmId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const animalsData = animalsRes.ok ? await animalsRes.json() : [];
                    setAvailableAnimals(animalsData);
                }
            }
        } catch (error) {
            console.error("Failed to fetch data for editing:", error);
            showError(`Error fetching data: ${error.message}`);
        } finally {
            setNewAppointment(tempAppointmentData);
            setIsEditModalOpen(true);
        }
    };

    const openDeleteModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedAppointment(null);
        setIsEditMode(false);
        setNewAppointment({
            farmerId: '',
            farmId: '',
            animalTag: '',
            date: '',
            time: '',
            procedure: '',
            notes: '',
            status_flag: 'Scheduled'
        });
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getDateOnlyString = (date) =>
        date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');

    const hasAppointments = (date) => {
        const dateString = getDateOnlyString(date);
        return appointmentsList.some(appointment => {
            if (!appointment.date) return false;
            const appDate = getDateOnlyString(new Date(appointment.date));
            return appDate === dateString;
        });
    };

    const filteredAppointments = selectedDate
        ? appointmentsList.filter(appointment => {
            if (!appointment.date) return false;
            const appDate = getDateOnlyString(new Date(appointment.date));
            return appDate === getDateOnlyString(selectedDate);
        })
        : appointmentsList;

    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const days = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysAppointments = appointmentsList.filter(appointment => {
        if (!appointment.date) return false;
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to view appointments.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900"></h1>
                <div className="mt-4 sm:mt-0">
                    <Button variant="primary" onClick={openLandscapeModal}>
                        <PlusIcon className="h-5 w-5 mr-1" />
                        New Appointment
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5 items-stretch">
                {/* First column: Calendar Card */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">
                                        {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                    </h2>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={goToPreviousMonth}
                                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                                    </button>
                                    <button
                                        onClick={goToNextMonth}
                                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-6">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-sm font-semibold text-gray-500 py-3">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => (
                                    <div key={index} className="aspect-square">
                                        {day ? (
                                            <button
                                                onClick={() => setSelectedDate(day)}
                                                className={`w-full h-full rounded-2xl text-sm font-semibold relative overflow-hidden transition-all duration-300 ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isToday(day)
                                                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                                    : selectedDate && isSameDay(day, selectedDate)
                                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                                        : hasAppointments(day)
                                                            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200'
                                                            : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="relative z-10">{day.getDate()}</span>

                                                {hasAppointments(day) && (!selectedDate || !isSameDay(day, selectedDate)) && !isToday(day) && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-sm animate-pulse"></div>
                                                )}

                                                {/* Selected indicator */}
                                                {selectedDate && isSameDay(day, selectedDate) && (
                                                    <div className="absolute top-2 right-2 bg-white/30 rounded-full p-0.5">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}

                                                {/* Today indicator glow */}
                                                {isToday(day) && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-2xl animate-pulse"></div>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="w-full h-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Clear filter button */}
                            {selectedDate && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                    >
                                        <span>Clear Date Filter</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bottom accent line */}
                        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600"></div>
                    </div>
                </div>

                {/* Second Column: Today's Appointments */}
                <div className="lg:col-span-1">
                    <Card title="Today's Appointments">
                        {todaysAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {todaysAppointments.map(appointment => (
                                    <div key={appointment._id} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100/50 hover:border-gray-200/80">
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-xl shadow-sm ${appointment.status_flag === 'Completed' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                                appointment.status_flag === 'Scheduled' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                    appointment.status_flag === 'In-Progress' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                                        'bg-gradient-to-r from-gray-400 to-gray-500'
                                                }`}>
                                                <CalendarIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                                                    {appointment.time} - {appointment.animal_tag || 'Unknown Animal'}
                                                </h3>
                                                <p className="text-xs text-gray-600 truncate flex items-center">
                                                    <span className="truncate">
                                                        {appointment.farm_id?.farm_name || 'Unknown Farm'}
                                                    </span>
                                                    <span className="mx-2 text-gray-400">•</span>
                                                    <span className="truncate">
                                                        {appointment.farmer_id?.full_name || 'Unknown Farmer'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="ml-3 flex flex-col items-center">
                                                <div className={`h-3 w-3 rounded-full shadow-sm ${appointment.status_flag === 'Completed' ? 'bg-emerald-500' :
                                                    appointment.status_flag === 'Scheduled' ? 'bg-blue-500' :
                                                        appointment.status_flag === 'In-Progress' ? 'bg-amber-500' :
                                                            'bg-gray-400'
                                                    }`}></div>
                                                <span className={`text-xs font-medium mt-1 ${appointment.status_flag === 'Completed' ? 'text-emerald-600' :
                                                    appointment.status_flag === 'Scheduled' ? 'text-blue-600' :
                                                        appointment.status_flag === 'In-Progress' ? 'text-amber-600' :
                                                            'text-gray-500'
                                                    }`}>
                                                    {appointment.status_flag === 'In-Progress' ? 'Active' : appointment.status_flag}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-xl inline-block mb-4">
                                    <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">No appointments scheduled for today</p>
                                <p className="text-gray-400 text-xs mt-1">Check back tomorrow or schedule a new appointment</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Third Column: Appointments Overview */}
                <div className="lg:col-span-1">
                    <Card title="Appointments Overview">
                        <div className="space-y-3">
                            {/* Total Appointments */}
                            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-blue-100/50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-sm">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-blue-700 mb-1">Total Appointments</p>
                                        <p className="text-2xl font-bold text-blue-900">{appointmentsList.length}</p>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                            </div>

                            {/* Scheduled */}
                            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-purple-100/50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl shadow-sm">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-purple-700 mb-1">Scheduled</p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {appointmentsList.filter(a => a.status_flag === 'Scheduled').length}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                            </div>

                            {/* Completed */}
                            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-emerald-100/50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-xl shadow-sm">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-emerald-700 mb-1">Completed</p>
                                        <p className="text-2xl font-bold text-emerald-900">
                                            {appointmentsList.filter(a => a.status_flag === 'Completed').length}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                            </div>

                            {/* In Progress */}
                            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-amber-100/50">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl shadow-sm">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-amber-700 mb-1">In Progress</p>
                                        <p className="text-2xl font-bold text-amber-900">
                                            {appointmentsList.filter(a => a.status_flag === 'In-Progress').length}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols gap-6">
                <div className="lg:col-span-2">
                    <Card title={`Appointments for ${selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All Dates'}`}>
                        {filteredAppointments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 first:rounded-tl-xl">
                                                Time
                                            </th>
                                            {!selectedDate && (
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                    Date
                                                </th>
                                            )}
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                Animal
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                Farm
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                Farmer
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                Procedure
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 last:rounded-tr-xl">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {filteredAppointments
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((appointment, index) => (
                                                <tr key={appointment._id} className={`border-b border-gray-50 hover:bg-gradient-to-r hover:from-gray-25 hover:to-white transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-gray-900 bg-blue-50 px-3 py-1 rounded-full">
                                                            {appointment.time}
                                                        </span>
                                                    </td>
                                                    {!selectedDate && (
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                                                            {new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-lg mr-3">
                                                                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">{appointment.animalName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                                                        {appointment.farm_id?.farm_name}
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-700">
                                                        {appointment.farmer_id?.full_name}
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                            {appointment.procedure}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`h-3 w-3 rounded-full shadow-sm ${appointment.status_flag === 'Completed' ? 'bg-emerald-500' :
                                                                appointment.status_flag === 'Scheduled' ? 'bg-blue-500' :
                                                                    appointment.status_flag === 'In-Progress' ? 'bg-amber-500' :
                                                                        appointment.status_flag === 'Cancelled' ? 'bg-red-500' :
                                                                            'bg-gray-400'
                                                                }`}></div>
                                                            <select
                                                                value={appointment.status_flag}
                                                                onChange={e => handleStatusChange(appointment._id, e.target.value)}
                                                                className={`block py-2 px-3 border-0 bg-gradient-to-r rounded-lg shadow-sm focus:outline-none focus:ring-2 text-xs font-medium min-w-[120px] transition-all duration-200 ${appointment.status_flag === 'Completed' ? 'from-emerald-50 to-green-50 text-emerald-700 focus:ring-emerald-500' :
                                                                    appointment.status_flag === 'Scheduled' ? 'from-blue-50 to-indigo-50 text-blue-700 focus:ring-blue-500' :
                                                                        appointment.status_flag === 'In-Progress' ? 'from-amber-50 to-orange-50 text-amber-700 focus:ring-amber-500' :
                                                                            appointment.status_flag === 'Cancelled' ? 'from-red-50 to-pink-50 text-red-700 focus:ring-red-500' :
                                                                                'from-gray-50 to-gray-100 text-gray-700 focus:ring-gray-500'
                                                                    }`}
                                                            >
                                                                <option value="Scheduled">Scheduled</option>
                                                                <option value="In-Progress">In-Progress</option>
                                                                <option value="Completed">Completed</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(appointment)}
                                                                className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                                                                title="Edit Appointment"
                                                            >
                                                                <EditIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(appointment)}
                                                                className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 hover:text-red-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                                                                title="Delete Appointment"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
                                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                                <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                                    No appointments scheduled for this date. Create a new appointment to get started.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={openLandscapeModal}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    New Appointment
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Add Appointment Modal */}
            <LandscapeModal
                title="Schedule New Appointment"
                isOpen={isLandscapeModalOpen}
                onClose={closeLandscapeModal}
                newAppointment={newAppointment}
                handleInputChange={handleInputChange}
                allFarmers={allFarmers}
                availableFarms={availableFarms}
                availableAnimals={availableAnimals}
                procedures={procedures}
                onSubmit={
                    (e) => {
                        e.preventDefault();
                        handleAddAppointment();
                    }}
            />

            {/* Edit Appointment Modal */}
            <LandscapeModal
                title="Edit Appointment"
                isOpen={isEditModalOpen}
                onClose={closeModals}
                newAppointment={newAppointment}
                handleInputChange={handleInputChange}
                allFarmers={allFarmers}
                availableFarms={availableFarms}
                availableAnimals={availableAnimals}
                procedures={procedures}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleEditAppointment();
                }}
                isLoading={false}
            />

            {/* Delete Appointment Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeModals}
                title="Delete Appointment"
                footer={
                    <>
                        <Button variant="danger" onClick={handleDeleteAppointment} className="ml-3">
                            Delete
                        </Button>
                        <Button variant="secondary" onClick={closeModals}>
                            Cancel
                        </Button>
                    </>
                }
            >
                <div class="bg-red-50 border-l-4 border-red-500 p-4" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.344a1.5 1.5 0 012.986 0l3.078 6.098a1.5 1.5 0 01-.646 2.05L10.5 13.784l-2.071 1.055a1.5 1.5 0 01-1.286-2.05L8.257 3.344zM10 16a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-800">
                                Are you sure you want to delete this appointment?
                            </p>
                        </div>
                    </div>
                </div>
                {selectedAppointment && (
                    <div className="bg-white p-6 rounded-lg shadow-md mt-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Appointment Details</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Animal Tag</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.animal_tag}</dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Farmer Name</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.farmer_id?.full_name || 'N/A'}</dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Farm Name</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.farm_id?.farm_name || 'N/A'}</dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Date</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{new Date(selectedAppointment.date).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Time</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.time}</dd>
                            </div>
                            <div className="flex flex-col">
                                <dt className="font-medium text-gray-500">Procedure</dt>
                                <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.procedure}</dd>
                            </div>
                            {selectedAppointment.notes && (
                                <div className="flex flex-col md:col-span-2"> {/* Span full width for notes */}
                                    <dt className="font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 font-semibold text-gray-900">{selectedAppointment.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Appointments;