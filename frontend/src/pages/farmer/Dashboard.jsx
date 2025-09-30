/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/Card";
import MonthlyUpdate from "../../components/FarmerMonthlyUpdate";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Baby, Milk, Tractor } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow } from '@fortawesome/free-solid-svg-icons';

const headerTranslations = {
    en: {
        welcome: 'Welcome!',
        selectLanguage: 'Select Language',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ்',
    },
    si: {
        welcome: 'සාදරයෙන් පිළිගනිමු!',
        selectLanguage: 'භාෂාව තෝරන්න',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ்',
    },
    ta: {
        welcome: 'வரவேற்பு!',
        selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
        english: 'English',
        sinhala: 'சிங்களம்',
        tamil: 'தமிழ்',
    },
};

const translations = {
    en: {
        dashboard: "Dashboard",
        loadingData: "Loading dashboard data...",
        errorFetchingData: "Error loading dashboard data.",
        noAuthError: "Authentication token missing. Please log in.",
        networkError: "Network error. Please check your internet connection.",
        unauthorizedAccess: "Unauthorized access. Please log in again.",
        farmsCount: "FARMS",
        cattleCount: "CATTLE COUNT",
        calvingsCount: "CALVINGS COUNT",
        milkCollection: "MILK COLLECTION",
        sales: "SALES",
        notApplicable: "N/A",
    },
    si: {
        dashboard: "ආවරණ පුවරුව",
        loadingData: "ආවරණ පුවරු දත්ත පූරණය වෙමින් පවතී...",
        errorFetchingData: "ආවරණ පුවරු දත්ත පූරණය කිරීමේ දෝෂයක්.",
        noAuthError: "සත්‍යාපන ටෝකනය නැත. කරුණාකර නැවත පිවිසෙන්න.",
        networkError: "ජාල දෝෂයකි. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න.",
        unauthorizedAccess: "අනවසර ප්‍රවේශය. කරුණාකර නැවත පිවිසෙන්න.",
        farmsCount: "ගොවිපල ගණන",
        cattleCount: "ගව ගණන",
        calvingsCount: "දරු ප්‍රසූත ගණන",
        milkCollection: "කිරි එකතුව",
        sales: "විකුණුම්",
        notApplicable: "අදාළ නොවේ",
    },
    ta: {
        dashboard: "பலகை",
        loadingData: "கட்டுப்பாட்டு பலகை தரவு ஏற்றப்படுகிறது...",
        errorFetchingData: "கட்டுப்பாட்டு பலகை தரவை ஏற்றுவதில் பிழை.",
        noAuthError: "அங்கீகார டோக்கன் இல்லை. தயவுசெய்து உள்நுழையவும்.",
        networkError: "பிணைய பிழை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்.",
        unauthorizedAccess: "அங்கீகரிக்கப்படாத அணுகல். தயவுசெய்து மீண்டும் உள்நுழையவும்.",
        farmsCount: "பண்ணைகள்",
        cattleCount: "கால்நடைகளின் எண்ணிக்கை",
        calvingsCount: "கன்று ஈன்ற எண்ணிக்கை",
        milkCollection: "பால் சேகரிப்பு",
        sales: "விற்பனை",
        notApplicable: "பொருந்தாது",
    },
};

export default function Dashboard() {
    const { language, changeLanguage } = useLanguage();
    const t = translations[language];
    const ht = headerTranslations[language];
    const { user, logout } = useAuth();

    const [dashboardCards, setDashboardCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const Header = () => (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
                {ht.welcome}{" "}{user?.username}
            </h1>

            <div className="flex items-center space-x-2 mt-3 md:mt-0">
                <label htmlFor="header-language" className="font-medium text-gray-700">
                    {ht.selectLanguage}:
                </label>
                <select
                    id="header-language"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                >
                    <option value="en">{ht.english}</option>
                    <option value="si">{ht.sinhala}</option>
                    <option value="ta">{ht.tamil}</option>
                </select>
            </div>
        </div>
    );


    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const token = user?.token || user?.accessToken;
        if (!token) {
            setError(t.noAuthError);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/dashboard/summary', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError(`${t.unauthorizedAccess}`);
                    logout();
                } else {
                    setError(t.errorFetchingData);
                }
                throw new Error("API response not OK");
            }

            const result = await response.json();
            if (result.status === 'success') {
                const data = result.data;
                const cardsData = [
                    {
                        id: 'farms',
                        title: 'farmsCount',
                        value: data.numberOfFarms,
                        change: 'notApplicable',
                        icon: Tractor,
                        color: 'blue'
                    },
                    {
                        id: 'cattleCount',
                        title: 'cattleCount',
                        value: data.cattleCount,
                        change: 'notApplicable',
                        icon: () => <FontAwesomeIcon icon={faCow} />,
                        color: 'green'
                    },
                    {
                        id: 'calvingsCount',
                        title: 'calvingsCount',
                        value: data.calvingsCount,
                        change: 'notApplicable',
                        icon: Baby,
                        color: 'purple'
                    },
                    {
                        id: 'milkCollection',
                        title: 'milkCollection',
                        value: data.milkCollection,
                        change: 'notApplicable',
                        icon: Milk,
                        color: 'teal'
                    },
                ];
                setDashboardCards(cardsData);
            } else {
                throw new Error(result.message || t.errorFetchingData);
            }
        } catch (err) {
            setError(err.message || t.errorFetchingData);
            setDashboardCards([]);
        } finally {
            setIsLoading(false);
        }
    }, [t, user, logout]);

    useEffect(() => {
        if (user && !isLoading && !error) {
            fetchDashboardData();
        } else if (!user) {
            setIsLoading(false);
            setError(t.noAuthError);
        }
    }, [user, fetchDashboardData, error, t.noAuthError]);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Header />

            <div className="container mx-auto p-0 mb-8">
                {isLoading ? (
                    <div className="text-center text-gray-600 p-8">
                        <p>{t.loadingData}</p>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600 p-8">
                        <p>{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dashboardCards.map((card, index) => (
                            <Card
                                key={card.id || index}
                                title={card.title}
                                value={card.value}
                                change={card.change}
                                icon={card.icon}
                                color={card.color}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="container mx-auto p-0">
                <MonthlyUpdate />
            </div>
        </div>
    );
}
