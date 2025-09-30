/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { CalendarIcon, XIcon, InfoIcon, MapPinIcon, UsersIcon, UserIcon, ClockIcon, ImageIcon, SearchIcon, FilterIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import WorkshopFilterSearch from './components/WorkshopFilterSearch';
import ConfirmModal from './components/ConfirmModal';

const workshopTranslations = {
    en: {
        title: "Farmer Workshops",
        registerModalTitle: "Register for Workshop",
        confirmRegistration: "Confirm Registration",
        cancelRegistrationTitle: "Confirm Cancellation",
        cancelRegistrationMessage: "Are you sure you want to cancel your registration for this workshop? This action cannot be undone.",
        loadingWorkshops: "Loading workshops...",
        failedToLoadWorkshops: "Failed to load workshops.",
        notAuthenticated: "User not authenticated.",
        registrationSuccess: "Successfully registered for the workshop!",
        registrationFailed: "Failed to register for the workshop.",
        cancellationSuccess: "Successfully cancelled registration!",
        cancellationFailed: "Failed to cancel registration.",
        noWorkshopsFound: "No workshops found.",
        viewDetails: "View Details",
        registered: "Registered",
        registerNow: "Register Now",
        cancelRegistration: "Cancel Registration",
        detailsModalTitle: "Workshop Details",
        programType: "Program Type",
        conductedBy: "Conducted By",
        description: "Description",
        location: "Location",
        programDate: "Date",
        participantsCount: "Participants Expected",
        close: "Close",
        confirm: "Confirm",
        cancel: "Cancel",
        noImage: "No image available",
        filterAll: "All Workshops",
        filterRegistered: "My Registrations",
        filterAvailable: "Available",
        clearFilters: "Clear Filters",
        searchPlaceholder: "Search workshops...",
        deleteWorkshop: "Delete Workshop",
        confirmDeleteTitle: "Confirm Delete",
        confirmDeleteMessage: "Are you sure you want to delete this workshop? This action cannot be undone."
    },
    si: {
        title: "ගොවි වැඩමුළු",
        registerModalTitle: "වැඩමුළුව සඳහා ලියාපදිංචි වන්න",
        confirmRegistration: "ලියාපදිංචිය තහවුරු කරන්න",
        cancelRegistrationTitle: "ලියාපදිංචිය අවලංගු කිරීම තහවුරු කරන්න",
        cancelRegistrationMessage: "මෙම වැඩමුළුව සඳහා ඔබේ ලියාපදිංචිය අවලංගු කිරීමට ඔබ සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
        loadingWorkshops: "වැඩමුළු පූරණය වෙමින් පවතී...",
        failedToLoadWorkshops: "වැඩමුළු ලබා ගැනීමට අසමත් විය.",
        notAuthenticated: "පරිශීලකයා සත්‍යාපනය කර නැත.",
        registrationSuccess: "වැඩමුළුව සඳහා සාර්ථකව ලියාපදිංචි විය!",
        registrationFailed: "වැඩමුළුව සඳහා ලියාපදිංචි වීමට අසමත් විය.",
        cancellationSuccess: "ලියාපදිංචිය සාර්ථකව අවලංගු කරන ලදී!",
        cancellationFailed: "ලියාපදිංචිය අවලංගු කිරීමට අසමත් විය.",
        noWorkshopsFound: "වැඩමුළු නොමැත.",
        viewDetails: "විස්තර බලන්න",
        registered: "ලියාපදිංචි වී ඇත",
        registerNow: "දැන් ලියාපදිංචි වන්න",
        cancelRegistration: "ලියාපදිංචිය අවලංගු කරන්න",
        detailsModalTitle: "වැඩමුළු විස්තර",
        programType: "වැඩසටහන් වර්ගය",
        conductedBy: "මෙහෙයවනු ලැබුවේ",
        description: "විස්තරය",
        location: "ස්ථානය",
        programDate: "දිනය",
        participantsCount: "බලාපොරොත්තු වන සහභාගීවන්නන්",
        close: "වසන්න",
        confirm: "තහවුරු කරන්න",
        cancel: "අවලංගු කරන්න",
        noImage: "රූපයක් නොමැත",
        filterAll: "සියලු වැඩමුළු",
        filterRegistered: "මගේ ලියාපදිංචිකරණ",
        filterAvailable: "ලබා ගත හැකි",
        clearFilters: "පෙරහන් ඉවත් කරන්න",
        searchPlaceholder: "වැඩමුළු සොයන්න...",
        deleteWorkshop: "වැඩමුළුව මකන්න",
        confirmDeleteTitle: "මකාදැමීම තහවුරු කරන්න",
        confirmDeleteMessage: "මෙම වැඩමුළුව මකා දැමීමට ඔබ සහතිකද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක."
    },
    ta: {
        title: "விவசாயி பட்டறைகள்",
        registerModalTitle: "பணிமனைக்கு பதிவு செய்யவும்",
        confirmRegistration: "பதிவை உறுதிப்படுத்தவும்",
        cancelRegistrationTitle: "பதிவை ரத்துசெய்வதை உறுதிப்படுத்தவும்",
        cancelRegistrationMessage: "இந்த பணிமனைக்கான உங்கள் பதிவை ரத்துசெய்ய நீங்கள் உறுதியாக உள்ளீர்களா? இந்த செயல்பாடு மாற்றியமைக்கப்படாது.",
        loadingWorkshops: "பணிமனைகள் ஏற்றப்படுகிறது...",
        failedToLoadWorkshops: "பணிமனைகளை ஏற்ற முடியவில்லை.",
        notAuthenticated: "பயனர் அங்கீகரிக்கப்படவில்லை.",
        registrationSuccess: "பணிமனைக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
        registrationFailed: "பணிமனைக்கு பதிவு செய்ய முடியவில்லை.",
        cancellationSuccess: "பதிவு வெற்றிகரமாக ரத்து செய்யப்பட்டது!",
        cancellationFailed: "பதிவை ரத்துசெய்ய முடியவில்லை.",
        noWorkshopsFound: "பணிமனைகள் எதுவும் இல்லை.",
        viewDetails: "விவரங்களைப் பார்க்கவும்",
        registered: "பதிவுசெய்யப்பட்டது",
        registerNow: "இப்போது பதிவு செய்யவும்",
        cancelRegistration: "பதிவை ரத்துசெய்",
        detailsModalTitle: "பணிமனை விவரங்கள்",
        programType: "நிகழ்ச்சி வகை",
        conductedBy: "நடத்தியவர்",
        description: "விளக்கம்",
        location: "இடம்",
        programDate: "தேதி",
        participantsCount: "எதிர்பார்க்கப்படும் பங்கேற்பாளர்கள்",
        close: "மூடு",
        confirm: "உறுதிப்படுத்து",
        cancel: "ரத்துசெய்",
        noImage: "படம் இல்லை",
        filterAll: "அனைத்து பணிமனைகள்",
        filterRegistered: "எனது பதிவுகள்",
        filterAvailable: "கிடைக்கக்கூடிய",
        clearFilters: "வடிகட்டிகளை அழிக்கவும்",
        searchPlaceholder: "பணிமனைகளைத் தேடுங்கள்...",
        deleteWorkshop: "பணிமனையை நீக்கு",
        confirmDeleteTitle: "நீக்குவதை உறுதிப்படுத்து",
        confirmDeleteMessage: "இந்த பணிமனையை நீக்க நீங்கள் உறுதியாக உள்ளீர்களா? இந்த செயல் மாற்றமடையாது."
    },
};

function WorkshopFilterComponent({ filter, setFilter, searchTerm, setSearchTerm, t }) {
    const clearFilters = () => {
        setFilter("all");
        setSearchTerm("");
    };
    const hasActiveFilters = filter !== "all" || searchTerm !== "";
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                </div>
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-1 mr-2">
                        <FilterIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">Filter:</span>
                    </div>
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${filter === "all"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {t.filterAll}
                    </button>
                    <button
                        onClick={() => setFilter("registered")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${filter === "registered"
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {t.filterRegistered}
                    </button>
                    <button
                        onClick={() => setFilter("available")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${filter === "available"
                            ? "bg-orange-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {t.filterAvailable}
                    </button>
                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                        >
                            <RefreshCwIcon className="w-4 h-4" />
                            {t.clearFilters}
                        </button>
                    )}
                </div>
            </div>
            {/* Active Filter Indicator */}
            {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <InfoIcon className="w-4 h-4" />
                    <span>
                        Active filters:
                        {filter !== "all" && (
                            <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {filter === "registered" ? t.filterRegistered : t.filterAvailable}
                            </span>
                        )}
                        {searchTerm && (
                            <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                "{searchTerm}"
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}

function WorkshopCard({ workshop, onRegisterClick, onCancelClick, onViewDetailsClick, onDeleteClick, t }) {
    const { language } = useLanguage();
    const API_BASE_URL = "http://localhost:5000";
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group relative">
            {/* Workshop Flyer/Image */}
            <div className="relative h-64 overflow-hidden">
                {workshop.flyer_url ? (
                    <img
                        src={workshop.flyer_url.startsWith('http') ? workshop.flyer_url : `${workshop.flyer_url}`}
                        alt={workshop.program_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = 'image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDQwMCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xODAgMTEwSDIyMFYxNTBIMTgwVjExMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+cGF0aCBkPSJNMTcwIDEzMEgxODBWMTQwSDE3MFYxMzBaIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik0yMjAgMTMwSDIzMFYxNDBIMjIwVjEzMFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+Cg==';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">{t.noImage}</p>
                        </div>
                    </div>
                )}
                {/* Registration Status Badge */}
                {workshop.registered && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        ✓ {t.registered}
                    </div>
                )}
                {/* Program Type Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    {workshop.program_type}
                </div>
            </div>
            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {workshop.program_name}
                </h3>
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {workshop.description}
                </p>
                {/* Workshop Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(workshop.program_date)}</span>
                        <ClockIcon className="w-4 h-4 ml-4 mr-2 flex-shrink-0" />
                        <span>{formatTime(workshop.program_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{workshop.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <UsersIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{workshop.participants_count} participants expected</span>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => onViewDetailsClick(workshop)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                    >
                        {t.viewDetails}
                    </button>
                    {workshop.registered ? (
                        <button
                            onClick={() => onCancelClick(workshop)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                        >
                            {t.cancelRegistration}
                        </button>
                    ) : (
                        <button
                            onClick={() => onRegisterClick(workshop)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                            {t.registerNow}
                        </button>
                    )}
                    {/* Delete Button - only for extension officers */}
                    {workshop.canDelete && (
                        <button
                            onClick={() => onDeleteClick(workshop)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                        >
                            <Trash2Icon className="w-4 h-4 mr-1" />
                            {t.deleteWorkshop}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RegisterModal({ isOpen, onClose, onRegister, workshop }) {
    const { language } = useLanguage();
    const t = workshopTranslations[language];
    if (!isOpen || !workshop) return null;
    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-100 transform transition-all duration-300">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                {/* Header with Workshop Image */}
                <div className="relative h-32 overflow-hidden rounded-t-2xl">
                    {workshop.flyer_url ? (
                        <img
                            src={workshop.flyer_url.startsWith('http') ? workshop.flyer_url : `/api/${workshop.flyer_url}`}
                            alt={workshop.program_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                    )}
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute bottom-4 left-6 text-white">
                        <h2 className="text-xl font-bold">{t.registerModalTitle}</h2>
                    </div>
                </div>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.program_name}</h3>
                    <div className="space-y-3 mb-6 text-sm text-gray-600">
                        <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{new Date(workshop.program_date).toLocaleDateString(language, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{workshop.location}</span>
                        </div>
                        <div className="flex items-center">
                            <UsersIcon className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{workshop.participants_count} participants expected</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                            onClick={onClose}
                        >
                            {t.cancel}
                        </button>
                        <button
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            onClick={onRegister}
                        >
                            {t.confirmRegistration}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkshopDetailsModal({ isOpen, onClose, workshop, conductedByUserName }) {
    const { language } = useLanguage();
    const t = workshopTranslations[language];
    if (!isOpen || !workshop) return null;
    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative border border-gray-100 transform transition-all duration-300 max-h-[90vh] overflow-hidden">
                <button
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10 bg-black/20 rounded-full p-1"
                    onClick={onClose}
                    aria-label={t.close}
                >
                    <XIcon className="w-6 h-6" />
                </button>
                {/* Header with Workshop Image */}
                <div className="relative h-48 overflow-hidden">
                    {workshop.flyer_url ? (
                        <img
                            src={workshop.flyer_url.startsWith('http') ? workshop.flyer_url : `/api/${workshop.flyer_url}`}
                            alt={workshop.program_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-2">
                            {workshop.program_type}
                        </div>
                        <h2 className="text-2xl font-bold">{t.detailsModalTitle}</h2>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{workshop.program_name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <UserIcon className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">{t.conductedBy}</p>
                                    <p className="text-gray-600">{conductedByUserName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CalendarIcon className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">{t.programDate}</p>
                                    <p className="text-gray-600">{new Date(workshop.program_date).toLocaleDateString(language, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">{t.location}</p>
                                    <p className="text-gray-600">{workshop.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <UsersIcon className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900">{t.participantsCount}</p>
                                    <p className="text-gray-600">{workshop.participants_count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-lg">{t.description}</h4>
                        <p className="text-gray-600 leading-relaxed">{workshop.description}</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                    <button
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        onClick={onClose}
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Workshop() {
    const { language } = useLanguage();
    const t = workshopTranslations[language];
    const { user, isAuthenticated } = useAuth();
    const API_BASE_URL = "http://localhost:5000";
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorkshopForRegistration, setSelectedWorkshopForRegistration] = useState(null);
    const [selectedWorkshopForCancellation, setSelectedWorkshopForCancellation] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedWorkshopForDetails, setSelectedWorkshopForDetails] = useState(null);
    const [conductedByUserName, setConductedByUserName] = useState('');
    const [selectedWorkshopForDelete, setSelectedWorkshopForDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchWorkshops = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!isAuthenticated || !user?.id) {
            setError(t.notAuthenticated);
            setLoading(false);
            return;
        }
        try {
            const programsResponse = await axios.get(`/api/programs`, {
                params: {
                    type: "Workshop",
                },
            });
            let fetchedWorkshops = programsResponse.data;
            const registrationsResponse = await axios.get(`/api/extension_participants/${user.id}`);
            const registeredProgramIds = new Set(
                registrationsResponse.data.map((reg) => reg.program_id)
            );
            const workshopsWithStatus = fetchedWorkshops.map((ws) => ({
                ...ws,
                registered: registeredProgramIds.has(ws._id),
                // Add delete permission based on user role and workshop ownership
                canDelete: user?.role === 'extension_officer' || user?.role === 'admin'
            }));
            setWorkshops(workshopsWithStatus);
        } catch (err) {
            console.error("Error fetching workshop ", err);
            setError(t.failedToLoadWorkshops);
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated, API_BASE_URL, t]);

    useEffect(() => {
        fetchWorkshops();
    }, [fetchWorkshops]);

    const handleRegisterClick = (workshop) => {
        if (!isAuthenticated || !user?.id) {
            alert(t.notAuthenticated);
            return;
        }
        setSelectedWorkshopForRegistration(workshop);
    };

    const confirmRegistration = async () => {
        if (!selectedWorkshopForRegistration || !user?.id) return;
        try {
            await axios.post(`/api/extension_participants`, {
                program_id: selectedWorkshopForRegistration._id,
                farmer_id: user.id,
                attendance_status: 'Present',
            });
            alert(t.registrationSuccess);
            fetchWorkshops();
        } catch (err) {
            console.error("Error registering:", err);
            if (err.response && err.response.status === 409) {
                alert("You are already registered for this workshop.");
            } else {
                alert(t.registrationFailed);
            }
        } finally {
            setSelectedWorkshopForRegistration(null);
        }
    };

    const handleCancelClick = (workshop) => {
        if (!isAuthenticated || !user?.id) {
            alert(t.notAuthenticated);
            return;
        }
        setSelectedWorkshopForCancellation(workshop);
        setIsCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (!selectedWorkshopForCancellation || !user?.id) return;
        try {
            await axios.delete(
                `/api/extension_participants/${selectedWorkshopForCancellation._id}/${user.id}`
            );
            fetchWorkshops();
        } catch (err) {
            console.error("Error cancelling registration:", err);
            alert(t.cancellationFailed);
        } finally {
            setSelectedWorkshopForCancellation(null);
            setIsCancelModalOpen(false);
        }
    };

    const handleViewDetailsClick = async (workshop) => {
        setSelectedWorkshopForDetails(workshop);
        try {
            if (workshop.conducted_by) {
                if (typeof workshop.conducted_by === 'object' && workshop.conducted_by !== null) {
                    setConductedByUserName(workshop.conducted_by.name || workshop.conducted_by.username || 'N/A');
                } else {
                    const userResponse = await axios.get(`/api/users/${workshop.conducted_by}`);
                    setConductedByUserName(userResponse.data.name || userResponse.data.username || 'Unknown User');
                }
            } else {
                setConductedByUserName('N/A');
            }
        } catch (error) {
            console.error('Error fetching conducted_by user:', error);
            setConductedByUserName('Error Fetching Name');
        }
    };

    const handleDeleteClick = (workshop) => {
        if (!isAuthenticated || !user?.id) {
            alert(t.notAuthenticated);
            return;
        }
        if (!workshop.canDelete) {
            alert("You don't have permission to delete this workshop.");
            return;
        }
        setSelectedWorkshopForDelete(workshop);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedWorkshopForDelete || !user?.id) return;
        try {
            await axios.delete(`/api/programs/${selectedWorkshopForDelete._id}`, {
                data: {
                    userId: user.id,
                    userRole: user.role
                }
            });
            fetchWorkshops();
            alert('Workshop deleted successfully');
        } catch (error) {
            console.error('Error deleting workshop:', error);
            alert('Failed to delete workshop. Please try again.');
        } finally {
            setSelectedWorkshopForDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const filteredAndSearchedWorkshops = workshops.filter((workshop) => {
        const matchesSearch = searchTerm === "" ||
            workshop.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workshop.location.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesFilter = true;
        if (filter === "registered") {
            matchesFilter = workshop.registered === true;
        } else if (filter === "available") {
            matchesFilter = workshop.registered === false;
        }
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 text-lg">{t.loadingWorkshops}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <XIcon className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <WorkshopFilterComponent
                    filter={filter}
                    setFilter={setFilter}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    t={t}
                />
                <div className="mt-8">
                    {filteredAndSearchedWorkshops.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                <InfoIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noWorkshopsFound}</h3>
                            <p className="text-gray-500">Try adjusting your search criteria or check back later for new workshops.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAndSearchedWorkshops.map((workshop) => (
                                <WorkshopCard
                                    key={workshop._id}
                                    workshop={workshop}
                                    onRegisterClick={handleRegisterClick}
                                    onCancelClick={handleCancelClick}
                                    onViewDetailsClick={handleViewDetailsClick}
                                    onDeleteClick={handleDeleteClick}
                                    t={t}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Registration Confirmation Modal */}
            {selectedWorkshopForRegistration && (
                <RegisterModal
                    isOpen={!!selectedWorkshopForRegistration}
                    onClose={() => setSelectedWorkshopForRegistration(null)}
                    onRegister={confirmRegistration}
                    workshop={selectedWorkshopForRegistration}
                />
            )}
            {/* Cancellation Confirmation Modal */}
            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancellation}
                title={t.cancelRegistrationTitle}
                message={t.cancelRegistrationMessage}
                confirmText={t.confirm}
                cancelText={t.cancel}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-100"
                modalClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            />
            {/* Workshop Details Modal */}
            {selectedWorkshopForDetails && (
                <WorkshopDetailsModal
                    isOpen={!!selectedWorkshopForDetails}
                    onClose={() => setSelectedWorkshopForDetails(null)}
                    workshop={selectedWorkshopForDetails}
                    conductedByUserName={conductedByUserName}
                />
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={t.confirmDeleteTitle}
                message={t.confirmDeleteMessage}
                confirmText={t.confirm}
                cancelText={t.cancel}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-100"
                modalClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            />
        </div>
    );
}