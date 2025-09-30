import React, { useState, useEffect } from 'react'; // Add useState, useEffect
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to get farmer ID
import axios from 'axios'; // Import axios for API calls

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const translations = {
    en: {
        analyticsReport: "Analytics Report",
        cattleCountOverYears: "Cattle Count Over Years",
        milkProductionVsExpenses: "Milk Production vs Expenses",
        expenseDistribution: "Expense Distribution",
        numberOfCattle: "Number of Cattle",
        milkProductionLiters: "Milk Production (Liters)",
        expensesDollar: "Expenses ($)",
        expenseLabels: ['Feed', 'Labor', 'Healthcare', 'Miscellaneous'],
        loadingAnalytics: "Loading analytics data...",
        errorLoadingAnalytics: "Failed to load analytics data. Please try again.",
        noAnalyticsData: "No analytics data available for this farmer.",
        unauthorized: "You are not authorized to view this page.",
    },
    si: {
        analyticsReport: "විශ්ලේෂණ වාර්තාව",
        cattleCountOverYears: "වසරවල ගව සංඛ්‍යාව",
        milkProductionVsExpenses: "කිරි නිෂ්පාදනය සහ වියදම්",
        expenseDistribution: "වියදම් බෙදාහැරීම",
        numberOfCattle: "ගව සංඛ්‍යාව",
        milkProductionLiters: "කිරි නිෂ්පාදනය (ලීටර්)",
        expensesDollar: "වියදම් ($)",
        expenseLabels: ['ආහාර', 'කම්කරු', 'සෞඛ්‍ය සේවා', 'වෙනත්'],
        loadingAnalytics: "විශ්ලේෂණ දත්ත පූරණය වෙමින් පවතී...",
        errorLoadingAnalytics: "විශ්ලේෂණ දත්ත පූරණය කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.",
        noAnalyticsData: "මෙම ගොවියා සඳහා විශ්ලේෂණ දත්ත නොමැත.",
        unauthorized: "ඔබට මෙම පිටුව බැලීමට අවසර නැත.",
    },
    ta: {
        analyticsReport: "பகுப்பாய்வு அறிக்கை",
        cattleCountOverYears: "ஆண்டுகளின் மாட்டின் எண்ணிக்கை",
        milkProductionVsExpenses: "பால் உற்பத்தி மற்றும் செலவுகள்",
        expenseDistribution: "செலவுகளின் பகிர்வு",
        numberOfCattle: "மாட்டின் எண்ணிக்கை",
        milkProductionLiters: "பால் உற்பத்தி (லிட்டர்கள்)",
        expensesDollar: "செலவுகள் ($)",
        expenseLabels: ['உணவு', 'தொழிலாளர்கள்', 'சுகாதார சேவைகள்', 'வேறு'],
        loadingAnalytics: "பகுப்பாய்வு தரவு ஏற்றப்படுகிறது...",
        errorLoadingAnalytics: "பகுப்பாய்வு தரவை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        noAnalyticsData: "இந்த விவசாயிக்கு பகுப்பாய்வு தரவு இல்லை.",
        unauthorized: "இந்த பக்கத்தைக் காண உங்களுக்கு அங்கீகாரம் இல்லை.",
    },
};

function Analytics() {
    const { language } = useLanguage();
    const t = translations[language];
    const { user, isAuthenticated } = useAuth(); // Get user info from AuthContext

    const [farmData, setFarmData] = useState({
        cattleCount: [],
        milkProduction: [],
        expenses: [],
        years: [],
        expenseDistribution: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = "http://localhost:5000"; // Ensure this matches your backend URL

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            if (!isAuthenticated || !user?.id) {
                setError(t.unauthorized);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = user.token;
                console.log('Frontend: Token sent in request from user object:', token);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`, // Get token from user object
                    },
                };
                const response = await axios.get(`${API_BASE_URL}/api/farmer-analytics/${user.id}`, config);
                setFarmData(response.data);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError(t.errorLoadingAnalytics);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [isAuthenticated, user?.id, t]); // Re-fetch when auth state or user ID changes

    // Data for charts (using fetched farmData)
    const cattleChartData = {
        labels: farmData.years,
        datasets: [
            {
                label: t.numberOfCattle,
                data: farmData.cattleCount,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const milkAndExpensesData = {
        labels: farmData.years,
        datasets: [
            {
                label: t.milkProductionLiters,
                data: farmData.milkProduction,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: t.expensesDollar,
                data: farmData.expenses,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const expenseDistributionData = {
        labels: t.expenseLabels,
        datasets: [
            {
                label: t.expenseDistribution,
                data: farmData.expenseDistribution, // Use fetched data here
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="p-8 bg-white-100 min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-700">{t.loadingAnalytics}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-white-100 min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    // Check if there's *any* data before rendering charts
    const hasData = farmData.cattleCount.length > 0 || farmData.milkProduction.length > 0 || farmData.expenseDistribution.length > 0;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.analyticsReport}</h1> */}

            {!hasData ? (
                <div className="p-10 text-center text-gray-500 text-lg">
                    {t.noAnalyticsData}
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-lg rounded-lg m-2 p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.cattleCountOverYears}</h2>
                        <div className="chart-container" style={{ width: '100%', height: '400px' }}>
                            <Bar
                                data={cattleChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.milkProductionVsExpenses}</h2>
                        <div className="chart-container" style={{ width: '100%', height: '400px' }}>
                            <Line
                                data={milkAndExpensesData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.expenseDistribution}</h2>
                        <div className="chart-container" style={{ width: '100%', height: '400px' }}>
                            <Pie
                                data={expenseDistributionData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Analytics;