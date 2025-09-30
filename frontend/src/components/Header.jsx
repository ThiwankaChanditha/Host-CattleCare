// src/components/Header.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
// Removed: import { useTheme } from '../context/ThemeContext'; // No longer needed for theme toggling
// Removed: import { SunIcon, MoonIcon } from 'lucide-react'; // No longer needed for theme icons

// Translations for the Header specific elements
const headerTranslations = {
    en: {
        welcome: 'Welcome!',
        selectLanguage: 'Select Language',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ்',
        // Removed: toggleTheme: 'Toggle Theme' // No longer needed
    },
    si: {
        welcome: 'සාදරයෙන් පිළිගනිමු!',
        selectLanguage: 'භාෂාව තෝරන්න',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ்',
        // Removed: toggleTheme: 'තේමාව මාරු කරන්න' // No longer needed
    },
    ta: {
        welcome: 'வரவேற்பு!',
        selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
        english: 'English',
        sinhala: 'சிங்களம்',
        tamil: 'தமிழ்',
        // Removed: toggleTheme: 'தீம் மாறவும்' // No longer needed
    },
};

export default function Header() {
    const { language, changeLanguage } = useLanguage();
    const { user } = useAuth();

    const t = headerTranslations[language];

    return (
        <header className="bg-white shadow-sm py-4 px-8 border-b border-gray-200 flex items-center justify-between z-10 sticky top-0 transition-colors duration-300">
            <h1 className="text-2xl font-bold text-gray-800">
                {t.welcome}{" "}{user?.username}
            </h1>

            {/* Right section of the header - Language selector (Theme Toggle removed) */}
            <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <label htmlFor="header-language" className="mr-2 font-medium text-gray-700">
                    {t.selectLanguage}:
                </label>
                <select
                    id="header-language"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                >
                    <option value="en">{t.english}</option>
                    <option value="si">{t.sinhala}</option>
                    <option value="ta">{t.tamil}</option>
                </select>

                {/* Theme Toggle Button */}
                {/*
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={t.toggleTheme}
                >
                    {theme === 'light' ? (
                        <MoonIcon className="w-5 h-5" />
                    ) : (
                        <SunIcon className="w-5 h-5" />
                    )}
                </button>
                */}
            </div>
        </header>
    );
}