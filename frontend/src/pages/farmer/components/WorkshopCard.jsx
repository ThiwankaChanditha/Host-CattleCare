// src/pages/farmer/components/WorkshopCard.jsx
import React from 'react';
import { CalendarIcon, InfoIcon } from "lucide-react"; // Import InfoIcon

export default function WorkshopCard({ workshop, onRegisterClick, onCancelClick, onViewDetailsClick, t }) {
    const isRegistered = workshop.registered;
    const programDate = new Date(workshop.program_date).toLocaleDateString(t.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 flex-grow pr-4">{workshop.program_name}</h3>
                <div className="flex items-center text-gray-500 text-sm flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{programDate}</span>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{t.location}: {workshop.location}</p>
            <p className="text-gray-700 mb-4 line-clamp-2">{workshop.description}</p> {/* Limit description lines */}

            <div className="flex items-center space-x-3 mt-4">
                {/* View Details Button - Updated color to light green */}
                <button
                    onClick={() => onViewDetailsClick(workshop)}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 text-sm"
                >
                    <InfoIcon className="w-4 h-4 mr-2" />
                    {t.viewDetails}
                </button>

                {/* Register/Cancel Button */}
                {isRegistered ? (
                    <button
                        onClick={() => onCancelClick(workshop)}
                        className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 text-sm"
                    >
                        {t.cancelRegistration}
                    </button>
                ) : (
                    <button
                        onClick={() => onRegisterClick(workshop)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                    >
                        {t.registerNow}
                    </button>
                )}
            </div>
        </div>
    );
}