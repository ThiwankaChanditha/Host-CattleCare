/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useFarms from '../hooks/useFarms';
import {
    FaTractor,
    FaBaby,
    FaSkull,
    FaShoppingCart,
    FaHandHoldingUsd,
    FaExchangeAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaSpinner,
} from 'react-icons/fa';
import { GiCow, GiMilkCarton } from 'react-icons/gi';

const useMessage = () => {
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');

    const showMessage = useCallback((text, type = 'info', duration = 5000) => {
        setMessage(text);
        setMessageType(type);
        const timer = setTimeout(() => {
            setMessage(null);
            setMessageType('');
        }, duration);
        return () => clearTimeout(timer);
    }, []);

    const clearMessage = useCallback(() => {
        setMessage(null);
        setMessageType('');
    }, []);

    return { message, messageType, showMessage, clearMessage };
};

const translations = {
    en: {
        title: 'Farmer Monthly Update',
        subtitle: 'Please provide the data for the last month. Your timely submission is appreciated.',
        selectFarmLabel: 'Select Your Farm',
        milkProductionLabel: 'Total Milk Production (Last Month in Liters)',
        questions: {
            births: 'Any new births?',
            deaths: 'Any animal deaths?',
            purchased: 'Purchased any new animals?',
            sold: 'Sold any animals?',
            changedCompany: 'Changed milk collecting company?',
        },
        note: 'If yes, your LDI will visit to collect details.',
        submit: 'Submit Update',
        yes: 'Yes',
        no: 'No',
        successMessage: 'Monthly report submitted successfully!',
        errorMessage: 'Failed to submit report. Please try again.',
        farmIdNotFound: 'Farm ID not found in user data. Cannot submit report.',
        tokenMissing: 'Authentication token missing. Please log in.',
        alreadySubmitted: 'You have already submitted the report for the previous month for this farm.',
        fetchingStatus: 'Checking submission status...',
        loadingFarms: 'Loading farms...',
        noFarmsAvailable: 'No farms available for this user.',
        selectFarmPlaceholder: 'Choose a farm...',
        errorLoadingFarms: 'Error loading farms: ',
        selectFarmRequired: 'Please select a farm to submit the report.',
        invalidMilkProduction: 'Please enter a valid positive number for milk production.',
    },
    si: {
        title: 'ගොවිපළ මාසික යාවත්කාලීන කිරීම',
        subtitle: 'පසුගිය මාසය සඳහා දත්ත ලබා දෙන්න. ඔබගේ වේලාවට ඉදිරිපත් කිරීම අගය කරයි.',
        selectFarmLabel: 'ඔබගේ ගොවිපළ තෝරන්න',
        milkProductionLabel: 'මුළු කිරි නිෂ්පාදනය (පසුගිය මාසයේ ලීටර් වලින්)',
        questions: {
            births: 'නව උපතක් තිබේද?',
            deaths: 'සතුන් මිය ගොස් තිබේද?',
            purchased: 'නව සතුන් මිලදී ගත්තාද?',
            sold: 'සතුන් විකිණුවාද?',
            changedCompany: 'කිරි රැස් කිරීමේ සමාගම වෙනස් කළාද?',
        },
        note: 'ඔව් නම්, ඔබගේ LDI විස්තර එකතු කිරීමට පැමිණේ.',
        submit: 'යාවත්කාලීන කිරීම ඉදිරිපත් කරන්න',
        yes: 'ඔව්',
        no: 'නැහැ',
        successMessage: 'මාසික වාර්තාව සාර්ථකව ඉදිරිපත් කරන ලදී!',
        errorMessage: 'වාර්තාව ඉදිරිපත් කිරීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.',
        farmIdNotFound: 'ගොවිපළ හැඳුනුම්පත පරිශීලක දත්තවල නොමැත. වාර්තාව ඉදිරිපත් කළ නොහැක.',
        tokenMissing: 'සත්‍යාපන ටෝකනය අතුරුදහන් වී ඇත. කරුණාකර පිවිසෙන්න.',
        alreadySubmitted: 'ඔබ දැනටමත් පෙර මාසය සඳහා වාර්තාව ඉදිරිපත් කර ඇත.',
        fetchingStatus: 'ඉදිරිපත් කිරීමේ තත්ත්වය පරීක්ෂා කිරීම...',
        loadingFarms: 'ගොවිපලවල් පූරණය වෙමින් පවතී...',
        noFarmsAvailable: 'මෙම පරිශීලකයා සඳහා ගොවිපලවල් නොමැත.',
        selectFarmPlaceholder: 'ගොවිපළක් තෝරන්න...',
        errorLoadingFarms: 'ගොවිපලවල් පූරණය කිරීමේ දෝෂය: ',
        selectFarmRequired: 'වාර්තාව ඉදිරිපත් කිරීමට ගොවිපලක් තෝරන්න.',
        invalidMilkProduction: 'කිරි නිෂ්පාදනය සඳහා වලංගු ධන සංඛ්‍යාවක් ඇතුලත් කරන්න.',
    },
    ta: {
        title: 'விவசாயி மாதாந்திர புதுப்பிப்பு',
        subtitle: 'கடந்த மாதத்திற்கான தரவை வழங்கவும். உங்கள் நேரத்திற்கான சமர்ப்பிப்பு பாராட்டப்படுகிறது.',
        selectFarmLabel: 'உங்கள் பண்ணையைத் தேர்ந்தெடுக்கவும்',
        milkProductionLabel: 'மொத்த பால் உற்பத்தி (கடந்த மாதம் லிட்டர்களில்)',
        questions: {
            births: 'புதிய பிறப்புகள் உள்ளனவா?',
            deaths: 'விலங்குகள் இறந்துள்ளனவா?',
            purchased: 'புதிய விலங்குகளை வாங்கியுள்ளீர்களா?',
            sold: 'விலங்குகளை விற்றுள்ளீர்களா?',
            changedCompany: 'பால் சேகரிக்கும் நிறுவனம் மாற்றப்பட்டதா?',
        },
        note: 'ஆம் என்றால், உங்கள் LDI விவரங்களை சேகரிக்க வருவார்.',
        submit: 'புதுப்பிப்பை சமர்ப்பிக்கவும்',
        yes: 'ஆம்',
        no: 'இல்லை',
        successMessage: 'மாதாந்திர அறிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
        errorMessage: 'அறிக்கையைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
        farmIdNotFound: 'பயனர் தரவில் பண்ணை ஐடி காணப்படவில்லை. அறிக்கையைச் சமர்ப்பிக்க முடியாது.',
        tokenMissing: 'அங்கீகரிப்பு டோக்கன் இல்லை. தயவுசெய்து உள்நுழையவும்.',
        alreadySubmitted: 'நீங்கள் ஏற்கனவே முந்தைய மாதத்திற்கான அறிக்கையை இந்த பண்ணைக்கு சமர்ப்பித்துள்ளீர்கள்.',
        fetchingStatus: 'சமர்ப்பிப்பு நிலையை சரிபார்க்கிறது...',
        loadingFarms: 'பண்ணைகள் ஏற்றுகிறது...',
        noFarmsAvailable: 'இந்த பயனருக்கு பண்ணைகள் எதுவும் இல்லை.',
        selectFarmPlaceholder: 'ஒரு பண்ணையைத் தேர்ந்தெடுக்கவும்...',
        errorLoadingFarms: 'பண்ணைகள் ஏற்றும் பிழை: ',
        selectFarmRequired: 'அறிக்கையைச் சமர்ப்பிக்க ஒரு பண்ணையைத் தேர்ந்தெடுக்கவும்.',
        invalidMilkProduction: 'பால் உற்பத்திக்கு செல்லுபடியாகும் நேர்மறை எண்ணை உள்ளிடவும்.',
    },
};

