import React, { useState, useEffect } from 'react';
import { livestockDiseases } from '../vs/data/livestockDiseases';

const severityBadgeClasses = {
    'High Severity': 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
    'Medium to High Severity': 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200',
    'Medium Severity': 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200',
    'Low Severity': 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
    'Fatal': 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200'
};

const CommonDiseases = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDiseases, setFilteredDiseases] = useState(livestockDiseases);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const diseasesPerPage = 6;

    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = livestockDiseases.filter(disease =>
            disease.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            disease.category.toLowerCase().includes(lowerCaseSearchTerm) ||
            disease.symptoms.toLowerCase().includes(lowerCaseSearchTerm) ||
            disease.prevention.toLowerCase().includes(lowerCaseSearchTerm) ||
            disease.treatment.toLowerCase().includes(lowerCaseSearchTerm) ||
            disease.affectedSpecies.some(species => species.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredDiseases(filtered);
        setCurrentPage(1);
        setShowAll(false);
    }, [searchTerm]);

    const indexOfLastDisease = currentPage * diseasesPerPage;
    const indexOfFirstDisease = indexOfLastDisease - diseasesPerPage;
    const currentDiseases = showAll ? filteredDiseases : filteredDiseases.slice(indexOfFirstDisease, indexOfLastDisease);

    const totalPages = Math.ceil(filteredDiseases.length / diseasesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleShowAll = () => {
        setShowAll(true);
    };

    const handleShowLess = () => {
        setShowAll(false);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Warning Alert */}
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-8 flex items-start space-x-3 shadow-sm" role="alert">
                <svg className="flex-shrink-0 w-6 h-6 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.681-1.36 3.446 0l6.518 11.59c.75 1.334-.213 3.011-1.723 3.011H3.462c-1.51 0-2.473-1.677-1.723-3.011L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm leading-relaxed">
                    Heads up! Early detection and proper management of diseases are crucial for animal health and farm productivity. Always take action immediately if you observe any symptoms. Your prompt action can save lives and prevent economic losses. 🩺
                </p>
            </div>

            {/* Search Input with Clear Button */}
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Search diseases (e.g., FMD, viral, fever, cattle)"
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && ( // Conditionally render the clear button
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Clear search"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                )}
            </div>

            {/* Total Records and Pagination Controls */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <p className="text-gray-700 text-sm font-medium">
                    Total Records: <span className="font-bold text-lg">{filteredDiseases.length}</span>
                </p>
                <div className="flex items-center space-x-2">
                    {filteredDiseases.length > diseasesPerPage && (
                        showAll ? (
                            <button
                                onClick={handleShowLess}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out text-sm font-medium ml-4"
                            >
                                Show Less
                            </button>
                        ) : (
                            <button
                                onClick={handleShowAll}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out text-sm font-medium ml-4"
                            >
                                Show All ({filteredDiseases.length})
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* List of Diseases */}
            {currentDiseases.length === 0 ? (
                <p className="p-6 text-center text-gray-600 bg-white rounded-lg shadow-sm text-lg">No diseases found matching your search criteria. Try a different term. 🧐</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentDiseases.map(disease => (
                        <div
                            key={disease.id}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-100 overflow-hidden flex flex-col"
                        >
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{disease.name}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${severityBadgeClasses[disease.severity] || 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200'}`}>
                                        {disease.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 font-medium">Category: <span className="capitalize">{disease.category}</span></p>
                                <p className="text-sm text-gray-700 mb-4 italic">Affected Species: {disease.affectedSpecies.map(s => s.replace(/_/g, ' ')).join(', ')}</p>

                                <div className="space-y-4 text-sm text-gray-800">
                                    <div>
                                        <h4 className="font-semibold flex items-center mb-1 text-gray-900">
                                            <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M12 8v4l3 3"></path>
                                                <circle cx="12" cy="12" r="10"></circle>
                                            </svg>
                                            Symptoms
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed">{disease.symptoms}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center mb-1 text-gray-900">
                                            <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M9 12l2 2 4-4"></path>
                                                <path d="M12 20v-8"></path>
                                            </svg>
                                            Prevention
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed">{disease.prevention}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center mb-1 text-gray-900">
                                            <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M12 20h9"></path>
                                                <path d="M16 4l4 4-4 4"></path>
                                                <path d="M4 12h16"></path>
                                            </svg>
                                            Treatment
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed">{disease.treatment}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Conditional Pagination and Show All/Less Button below the grid */}
            {currentDiseases.length > 0 && (
                <div className="flex justify-between items-center mt-8 flex-wrap gap-3">
                    <p className="text-gray-700 text-sm font-medium">
                        {/* Total Records: <span className="font-bold text-lg">{filteredDiseases.length}</span> */}
                    </p>
                    <div className="flex items-center space-x-2">
                        {!showAll && filteredDiseases.length > diseasesPerPage && (
                            <>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-red-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition duration-150 ease-in-out"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-green-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition duration-150 ease-in-out"
                                >
                                    Next
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommonDiseases;