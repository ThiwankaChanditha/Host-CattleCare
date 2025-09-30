/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const translations = {
    en: {
        profile: "Profile",
        totalScore: "Total Score",
        availableFarms: "Available Farms",
        starRating: "Star Rating",
        editProfile: "Edit Profile",
        viewAchievements: "View Achievements",
        quickStats: "Quick Stats",
        currentRank: "Current Rank",
        pointsToNextRank: "Points to Next Rank",
        activeFarms: "Active Farms",
        leaderboard: "Leaderboard",
        topPerformingFarmers: "Top performing farmers in your region",
        rank: "Rank",
        farmer: "Farmer",
        score: "Score",
        rating: "Rating",
        you: "You",
        loadingProfile: "Loading profile data...",
        errorLoadingProfile: "Failed to load profile data. Please try again.",
        noProfileData: "No profile data available. You might need to create one.",
        unauthorized: "You are not authorized to view this page. Please log in.",
        age: "Age",
        gender: "Gender",
        educationLevel: "Education Level",
        incomeLevel: "Income Level",
        occupation: "Occupation",
        ethnicity: "Ethnicity",
        religion: "Religion",
        maritalStatus: "Marital Status",
        householdSize: "Household Size",
    },
    si: {
        profile: "පැතිකඩ",
        totalScore: "සම්පූර්ණ ලකුණු",
        availableFarms: "ලබා ගත හැකි ගොවිපළ",
        starRating: "තරඟ තරඟකාරීත්වය",
        editProfile: "පැතිකඩ සංස්කරණය කරන්න",
        viewAchievements: "සම්මාන බලන්න",
        quickStats: "ඉක්මන් සංඛ්‍යාත",
        currentRank: "වත්මන් ශ්‍රේණිය",
        pointsToNextRank: "ඊළඟ ශ්‍රේණියට ලකුණු",
        activeFarms: "සක්‍රීය ගොවිපළ",
        leaderboard: "නායක මණ්ඩලය",
        topPerformingFarmers: "ඔබගේ ප්‍රදේශයේ ඉහළම කෘෂිකර්මිකයින්",
        rank: "ශ්‍රේණිය",
        farmer: "ගොවිපළ",
        score: "ලකුණු",
        rating: "තරඟකාරීත්වය",
        you: "ඔබ",
        loadingProfile: "පැතිකඩ දත්ත පූරණය වෙමින් පවතී...",
        errorLoadingProfile: "පැතිකඩ දත්ත පූරණය කිරීමට අසමත් විය. නැවත උත්සාහ කරන්න.",
        noProfileData: "පැතිකඩ දත්ත නොමැත. ඔබට එකක් සෑදීමට අවශ්‍ය විය හැකිය.",
        unauthorized: "මෙම පිටුව බැලීමට ඔබට අවසර නැත. කරුණාකර පිවිසෙන්න.",
        age: "වයස",
        gender: "ලිංගභේදය",
        educationLevel: "අධ්‍යාපන මට්ටම",
        incomeLevel: "ආදායම් මට්ටම",
        occupation: "රැකියාව",
        ethnicity: "ජනවාර්ගිකත්වය",
        religion: "ආගම",
        maritalStatus: "විවාහක තත්ත්වය",
        householdSize: "ගෘහ ප්‍රමාණය",
    },
    ta: {
        profile: "சுயவிவரம்",
        totalScore: "மொத்த மதிப்பெண்கள்",
        availableFarms: "கிடைக்கும் பண்ணைகள்",
        starRating: "நட்சத்திர மதிப்பீடு",
        editProfile: "சுயவிவரத்தைத் திருத்து",
        viewAchievements: "சாதனைகளைப் பார்க்கவும்",
        quickStats: "விரைவு புள்ளிவிவரங்கள்",
        currentRank: "தற்போதைய தரம்",
        pointsToNextRank: "அடுத்த தரத்திற்கு புள்ளிகள்",
        activeFarms: "செயலில் உள்ள பண்ணைகள்",
        leaderboard: "தலைமை பட்டியல்",
        topPerformingFarmers: "உங்கள் பிரதேசத்தில் சிறந்த விவசாயிகள்",
        rank: "தரம்",
        farmer: "விவசாயி",
        score: "மதிப்பெண்கள்",
        rating: "மதிப்பீடு",
        you: "நீங்கள்",
        loadingProfile: "சுயவிவரத் தரவு ஏற்றப்படுகிறது...",
        errorLoadingProfile: "சுயவிவரத் தரவை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        noProfileData: "சுயவிவரத் தரவு இல்லை. நீங்கள் ஒன்றை உருவாக்க வேண்டியிருக்கலாம்.",
        unauthorized: "இந்த பக்கத்தை பார்க்க உங்களுக்கு அனுமதி இல்லை. உள்நுழையவும்.",
        age: "வயது",
        gender: "பாலினம்",
        educationLevel: "கல்வி நிலை",
        incomeLevel: "வருமான நிலை",
        occupation: "தொழில்",
        ethnicity: "இனம்",
        religion: "மதம்",
        maritalStatus: "திருமண நிலை",
        householdSize: "குடும்ப அளவு",
    },
};