const QuestionCard = ({ question, name, value, onChange, translations, disabled, icon, color }) => {
    const t = translations;
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-40 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${color}`}>
                    {icon}
                </div>
                <p className="font-medium text-gray-700">{question}</p>
            </div>
            <div className="flex gap-6 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value="Yes"
                        checked={value === 'Yes'}
                        onChange={onChange}
                        className="form-radio text-blue-500 h-4 w-4"
                        disabled={disabled}
                    />
                    <span className="font-medium text-gray-700">{t.yes}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value="No"
                        checked={value === 'No'}
                        onChange={onChange}
                        className="form-radio text-blue-500 h-4 w-4"
                        disabled={disabled}
                    />
                    <span className="font-medium text-gray-700">{t.no}</span>
                </label>
            </div>
            <p className="text-xs text-gray-500 mt-auto flex items-center gap-1">
                <FaInfoCircle className="text-blue-400" />
                {t.note}
            </p>
        </div>
    );
};

const FarmerMonthlyUpdate = () => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const { farms, farmsLoading, farmsError } = useFarms();
    const { message, messageType, showMessage, clearMessage } = useMessage();

    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [milkProduction, setMilkProduction] = useState('');
    const [formData, setFormData] = useState({
        births: 'No',
        deaths: 'No',
        purchased: 'No',
        sold: 'No',
        changedCompany: 'No',
    });
    const [loading, setLoading] = useState(false);
    const [hasSubmittedThisMonth, setHasSubmittedThisMonth] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [checkingStatus, setCheckingStatus] = useState(true);

    const t = translations[language];

    const convertToBoolean = (value) => value === 'Yes';

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearMessage();
    };

    const handleMilkProductionChange = (e) => {
        setMilkProduction(e.target.value);
        clearMessage();
    };

    const getLastMonthDateString = useCallback(() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return lastMonth.toISOString();
    }, []);

    const checkSubmissionStatus = useCallback(async () => {
        if (!user?.token || !selectedFarmId || farmsLoading || farmsError) {
            setCheckingStatus(false);
            setHasSubmittedThisMonth(false);
            return;
        }

        setCheckingStatus(true);
        clearMessage();

        const reportMonth = getLastMonthDateString();

        try {
            const response = await fetch(`/api/farmer-reports/check-submission?farm_id=${selectedFarmId}&month=${reportMonth}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404 && errorData.message?.includes('No report found')) {
                    setHasSubmittedThisMonth(false);
                } else {
                    showMessage(errorData.message || t.errorMessage, 'error');
                }
            } else {
                const data = await response.json();
                setHasSubmittedThisMonth(data.submitted);
                if (data.submitted) showMessage(t.alreadySubmitted, 'info');
            }
        } catch (err) {
            showMessage(err.message || t.errorMessage, 'error');
            setHasSubmittedThisMonth(false);
        } finally {
            setCheckingStatus(false);
        }
    }, [user, selectedFarmId, getLastMonthDateString, t, showMessage, farmsLoading, farmsError]);

    useEffect(() => {
        if (farms && farms.length > 0 && !farmsLoading && !farmsError) {
            const userFarmExists = user?.farm_id && farms.some(farm => farm._id === user.farm_id);
            const defaultFarm = userFarmExists ? user.farm_id : farms[0]._id;
            if (selectedFarmId !== defaultFarm) setSelectedFarmId(defaultFarm);
        } else if (!farmsLoading && (!farms || farms.length === 0)) {
            setSelectedFarmId('');
            if (user) showMessage(t.noFarmsAvailable, 'error');
            setCheckingStatus(false);
        } else if (farmsError) {
            setSelectedFarmId('');
            showMessage(t.errorLoadingFarms + farmsError, 'error');
            setCheckingStatus(false);
        }
    }, [farms, farmsLoading, farmsError, user, t, showMessage]);

    useEffect(() => {
        if (selectedFarmId) checkSubmissionStatus();
        else setCheckingStatus(false);
    }, [selectedFarmId, checkSubmissionStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessage();

        if (!user?.token) {
            showMessage(t.tokenMissing, 'error');
            return;
        }
        if (farmsLoading) {
            showMessage(t.loadingFarms, 'error');
            return;
        }
        if (farmsError) {
            showMessage(t.errorLoadingFarms + farmsError, 'error');
            return;
        }
        if (!selectedFarmId) {
            showMessage(t.selectFarmRequired, 'error');
            return;
        }
        if (hasSubmittedThisMonth) {
            showMessage(t.alreadySubmitted, 'info');
            return;
        }

        const milk = parseFloat(milkProduction);
        if (isNaN(milk) || milk < 0) {
            showMessage(t.invalidMilkProduction, 'error');
            return;
        }

        setLoading(true);

        const reportData = {
            farm_id: selectedFarmId,
            report_month: getLastMonthDateString(),
            total_milk_production: milk,
            birth_reported: convertToBoolean(formData.births),
            death_reported: convertToBoolean(formData.deaths),
            purchase_reported: convertToBoolean(formData.purchased),
            sale_reported: convertToBoolean(formData.sold),
            company_change_reported: convertToBoolean(formData.changedCompany),
        };

        try {
            const response = await fetch('/api/farmer-reports/monthly', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(reportData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t.errorMessage);
            }

            showMessage(t.successMessage, 'success');
            setHasSubmittedThisMonth(true);
        } catch (err) {
            showMessage(err.message || t.errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const isFormDisabled = !user || farmsLoading || farmsError || !selectedFarmId || (farms && farms.length === 0);
    const isSubmitDisabled = loading || hasSubmittedThisMonth || !selectedFarmId || isFormDisabled;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
            {/* Message at Top Right Corner */}
            {message && (
                <div className={`absolute top-4 right-4 p-3 rounded-lg text-sm max-w-xs ${messageType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message}
                </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-green-100">
                    <FaTractor className="text-green-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
                    <p className="text-sm text-gray-600">{t.subtitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Farm Selection */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectFarmLabel}</label>
                    <select
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={farmsLoading || farmsError || !user || (farms && farms.length === 0)}
                    >
                        {farmsLoading ? (
                            <option value="" disabled>{t.loadingFarms}</option>
                        ) : farmsError ? (
                            <option value="" disabled>{t.errorLoadingFarms}</option>
                        ) : !farms || farms.length === 0 ? (
                            <option value="" disabled>{t.noFarmsAvailable}</option>
                        ) : (
                            <>
                                <option value="" disabled>{t.selectFarmPlaceholder}</option>
                                {farms.map((farm) => (
                                    <option key={farm._id} value={farm._id}>{farm.farm_name}</option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {/* Milk Production Card */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-40 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-blue-100">
                                <GiMilkCarton className="text-blue-600" />
                            </div>
                            <p className="font-medium text-gray-700">{t.milkProductionLabel}</p>
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={milkProduction}
                            onChange={handleMilkProductionChange}
                            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-auto"
                            placeholder="0"
                            disabled={isFormDisabled || hasSubmittedThisMonth}
                        />
                    </div>

                    {/* Question Cards */}
                    <QuestionCard
                        question={t.questions.births}
                        name="births"
                        value={formData.births}
                        onChange={handleRadioChange}
                        translations={t}
                        disabled={isFormDisabled || hasSubmittedThisMonth}
                        icon={<FaBaby className="text-pink-600" />}
                        color="bg-pink-100"
                    />
                    <QuestionCard
                        question={t.questions.deaths}
                        name="deaths"
                        value={formData.deaths}
                        onChange={handleRadioChange}
                        translations={t}
                        disabled={isFormDisabled || hasSubmittedThisMonth}
                        icon={<FaSkull className="text-gray-600" />}
                        color="bg-gray-100"
                    />
                    <QuestionCard
                        question={t.questions.purchased}
                        name="purchased"
                        value={formData.purchased}
                        onChange={handleRadioChange}
                        translations={t}
                        disabled={isFormDisabled || hasSubmittedThisMonth}
                        icon={<FaShoppingCart className="text-purple-600" />}
                        color="bg-purple-100"
                    />
                    <QuestionCard
                        question={t.questions.sold}
                        name="sold"
                        value={formData.sold}
                        onChange={handleRadioChange}
                        translations={t}
                        disabled={isFormDisabled || hasSubmittedThisMonth}
                        icon={<FaHandHoldingUsd className="text-yellow-600" />}
                        color="bg-yellow-100"
                    />
                    <QuestionCard
                        question={t.questions.changedCompany}
                        name="changedCompany"
                        value={formData.changedCompany}
                        onChange={handleRadioChange}
                        translations={t}
                        disabled={isFormDisabled || hasSubmittedThisMonth}
                        icon={<FaExchangeAlt className="text-orange-600" />}
                        color="bg-orange-100"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`py-3 px-6 rounded-lg font-medium ${isSubmitDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        disabled={isSubmitDisabled}
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : t.submit}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FarmerMonthlyUpdate;
