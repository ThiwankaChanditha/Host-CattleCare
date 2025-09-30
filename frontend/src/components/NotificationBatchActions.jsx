import React from 'react'; // React is implicitly used by JSX, good practice to import
import { useLanguage } from '../context/LanguageContext';
// Assuming you have icons like CheckCircleIcon and XCircleIcon if you want to include them
// import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

const translations = {
    en: {
        markAllAsRead: "Mark All as Read",
        clearAll: "Clear All",
        // The confirm messages are no longer needed IN THIS COMPONENT,
        // as the parent component's ConfirmModal will handle them.
        // Keeping them here for completeness of the translations object if they are used elsewhere.
        confirmMarkAll: "Are you sure you want to mark all notifications as read?",
        confirmClearAll: "Are you sure you want to clear all notifications? This action cannot be undone.",
        allNotificationsMarked: "All notifications marked as read!",
        allNotificationsCleared: "All notifications cleared!",
        batchActionError: "Failed to perform batch action."
    },
    si: {
        markAllAsRead: "සියල්ල කියවූ ලෙස සලකුණු කරන්න",
        clearAll: "සියල්ල ඉවත් කරන්න",
        confirmMarkAll: "සියලුම දැනුම්දීම් කියවූ ලෙස සලකුණු කිරීමට ඔබ අදහස් කරන්නේද?",
        confirmClearAll: "සියලුම දැනුම්දීම් ඉවත් කිරීමට ඔබ අදහස් කරන්නේද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
        allNotificationsMarked: "සියලුම දැනුම්දීම් කියවූ ලෙස සලකුණු කර ඇත!",
        allNotificationsCleared: "සියලුම දැනුම්දීම් ඉවත් කර ඇත!",
        batchActionError: "තොග ක්‍රියාව අසාර්ථක විය."
    },
    ta: {
        markAllAsRead: "அனைத்தையும் படித்ததாக குறிக்கவும்",
        clearAll: "அனைத்தையும் அழிக்கவும்",
        confirmMarkAll: "அனைத்து அறிவிப்புகளையும் படித்ததாக குறிக்க விரும்புகிறீர்களா?",
        confirmClearAll: "அனைத்து அறிவிப்புகளையும் அழிக்க விரும்புகிறீர்களா? இந்த செயல் திரும்ப முடியாது.",
        allNotificationsMarked: "அனைத்து அறிவிப்புகளும் படித்ததாக குறிக்கப்பட்டன!",
        allNotificationsCleared: "அனைத்து அறிவிப்புகளும் அழிக்கப்பட்டன!",
        batchActionError: "தொகுப்புச் செயல்பாட்டை செயல்படுத்த முடியவில்லை."
    }
};

const NotificationBatchActions = ({ onMarkAllAsRead, onClearAll, hasUnread, hasNotifications }) => {
    const { language } = useLanguage();
    const t = translations[language];

    // Remove the handleMarkAll and handleClearAll functions.
    // The props (onMarkAllAsRead, onClearAll) already trigger the modals in the parent component.

    return (
        <div className="flex justify-end gap-3 mb-4">
            <button
                // Directly call the prop that opens the modal in the parent component
                onClick={onMarkAllAsRead}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 shadow-sm
                    ${hasUnread
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                disabled={!hasUnread}
            >
                {/* Optionally add an icon here if desired */}
                {/* <CheckCircleIcon className="h-4 w-4 mr-2" /> */}
                {t.markAllAsRead}
            </button>
            <button
                // Directly call the prop that opens the modal in the parent component
                onClick={onClearAll}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 shadow-sm
                    ${hasNotifications
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                disabled={!hasNotifications}
            >
                {/* Optionally add an icon here if desired */}
                {/* <XCircleIcon className="h-4 w-4 mr-2" /> */}
                {t.clearAll}
            </button>
        </div>
    );
};

export default NotificationBatchActions;