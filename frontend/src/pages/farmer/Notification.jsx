/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { BellIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, XCircleIcon } from "lucide-react";
import NotificationDetails from "../../components/NotificationDetails";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import usePagination from "../../hooks/usePagination";
import NotificationBatchActions from "../../components/NotificationBatchActions";
import useNotificationPolling from "../../hooks/useNotificationPolling";
import ConfirmModal from "../farmer/components/ConfirmModal";
import { useToast } from "../../components/ToastNotification"

const translations = {
    en: {
        notifications: "Notifications",
        all: "All",
        read: "Read",
        unread: "Unread",
        dismissed: "Dismissed",
        alerts: "Alerts",
        success: "Success",
        info: "Info",
        viewDetails: "View Details",
        markAsRead: "Mark as Read",
        dismiss: "Dismiss",
        noNotifications: "No notifications found.",
        markedAsRead: "Read",
        isDismissed: "Dismissed",
        loadingNotifications: "Loading notifications...",
        failedToLoadNotifications: "Failed to fetch notifications.",
        notAuthenticated: "User not authenticated.",
        loadMore: "Load More",
        noMoreNotifications: "No more notifications.",
        markAllAsRead: "Mark All as Read",
        clearAll: "Clear All",
        confirmMarkAll: "Are you sure you want to mark all notifications as read?",
        confirmClearAll: "Are you sure you want to clear all notifications? This action cannot be undone.",
        allNotificationsMarked: "All notifications marked as read!",
        allNotificationsCleared: "All notifications cleared!",
        batchActionError: "Failed to perform batch action.",
        confirm: "Confirm",
        cancel: "Cancel",
        markAllReadTitle: "Confirm Mark All as Read",
        clearAllTitle: "Confirm Clear All",
        notificationMarkedAsRead: "Notification marked as read!",
        notificationDismissed: "Notification dismissed!",
        newNotification: "New",
    },
    si: {
        notifications: "දැනුම්දීම්",
        all: "සියල්ල",
        read: "කියවා ඇත",
        unread: "කියවා නැත",
        dismissed: "ඉවත් කර ඇත",
        alerts: "අනතුරු ඇඟවීම්",
        success: "සාර්ථකයි",
        info: "තොරතුරු",
        viewDetails: "විස්තර බලන්න",
        markAsRead: "කියවූ ලෙස සලකුණු කරන්න",
        dismiss: "ඉවත් කරන්න",
        noNotifications: "දැනුම්දීම් නොමැත.",
        markedAsRead: "කියවා ඇත",
        isDismissed: "ඉවත් කර ඇත",
        loadingNotifications: "දැනුම්දීම් පූරණය වෙමින් පවතී...",
        failedToLoadNotifications: "දැනුම්දීම් ලබා ගැනීමට අසමත් විය.",
        notAuthenticated: "පරිශීලකයා සත්‍යාපනය කර නැත.",
        loadMore: "තවත් පූරණය කරන්න",
        noMoreNotifications: "තවත් දැනුම්දීම් නොමැත.",
        markAllAsRead: "සියල්ල කියවූ ලෙස සලකුණු කරන්න",
        clearAll: "සියල්ල ඉවත් කරන්න",
        confirmMarkAll: "සියලුම දැනුම්දීම් කියවූ ලෙස සලකුණු කිරීමට ඔබ අදහස් කරන්නේද?",
        confirmClearAll: "සියලුම දැනුම්දීම් ඉවත් කිරීමට ඔබ අදහස් කරන්නේද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.",
        allNotificationsMarked: "සියලුම දැනුම්දීම් කියවූ ලෙස සලකුණු කර ඇත!",
        allNotificationsCleared: "සියලුම දැනුම්දීම් ඉවත් කර ඇත!",
        batchActionError: "තොග ක්‍රියාව අසාර්ථක විය.",
        confirm: "තහවුරු කරන්න",
        cancel: "අවලංගු කරන්න",
        markAllReadTitle: "සියල්ල කියවූ බව තහවුරු කරන්න",
        clearAllTitle: "සියල්ල ඉවත් කිරීම තහවුරු කරන්න",
        notificationMarkedAsRead: "දැනුම්දීම කියවූ ලෙස සලකුණු කරන ලදී!",
        notificationDismissed: "දැනුම්දීම ඉවත් කරන ලදී!",
        newNotification: "නව",
    },
    ta: {
        notifications: "அறிவிப்புகள்",
        all: "அனைத்தும்",
        read: "படிக்கப்பட்டது",
        unread: "படிக்கப்படாதவை",
        dismissed: "நிராகரிக்கப்பட்டது",
        alerts: "எச்சரிக்கைகள்",
        success: "வெற்றி",
        info: "தகவல்",
        viewDetails: "விவரங்களை காண்க",
        markAsRead: "படித்ததாக குறிக்கவும்",
        dismiss: "நிராகரிக்கவும்",
        noNotifications: "அறிவிப்புகள் எதுவும் இல்லை.",
        markedAsRead: "படிக்கப்பட்டது",
        isDismissed: "நிராகரிக்கப்பட்டது",
        loadingNotifications: "அறிவிப்புகள் ஏற்றப்படுகிறது...",
        failedToLoadNotifications: "அறிவிப்புகளை பெற முடியவில்லை.",
        notAuthenticated: "பயனர் அங்கீகரிக்கப்படவில்லை.",
        loadMore: "மேலும் ஏற்று",
        noMoreNotifications: "மேலும் அறிவிப்புகள் இல்லை.",
        markAllAsRead: "அனைத்தையும் படித்ததாக குறிக்கவும்",
        clearAll: "அனைத்தையும் அழிக்கவும்",
        confirmMarkAll: "அனைத்து அறிவிப்புகளையும் படித்ததாக குறிக்க விரும்புகிறீர்களா?",
        confirmClearAll: "அனைத்து அறிவிப்புகளையும் அழிக்க விரும்புகிறீர்களா? இந்த செயல்பாடு மீட்டமைக்க முடியாது.",
        allNotificationsMarked: "அனைத்து அறிவிப்புகளும் படித்ததாக குறிக்கப்பட்டன!",
        allNotificationsCleared: "அனைத்து அறிவிப்புகளும் அழிக்கப்பட்டன!",
        batchActionError: "முழுமையான செயல்பாட்டை செய்ய முடியவில்லை.",
        confirm: "உறுதிப்படுத்து",
        cancel: "ரத்துசெய்",
        markAllReadTitle: "அனைத்தையும் படித்ததாக உறுதிப்படுத்தவும்",
        clearAllTitle: "அனைத்தையும் அழிக்க உறுதிப்படுத்தவும்",
        notificationMarkedAsRead: "அறிவிப்பு படித்ததாக குறிக்கப்பட்டது!",
        notificationDismissed: "அறிவிப்பு நிராகரிக்கப்பட்டது!",
        newNotification: "புதிய",
    },
};

