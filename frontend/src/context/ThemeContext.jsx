// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Context
const ThemeContext = createContext();

// Create a Provider component
export const ThemeProvider = ({ children }) => {
    // Get initial theme from localStorage or default to 'light'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        // Check for system preference if no theme is saved
        if (savedTheme) {
            return savedTheme;
        }
        // return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return 'light'; // Default to light if no saved theme and no system preference check
    });

    // Effect to apply/remove 'dark' class to the <html> element
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('appTheme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('appTheme', 'light');
        }
    }, [theme]);

    // Function to toggle theme
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context easily
export const useTheme = () => {
    return useContext(ThemeContext);
};