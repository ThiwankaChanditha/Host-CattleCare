/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line no-unused-vars
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        console.log("AuthContext: Initializing user state...");
        try {
            const storedUser = localStorage.getItem('user');
            console.log("AuthContext: localStorage 'user' item found:", storedUser);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                console.log("AuthContext: Parsed user from localStorage:", parsedUser);
                return parsedUser;
            }
            console.log("AuthContext: No 'user' item in localStorage.");
            return null;
        } catch (error) {
            console.error("AuthContext: ERROR parsing user from localStorage:", error);
            localStorage.removeItem('user');
            return null;
        }
    });

    const isAuthenticated = useMemo(() => {
        const status = !!user;
        console.log("AuthContext: isAuthenticated derived as:", status, " (user is:", user, ")");
        return status;
    }, [user]);

    const login = (userData) => {
        if (!userData || (!userData.token && !userData.accessToken)) {
            console.error("AuthContext: Login failed. User data must contain a 'token' or 'accessToken'. Provided:", userData);
            return false;
        }

        setUser(userData); // Update React state

        try {
            localStorage.setItem('user', JSON.stringify(userData));
            console.log("AuthContext: User data SAVED to localStorage:", userData);
            return true; // <--- This line must be inside the try block for guaranteed success return
        } catch (error) {
            console.error("AuthContext: ERROR saving user data to localStorage during login:", error);
            return false; // <--- Crucial: Return false if localStorage fails
        }
    };

    const logout = () => {
        console.log("AuthContext: logout function called.");
        setUser(null);
        try {
            localStorage.removeItem('user');
            console.log("AuthContext: 'user' item REMOVED from localStorage.");
        } catch (error) {
            console.error("AuthContext: ERROR removing user data from localStorage during logout:", error);
        }
        console.log('AuthContext: User logged out.');
    };

    // ✅ NEW FUNCTION: To update parts of the user object in the context
    const updateUser = (updatedUserData) => {
        setUser(prevUser => {
            const newUser = {
                ...prevUser, // Keep existing user data
                ...updatedUserData // Overlay with new data (e.g., { profileImage: newPath })
            };
            // Also update localStorage to persist the change
            try {
                localStorage.setItem('user', JSON.stringify(newUser));
                console.log("AuthContext: User data UPDATED in localStorage:", newUser);
            } catch (error) {
                console.error("AuthContext: ERROR saving updated user data to localStorage:", error);
            }
            console.log("AuthContext: User state updated in context:", newUser); // Debug log
            return newUser;
        });
    };

    const token = user?.token || user?.accessToken || null;

    const authContextValue = useMemo(() => ({
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser, // ✅ EXPOSE THE NEW FUNCTION HERE
    }), [user, token, isAuthenticated, login, logout, updateUser]); // ✅ Add updateUser to dependency array

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};