export default function Notifications() {
    const { language } = useLanguage();
    const t = translations[language];

    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();

    const [filter, setFilter] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [isMarkAllReadModalOpen, setIsMarkAllReadModalOpen] = useState(false);
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

    const API_BASE_URL = "http://localhost:5000";

    const fetchNotificationsData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!isAuthenticated || !user?.id) {
            setError(t.notAuthenticated);
            setLoading(false);
            return;
        }

        try {
            const userIdToFetch = user.id;
            const response = await axios.get(`/api/notifications/${userIdToFetch}`);
            setNotifications(response.data);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(t.failedToLoadNotifications);
            setLoading(false);
        }
    }, [user, isAuthenticated, API_BASE_URL, t]);

    useNotificationPolling(user?.id, API_BASE_URL, 30000, fetchNotificationsData);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchNotificationsData();
        } else if (!isAuthenticated) {
            setLoading(false);
            setError(t.notAuthenticated);
        }
    }, [isAuthenticated, user, fetchNotificationsData, t]);


    const getIcon = (type) => {
        switch (type) {
            case "alert":
                return <AlertCircleIcon className="h-6 w-6 text-red-500" />;
            case "success":
                return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case "info":
                return <InfoIcon className="h-6 w-6 text-blue-500" />;
            default:
                return <BellIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "dismissed") {
            return notification.is_dismissed;
        }
        if (notification.is_dismissed && filter !== "dismissed") {
            return false;
        }

        if (filter === "all") return true;
        if (filter === "read") return notification.read;
        if (filter === "unread") return !notification.read;
        return notification.type === filter;
    });

    const {
        currentData,
        hasMore,
        next
    } = usePagination(filteredNotifications, 5);

    const markAsRead = async (notificationId) => {
        if (!user?.id) {
            setError(t.notAuthenticated);
            return;
        }
        try {
            await axios.put(`/api/notifications/${user.id}/read/${notificationId}`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setSuccessMessage(t.notificationMarkedAsRead);
            setError(null);
        } catch (err) {
            console.error("Error marking notification as read:", err);
            setError(t.batchActionError);
            setSuccessMessage(null);
        }
    };

    const markAsDismissed = async (notificationId) => {
        if (!user?.id) {
            setError(t.notAuthenticated);
            return;
        }
        try {
            await axios.put(`/api/notifications/${user.id}/dismiss/${notificationId}`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    notif.id === notificationId ? { ...notif, is_dismissed: true } : notif
                )
            );
            setSuccessMessage(t.notificationDismissed);
            setError(null);
        } catch (err) {
            console.error("Error marking notification as dismissed:", err);
            setError(t.batchActionError);
            setSuccessMessage(null);
        }
    };

    const handleMarkAllAsReadClick = () => {
        setIsMarkAllReadModalOpen(true);
    };

    const handleClearAllNotificationsClick = () => {
        setIsClearAllModalOpen(true);
    };

    const confirmMarkAllAsRead = async () => {
        setIsMarkAllReadModalOpen(false);
        if (!user?.id) {
            setError(t.notAuthenticated);
            return;
        }
        try {
            await axios.put(`/api/notifications/${user.id}/mark-all-read`);
            setNotifications(prevNotifications =>
                prevNotifications.map(notif => ({ ...notif, read: true }))
            );
            setSuccessMessage(t.allNotificationsMarked);
            setError(null);
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            setError(t.batchActionError);
            setSuccessMessage(null);
        }
    };

    const confirmClearAllNotifications = async () => {
        setIsClearAllModalOpen(false);
        if (!user?.id) {
            setError(t.notAuthenticated);
            return;
        }
        try {
            await axios.delete(`/api/notifications/${user.id}/clear-all`);
            setNotifications([]);
            setSuccessMessage(t.allNotificationsCleared);
            setError(null);
        } catch (err) {
            console.error("Error clearing all notifications:", err);
            setError(t.batchActionError);
            setSuccessMessage(null);
        }
    };

    const handleViewDetails = (notification) => {
        setSelectedNotification(notification);
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    const handleCloseDetails = () => {
        setSelectedNotification(null);
    };

    const hasUnreadNotifications = notifications.some(notif => !notif.read && !notif.is_dismissed);
    const hasAnyNotifications = notifications.length > 0;

    const isUnreadNotification = (notification) => {
        return !notification.read && !notification.is_dismissed;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                    {["all", "read", "unread", "dismissed", "alerts", "success", "info"].map((f) => (
                        <button
                            key={f}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                ${filter === f
                                    ? "bg-green-600 text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-green-700"
                                }`}
                            onClick={() => setFilter(f)}
                        >
                            {t[f]}
                        </button>
                    ))}

                </div>
                <div className="flex flex-wrap p-1 mt-1">
                    {hasAnyNotifications && (
                        <NotificationBatchActions
                            onMarkAllAsRead={handleMarkAllAsReadClick}
                            onClearAll={handleClearAllNotificationsClick}
                            hasUnread={hasUnreadNotifications}
                            hasNotifications={hasAnyNotifications}
                        />
                    )}
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage(null)}>
                        <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697 0 1.2 1.2 0 0 1 0-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 0-1.697 1.2 1.2 0 0 1 1.697 0L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 0 1.2 1.2 0 0 1 0 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.697z" /></svg>
                    </span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697 0 1.2 1.2 0 0 1 0-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 0-1.697 1.2 1.2 0 0 1 1.697 0L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 0 1.2 1.2 0 0 1 0 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.697z" /></svg>
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="p-10 text-center text-gray-500 text-lg">{t.loadingNotifications}</div>
                ) : currentData.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-lg">{t.noNotifications}</div>
                ) : (
                    <>
                        {currentData.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 flex items-start gap-4 transition-all duration-200 ease-in-out relative
                                    bg-white rounded-lg shadow-md border
                                    ${isUnreadNotification(notification)
                                        ? "border-l-4 border-l-blue-500 border-blue-200 bg-blue-50 shadow-lg"
                                        : "border-gray-100"
                                    }`}
                            >
                                {isUnreadNotification(notification) && (
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                                )}

                                <div className="flex-shrink-0 mt-1 relative">
                                    {getIcon(notification.type)}
                                    {isUnreadNotification(notification) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-semibold text-lg
                                                ${isUnreadNotification(notification)
                                                    ? "text-blue-900"
                                                    : "text-gray-900"
                                                }`}>
                                                {t[notification.title_key] || notification.title_key}
                                            </h3>
                                            {isUnreadNotification(notification) && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                                                    {t.newNotification}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs
                                                ${isUnreadNotification(notification)
                                                    ? "text-blue-600 font-medium"
                                                    : "text-gray-500"
                                                }`}>
                                                {new Date(notification.time).toLocaleString()}
                                            </span>
                                            {(notification.read || notification.is_dismissed) && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${notification.is_dismissed ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}`}>
                                                    {notification.is_dismissed ? (
                                                        <XCircleIcon className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    )}
                                                    {notification.is_dismissed ? t.isDismissed : t.markedAsRead}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`text-sm line-clamp-2
                                        ${isUnreadNotification(notification)
                                            ? "text-blue-800 font-medium"
                                            : "text-gray-600"
                                        }`}>
                                        {t[notification.message_key] || notification.message_key}
                                    </p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors duration-200 shadow-sm
                                                ${isUnreadNotification(notification)
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                                }`}
                                            onClick={() => handleViewDetails(notification)}
                                        >
                                            {t.viewDetails}
                                        </button>
                                        {!notification.read && !notification.is_dismissed && (
                                            <button
                                                className="px-4 py-2 border border-blue-500 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                {t.markAsRead}
                                            </button>
                                        )}
                                        {!notification.is_dismissed && (
                                            <button
                                                className="px-4 py-2 border border-yellow-500 text-yellow-600 text-sm font-medium rounded-md hover:bg-yellow-50 transition-colors duration-200 shadow-sm"
                                                onClick={() => markAsDismissed(notification.id)}
                                            >
                                                {t.dismiss}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {hasMore && (
                            <div className="p-4 text-center">
                                <button
                                    onClick={next}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                                >
                                    {t.loadMore}
                                </button>
                            </div>
                        )}
                        {!hasMore && currentData.length > 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {t.noMoreNotifications}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedNotification && (
                <NotificationDetails notification={selectedNotification} onClose={handleCloseDetails} />
            )}

            <ConfirmModal
                isOpen={isMarkAllReadModalOpen}
                onClose={() => setIsMarkAllReadModalOpen(false)}
                onConfirm={confirmMarkAllAsRead}
                title={t.markAllReadTitle}
                message={t.confirmMarkAll}
                confirmText={t.confirm}
                cancelText={t.cancel}
                confirmButtonClass="bg-green-600 hover:bg-green-700"
                cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-100"
            />


            <ConfirmModal
                isOpen={isClearAllModalOpen}
                onClose={() => setIsClearAllModalOpen(false)}
                onConfirm={confirmClearAllNotifications}
                title={t.clearAllTitle}
                message={t.confirmClearAll}
                confirmText={t.confirm}
                cancelText={t.cancel}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-100"
            />
        </div>
    );
}