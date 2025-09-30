import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the user token

const useFarms = () => {
    const { user } = useAuth(); // Get the user object (contains token) from AuthContext
    const [farms, setFarms] = useState([]);
    const [farmsLoading, setFarmsLoading] = useState(true); // Start as true to indicate initial loading
    const [farmsError, setFarmsError] = useState(null);

    const fetchFarms = useCallback(async () => {
        // Only attempt to fetch if user and token are available
        if (!user || !user.token) {
            console.log("useFarms: User or token not available, skipping farm fetch. User:", user);
            setFarms([]); // Ensure farms array is empty
            setFarmsLoading(false); // Mark as not loading
            setFarmsError(null); // Clear any previous errors
            return;
        }

        setFarmsLoading(true); // Indicate loading
        setFarmsError(null); // Clear previous errors

        try {
            console.log("useFarms: Attempting to fetch farms...");
            const response = await fetch('/api/dashboard/summary', { // Assuming this endpoint returns farms
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("useFarms: API response not OK:", response.status, errorData);
                throw new Error(errorData.message || 'Failed to fetch user farms.');
            }

            const data = await response.json();
            // Assuming farms are nested under 'data.data.farms' based on typical dashboard summary responses
            const fetchedFarms = data.data?.farms || []; // Use optional chaining for safety

            setFarms(fetchedFarms);
            console.log("useFarms: Farms fetched successfully:", fetchedFarms);

        } catch (error) {
            console.error("useFarms: Error fetching farms:", error);
            setFarmsError(error.message); // Set the error message
            setFarms([]); // Clear farms on error
        } finally {
            setFarmsLoading(false); // Always set loading to false when done
        }
    }, [user]); // Re-run fetchFarms if the user object (and thus token) changes

    useEffect(() => {
        // Fetch farms when the component mounts or fetchFarms function changes
        // This effect will trigger `fetchFarms` when `user` changes, including on initial load if `user` is present.
        fetchFarms();
    }, [fetchFarms]);

    return { farms, farmsLoading, farmsError };
};

export default useFarms;