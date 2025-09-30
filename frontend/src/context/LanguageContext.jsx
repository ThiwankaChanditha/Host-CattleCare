import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        try {
            const storedLanguage = localStorage.getItem('appLanguage');
            return storedLanguage || 'en';
        } catch (error) {
            console.error("Error accessing localStorage for language:", error);
            return 'en';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('appLanguage', language);
        } catch (error) {
            console.error("Error saving language to localStorage:", error);
        }
    }, [language]);

    const changeLanguage = (newLanguage) => {
        if (['en', 'si', 'ta'].includes(newLanguage)) {
            setLanguage(newLanguage);
        } else {
            console.warn(`Attempted to set an unsupported language: ${newLanguage}`);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};