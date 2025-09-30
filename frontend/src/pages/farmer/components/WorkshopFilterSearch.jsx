import React from "react";
import { SearchIcon } from "lucide-react";
import { useLanguage } from '../../../context/LanguageContext'; // Adjusted import path to match your project structure

const filterSearchTranslations = {
    en: {
        all: "All",
        searchPlaceholder: "Search workshops...",
    },
    si: {
        all: "සියල්ල",
        searchPlaceholder: "වැඩමුළු සොයන්න...",
    },
    ta: {
        all: "அனைத்தும்",
        searchPlaceholder: "பணிமனைகளைத் தேடுக...",
    },
};

export default function WorkshopFilterSearch({
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
}) {
    const { language } = useLanguage();
    const t = filterSearchTranslations[language];

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        filter === "all"
                            ? "bg-green-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-green-700"
                    }`}
                    onClick={() => setFilter("all")}
                >
                    {t.all}
                </button>
                {/* Add more filter buttons if you have other program types, e.g., Campaigns, Seminars */}
                {/* For now, we'll stick to 'all' for simplicity based on your original component showing only workshops */}
            </div>

            {/* Search Input */}
            <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
            </div>
        </div>
    );
}