function Profile() {
    const { language } = useLanguage();
    const t = translations[language];
    const { user, isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    const [farmerData, setFarmerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = "http://localhost:5000";

    useEffect(() => {
        console.log('--- Profile Component useEffect Triggered ---');
        console.log('Current isAuthenticated:', isAuthenticated);
        console.log('Current user object:', user);
        console.log('Current user.id:', user?.id);
        console.log('Current token:', token ? 'Token available' : 'No token');

        const fetchFarmerProfile = async () => {
            console.log('Debug: Inside fetchFarmerProfile function.');

            if (!isAuthenticated || !user?.id || !token) {
                console.log('Debug: Not authenticated, user ID missing, or token missing. Skipping API call.');
                setError(t.unauthorized);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                console.log(`Debug: Attempting to fetch farmer profile from: ${API_BASE_URL}/api/farmer/profile`);
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get(`${API_BASE_URL}/api/farmer/profile`, config);

                const profileData = {
                    ...response.data,

                    email: response.data.email || (response.data.user_id ? response.data.user_id.email : "N/A"),
                    score: response.data.score || 0,
                    rank: response.data.rank || 'N/A',
                    farmsCount: response.data.farmsCount || 0,
                    rating: response.data.rating || 0,
                };
                setFarmerData(profileData);
                console.log('Debug: farmerData state set to:', profileData);
            } catch (err) {

                if (err.response && err.response.status === 404) {
                    setError(t.noProfileData);
                    navigate("/farmer/profile/edit");
                } else if (err.response && err.response.status === 401) {
                    setError(t.unauthorized);
                } else {
                    setError(t.errorLoadingProfile);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFarmerProfile();
    }, [isAuthenticated, user?.id, token, t, navigate]);


    const currentFarmerScore = farmerData?.score;
    const currentFarmerRank = farmerData?.rank;
    const currentFarmerFarms = farmerData?.farmsCount;
    const currentFarmerRating = farmerData?.rating;

    const mockLeaderboardFarmers = [
        { name: user?.full_name || "You", rank: 1, score: 1600, rating: 4 },
        { name: "Jane Smith", rank: 2, score: 1400, rating: 4.5 },
        { name: "Tom Brown", rank: 3, score: 1300, rating: 4.0 },
        { name: "Lucy Green", rank: 4, score: 1200, rating: 3.8 },
        { name: "Mike White", rank: 5, score: 1100, rating: 3.5 },
    ];

    const leaderboardFarmers = mockLeaderboardFarmers
        .sort((a, b) => a.rank - b.rank)
        .filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.name === item.name && t.rank === item.rank
            ))
        );



    const renderRankStars = (rating) => {
        const displayStars = Math.round(rating);
        return Array.from({ length: 5 }, (_, i) => (
            <svg
                key={i}
                className={`h-4 w-4 ${i < displayStars ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M9.049 2.927a1 1 0 011.902 0l1.351 3.658a1 1 0 00.95.69h3.914a1 1 0 01.588 1.809l-3.16 2.42a1 1 0 00-.366 1.118l1.16 3.785a1 1 0 01-1.522 1.095l-3.387-2.504a1 1 0 00-1.175 0l-3.387 2.504a1 1 0 01-1.522-1.095l1.16-3.785a1 1 0 00-.366-1.118l-3.16-2.42a1 1 0 01.588-1.809h3.914a1 1 0 00.95-.69l1.351-3.658z"
                    clipRule="evenodd"
                />
            </svg>
        ));
    };

    const getRankBadgeColor = (rank) => {
        const numericRank = parseInt(rank, 10);
        switch (numericRank) {
            case 1:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 2:
                return "bg-gray-100 text-gray-800 border-gray-200";
            case 3:
                return "bg-orange-100 text-orange-800 border-orange-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    if (loading) {
        console.log('Debug: Rendering loading state.');
        return (
            <div className="p-8 bg-white-100 min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-700">{t.loadingProfile}</p>
            </div>
        );
    }

    if (error) {
        console.log('Debug: Rendering error state:', error);
        return (
            <div className="p-8 bg-white-100 min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    if (!farmerData) {
        console.log('Debug: Rendering noProfileData state (farmerData is null).');
        return (
            <div className="p-8 bg-white-100 min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-700">{t.noProfileData}</p>
            </div>
        );
    }

    console.log('Debug: Rendering main Profile component with farmerData:', farmerData);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || farmerData.name || "Farmer"}</h2>
                                    <p className="text-gray-600 mt-1">{farmerData.email}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRankBadgeColor(
                                            currentFarmerRank
                                        )}`}
                                    >
                                        {t.rank} #{currentFarmerRank}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Stats */}
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">{currentFarmerScore}</div>
                                    <div className="text-sm text-gray-600 mt-1">{t.totalScore}</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">{currentFarmerFarms}</div>
                                    <div className="text-sm text-gray-600 mt-1">{t.availableFarms}</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-center mb-2">{renderRankStars(currentFarmerRating)}</div>
                                    <div className="text-sm text-gray-600">{t.starRating}</div>
                                </div>
                            </div>

                            {/* Additional Profile Details from Farmer Schema */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                <div className="flex items-center"><strong className="w-1/2">{t.age}:</strong> <span className="w-1/2">{farmerData.age || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.gender}:</strong> <span className="w-1/2">{farmerData.gender || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.educationLevel}:</strong> <span className="w-1/2">{farmerData.education_level || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.incomeLevel}:</strong> <span className="w-1/2">{farmerData.income_level || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.occupation}:</strong> <span className="w-1/2">{farmerData.occupation || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.ethnicity}:</strong> <span className="w-1/2">{farmerData.ethnicity || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.religion}:</strong> <span className="w-1/2">{farmerData.religion || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.maritalStatus}:</strong> <span className="w-1/2">{farmerData.marital_status || 'N/A'}</span></div>
                                <div className="flex items-center"><strong className="w-1/2">{t.householdSize}:</strong> <span className="w-1/2">{farmerData.household_size || 'N/A'}</span></div>
                            </div>


                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                    onClick={() => navigate("/farmer/profile/edit")}
                                >
                                    {t.editProfile}
                                </button>
                                <div className='flex-1 py-3 px-6'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">{t.leaderboard}</h2>
                        <p className="text-gray-600 text-sm mt-1">{t.topPerformingFarmers}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.rank}</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.farmer}</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.score}</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.rating}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboardFarmers.map((farmer, index) => (
                                    <tr key={farmer.rank} className={`hover:bg-gray-50 transition-colors duration-150 ${farmer.name === user?.full_name ? 'bg-blue-50' : ''}`}> {/* Changed user?.name to user?.full_name for consistency */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getRankBadgeColor(farmer.rank)}`}>
                                                {farmer.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {farmer.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {farmer.name}
                                                        {farmer.name === user?.full_name && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                {t.you}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {farmer.score.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1">
                                                {renderRankStars(farmer.rating)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;