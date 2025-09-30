/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, ClipboardIcon, HomeIcon, ClipboardListIcon, BarChartIcon, SettingsIcon, XIcon, AlertTriangleIcon, ActivityIcon } from 'lucide-react';
import AreaStats from './components/AreaStats';
import Card from './components/Card';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { token, isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState({ name: 'Loading...' });
    const [areaStats, setAreaStats] = useState({
        activeFarms: 0,
        totalCattle: 0,
        totalBuffalo: 0,
        totalAnimals: 0,
        totalFarmers: 0,
        ldiCount: 0,
        activeProjects: 0,
    });
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [pendingValidations, setPendingValidations] = useState([]);
    const [affectedAnimals, setAffectedAnimals] = useState([]);
    const [recoveringAnimals, setRecoveringAnimals] = useState([]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const fetchData = async () => {
            if (!isAuthenticated || !token) {
                console.error("Dashboard: User not authenticated or token missing after AuthContext load. Redirecting.");
                navigate('/login');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/api/vs/dashboard', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const {
                    userProfile: backendUserProfile,
                    areaStats: backendAreaStats,
                    appointments: backendAppointments,
                    pendingValidations: backendPendingValidations,
                    affectedAnimals: backendAffectedAnimals,
                    recoveringAnimals: backendRecoveringAnimals,
                } = response.data;

                setUserProfile(backendUserProfile);
                setAreaStats(backendAreaStats);
                setTodaysAppointments(backendAppointments);
                setPendingValidations(backendPendingValidations);
                setAffectedAnimals(backendAffectedAnimals);
                setRecoveringAnimals(backendRecoveringAnimals);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error.response && error.response.status === 401) {
                    console.log("Token expired or invalid, logging out.");
                    logout();
                    navigate('/login');
                } else {
                    console.error("Failed to fetch dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, token, authLoading, logout, navigate]);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const getStatusBadgeClasses = (status) => {
        switch (status) {
            case 'Scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'In-progress':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isAuthenticated) {
        return <p>Redirecting...</p>;
    }

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Welcome, {userProfile.name} 👋</h1>
                            <p className="mt-1 text-sm text-gray-500">{currentDate}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3">
                            <Link
                                to="/vs/animals"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <ClipboardIcon className="mr-2 h-5 w-5 text-gray-500" />
                                Animal Records
                            </Link>
                            <Link
                                to="/vs/appointments"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <CalendarIcon className="mr-2 h-5 w-5 text-white" />
                                Appointments
                            </Link>
                        </div>
                    </div>

                    <AreaStats
                        activeFarms={areaStats.activeFarms}
                        totalCattle={areaStats.totalCattle}
                        totalFarmers={areaStats.totalFarmers}
                        ldiCount={areaStats.ldiCount}
                        activeProjects={areaStats.activeProjects}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <div>
                            <Card title="Today's Appointments">
                                {todaysAppointments.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {todaysAppointments.map((appointment) => (
                                            <li key={appointment.id} className="py-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {appointment.time} - {appointment.animalName[0 - 5]} {appointment.animalId}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {appointment.farm} • {appointment.procedure}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No appointments scheduled for today. 🗓️</p>
                                )}
                                <div className="mt-4">
                                    <Link to="/vs/appointments" className="text-sm font-medium text-green-600 hover:text-green-500">
                                        View all appointments →
                                    </Link>
                                </div>
                            </Card>
                        </div>
                        <div>
                            <Card title="Affected Animals">
                                {affectedAnimals.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {affectedAnimals.slice(0, 3).map((animal) => (
                                            <li key={animal.id} className="py-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {animal.animalName} • {animal.animalType}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {animal.farm} • {animal.condition}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${animal.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {animal.status}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No affected animals currently reported. 😌</p>
                                )}
                                <div className="mt-4">
                                    <Link to="/vs/animals?status=affected" className="text-sm font-medium text-green-600 hover:text-green-500">
                                        View all affected animals →
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}