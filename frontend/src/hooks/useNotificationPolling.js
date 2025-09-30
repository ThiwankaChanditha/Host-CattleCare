// src/hooks/useNotificationPolling.js
import { useEffect, useRef } from 'react';
import axios from 'axios';

const useNotificationPolling = (userId, API_BASE_URL, interval = 30000, onNewNotifications) => {
    const intervalRef = useRef(null);

    const fetchLatestNotifications = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/notifications/${userId}`);
            onNewNotifications(response.data);
        } catch (err) {
            console.error("Error polling for new notifications:", err);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchLatestNotifications();

            intervalRef.current = setInterval(fetchLatestNotifications, interval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userId, API_BASE_URL, interval, onNewNotifications]);

    const refetch = fetchLatestNotifications;

    return { refetch };
};

export default useNotificationPolling;