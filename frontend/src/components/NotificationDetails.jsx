import React from "react";
import { X } from "lucide-react"; // Import X icon for close button
import { useLanguage } from "../context/LanguageContext"; // Import useLanguage context

const translations = {
    en: {
        notificationDetails: "Notification Details",
        type: "Type",
        time: "Time",
        status: "Status",
        dismissed: "Dismissed",
        alert: "Alert",
        success: "Success",
        information: "Information",
        general: "General",
        read: "Read",
        unread: "Unread",
        yes: "Yes",
        no: "No",
        noDetailedMessage: "No detailed message available.",
    },
    si: {
        notificationDetails: "දැනුම්දීම් විස්තර",
        type: "වර්ගය",
        time: "වේලාව",
        status: "තත්ත්වය",
        dismissed: "ඉවත් කරන ලදී",
        alert: "අනතුරු ඇඟවීම",
        success: "සාර්ථකයි",
        information: "තොරතුරු",
        general: "සාමාන්‍ය",
        read: "කියවා ඇත",
        unread: "කියවා නැත",
        yes: "ඔව්",
        no: "නැත",
        noDetailedMessage: "විස්තරාත්මක පණිවිඩයක් නොමැත.",
    },
    ta: {
        notificationDetails: "அறிவிப்பு விவரங்கள்",
        type: "வகை",
        time: "நேரம்",
        status: "நிலை",
        dismissed: "நிராகரிக்கப்பட்டது",
        alert: "எச்சரிக்கை",
        success: "வெற்றி",
        information: "தகவல்",
        general: "பொது",
        read: "படிக்கப்பட்டது",
        unread: "படிக்கப்படாதவை",
        yes: "ஆம்",
        no: "இல்லை",
        noDetailedMessage: "விரிவான செய்தி இல்லை.",
    },
};

const NotificationDetails = ({ notification, onClose }) => {
    const { language } = useLanguage();
    const t = translations[language];

    // A simple mapping for type display, now using translations
    const getTypeDisplayName = (type) => {
        switch (type) {
            case "alert": return t.alert;
            case "success": return t.success;
            case "info": return t.information;
            default: return t.general;
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 opacity-100 flex flex-col gap-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {notification.title_key ? t[notification.title_key] || notification.title_key : notification.title || t.notificationDetails}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" /> {/* Using Lucide icon */}
                    </button>
                </div>

                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                    {notification.message_key ? t[notification.message_key] || notification.message_key : notification.message || t.noDetailedMessage}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-4 border-gray-200">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{t.type}:</span>
                        <span className="capitalize text-gray-700">{getTypeDisplayName(notification.type)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{t.time}:</span>
                        <span className="text-gray-700">{new Date(notification.time).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{t.status}:</span>
                        <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${notification.read
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {notification.read ? t.read : t.unread}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{t.dismissed}:</span>
                        <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${notification.is_dismissed
                                ? "bg-gray-200 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                        >
                            {notification.is_dismissed ? t.yes : t.no}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetails;