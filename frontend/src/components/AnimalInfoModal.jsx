import React, { useState, useEffect } from 'react';
import { XIcon, CalendarIcon, TagIcon, HeartIcon, DropletsIcon, HomeIcon, UserIcon } from 'lucide-react';

export default function AnimalInfoModal({ isOpen, onClose, animal, aiRecords = [] }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !animal) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Sold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Deceased':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPregnancyStatusColor = (status) => {
    switch (status) {
      case 'Pregnant':
        return 'bg-green-100 text-green-800';
      case 'Not Pregnant':
        return 'bg-red-100 text-red-800';
      case 'Aborted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Animal Details</h2>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Animal Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <TagIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Animal Tag</p>
                  <p className="text-sm text-gray-900">{animal.animal_tag || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <HomeIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Animal Type</p>
                  <p className="text-sm text-gray-900">{animal.animal_type}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <UserIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">{animal.category}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-pink-100 p-2 rounded-lg mr-3">
                  <UserIcon className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{animal.gender}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <CalendarIcon className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Birth Date</p>
                  <p className="text-sm text-gray-900">{formatDate(animal.birth_date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                  <p className="text-sm text-gray-900">{formatDate(animal.purchase_date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <DropletsIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Purchase Price</p>
                  <p className="text-sm text-gray-900">
                    {animal.purchase_price ? `Rs. ${animal.purchase_price.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-3">
                  <HomeIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(animal.current_status)}`}>
                    {animal.current_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Records Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2 text-pink-600" />
              Artificial Insemination Records ({aiRecords.length})
            </h3>
            
            {aiRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <HeartIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No AI records found for this animal</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiRecords.map((record, index) => (
                  <div key={record._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">AI Date</label>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(record.ai_date)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Bull Breed</label>
                        <p className="text-sm font-medium text-gray-900">
                          {record.bull_breed || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Technician Name</label>
                        <p className="text-sm font-medium text-gray-900">
                          {record.technician_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Technician Code</label>
                        <p className="text-sm font-medium text-gray-900">
                          {record.technician_code || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Semen Code</label>
                        <p className="text-sm font-medium text-gray-900">
                          {record.semen_code || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Pregnancy Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPregnancyStatusColor(record.pregnancy_status)}`}>
                          {record.pregnancy_status || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Expected Calving</label>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(record.expected_calving_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 
