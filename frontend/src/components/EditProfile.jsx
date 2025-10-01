/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserCircle2Icon, SaveIcon, XIcon, Loader2Icon } from 'lucide-react';
import axios from 'axios';

const translations = {
    en: { editProfile: "Edit Profile", age: "Age", gender: "Gender", educationLevel: "Education Level", incomeLevel: "Income Level", occupation: "Occupation", ethnicity: "Ethnicity", religion: "Religion", maritalStatus: "Marital Status", householdSize: "Household Size", save: "Save Changes", saving: "Saving...", cancel: "Cancel", loadingProfile: "Loading Profile...", authenticationError: "Authentication error. Please log in again.", failedToLoad: "Failed to load existing profile data.", failedToUpdate: "Failed to update profile. Please try again.", updateSuccess: "Profile updated successfully!", notAuthorized: "You are not authorized to edit this profile." },
    si: { editProfile: "පැතිකඩ සංස්කරණය කරන්න", age: "වයස", gender: "ලිංගභේදය", educationLevel: "අධ්‍යාපන මට්ටම", incomeLevel: "ආදායම් මට්ටම", occupation: "රැකියාව", ethnicity: "ජනවාර්ගිකත්වය", religion: "ආගම", maritalStatus: "විවාහක තත්ත්වය", householdSize: "ගෘහ ප්‍රමාණය", save: "වෙනස්කම් සුරකින්න", saving: "සුරකිමින්...", cancel: "අවලංගු කරන්න", loadingProfile: "පැතිකඩ පූරණය වෙමින්...", authenticationError: "සත්‍යාපන දෝෂයකි. කරුණාකර නැවත පිවිසෙන්න.", failedToLoad: "දැනට පවතින පැතිකඩ දත්ත පැටවීමට අපොහොසත් විය.", failedToUpdate: "පැතිකඩ යාවත්කාලීන කිරීමට අපොහොසත් විය. කරුණාකර නැවත උත්සාහ කරන්න.", updateSuccess: "පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!", notAuthorized: "මෙම පැතිකඩ සංස්කරණය කිරීමට ඔබට අවසර නැත." },
    ta: { editProfile: "சுயவிவரத்தைத் திருத்து", age: "வயது", gender: "பாலினம்", educationLevel: "கல்வி நிலை", incomeLevel: "வருமான நிலை", occupation: "தொழில்", ethnicity: "இனம்", religion: "மதம்", maritalStatus: "திருமண நிலை", householdSize: "குடும்ப அளவு", save: "மாற்றங்களைச் சேமி", saving: "சேமிக்கிறது...", cancel: "ரத்துசெய்", loadingProfile: "சுயவிவரம் ஏற்றப்படுகிறது...", authenticationError: "அங்கீகாரப் பிழை. மீண்டும் உள்நுழையவும்.", failedToLoad: "ஏற்கனவே உள்ள சுயவிவரத் தரவை ஏற்ற முடியவில்லை.", failedToUpdate: "சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", updateSuccess: "சுயவிவரம் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது!", notAuthorized: "இந்த சுயவிவரத்தைத் திருத்த உங்களுக்கு அனுமதி இல்லை." }
};

const CustomInput = ({ id, label, value, onChange, type = "text", options = [] }) => {
    const isSelect = options.length > 0;
    return (
        <div className="flex flex-col w-full">
            <label htmlFor={id} className="text-sm font-semibold text-gray-600 mb-1">{label}</label>
            {isSelect ? (
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="" disabled hidden>{label}</option>
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            )}
        </div>
    );
};

export default function EditProfile() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    const { user, isAuthenticated, token } = useAuth();
    const [formData, setFormData] = useState({ age: '', gender: '', education_level: '', income_level: '', occupation: '', ethnicity: '', religion: '', marital_status: '', household_size: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const API_BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const fetchCurrentFarmerData = async () => {
            if (!isAuthenticated || !user?.id || !token) {
                setError(t.notAuthorized);
                setLoading(false);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`/api/farmer/profile`, config);
                setFormData(response.data);
            } catch (err) {
                setError(t.failedToLoad);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentFarmerData();
    }, [isAuthenticated, user?.id, token, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        if (!isAuthenticated || !user?.id || !token) {
            setError(t.authenticationError);
            setSaving(false);
            return;
        }
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            await axios.put(`/api/farmer/profile`, formData, config);
            alert(t.updateSuccess);
            navigate("/farmer/profile");
        } catch (err) {
            setError(t.failedToUpdate);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2Icon className="h-8 w-8 animate-spin text-green-500 mr-2" />
                <p className="text-xl text-gray-700">{t.loadingProfile}</p>
            </div>
        );
    }

    const genderOptions = ['Male', 'Female', 'Other'];
    const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
    const educationLevelOptions = ['Primary', 'Secondary', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other'];
    const incomeLevelOptions = ['Low', 'Medium', 'High'];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-row">

                {/* Sidebar / Left Panel */}
                <div>
                    {/* <UserCircle2Icon className="h-24 w-24 mb-6" />
                    <h3 className="text-3xl font-bold">{t.editProfile}</h3>
                    <p className="mt-3 text-sm opacity-90 text-center">Update your demographic details to personalize your experience.</p> */}
                </div>

                {/* Main Form / Right Panel */}
                <div className="w-2/3 p-10">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <CustomInput id="age" label={t.age} value={formData.age} onChange={handleChange} type="number" />
                        <CustomInput id="gender" label={t.gender} value={formData.gender} onChange={handleChange} options={genderOptions} />
                        <CustomInput id="education_level" label={t.educationLevel} value={formData.education_level} onChange={handleChange} options={educationLevelOptions} />
                        <CustomInput id="income_level" label={t.incomeLevel} value={formData.income_level} onChange={handleChange} options={incomeLevelOptions} />
                        <CustomInput id="occupation" label={t.occupation} value={formData.occupation} onChange={handleChange} />
                        <CustomInput id="ethnicity" label={t.ethnicity} value={formData.ethnicity} onChange={handleChange} />
                        <CustomInput id="religion" label={t.religion} value={formData.religion} onChange={handleChange} />
                        <CustomInput id="marital_status" label={t.maritalStatus} value={formData.marital_status} onChange={handleChange} options={maritalStatusOptions} />
                        <CustomInput id="household_size" label={t.householdSize} value={formData.household_size} onChange={handleChange} type="number" />
                    </form>

                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                            disabled={saving}
                        >
                            <XIcon className="h-4 w-4 mr-2" /> {t.cancel}
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className={`flex items-center px-5 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={saving}
                        >
                            {saving ? <><Loader2Icon className="h-4 w-4 animate-spin mr-2" /> {t.saving}</> : <><SaveIcon className="h-4 w-4 mr-2" /> {t.save}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
