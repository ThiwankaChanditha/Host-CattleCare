import React from 'react';
import { XIcon, CalendarIcon, UserIcon, HeartIcon, FileTextIcon } from 'lucide-react';

export default function AIInfoModal({ isOpen, onClose, aiRecord }) {
  if (!isOpen || !aiRecord) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Record Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Animal Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Animal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700">Animal Tag</label>
                <p className="text-sm text-blue-900 font-medium">{aiRecord.animal_tag || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Animal Type</label>
                <p className="text-sm text-blue-900">{aiRecord.animal_type || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* AI Procedure Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              AI Procedure Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700">AI Date</label>
                <p className="text-sm text-green-900 font-medium">{formatDate(aiRecord.ai_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">Bull Breed</label>
                <p className="text-sm text-green-900">{aiRecord.bull_breed || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">Technician Name</label>
                <p className="text-sm text-green-900">{aiRecord.technician_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">Technician Code</label>
                <p className="text-sm text-green-900">{aiRecord.technician_code || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">Semen Code</label>
                <p className="text-sm text-green-900">{aiRecord.semen_code || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700">Performed By</label>
                <p className="text-sm text-green-900">{aiRecord.performed_by || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Pregnancy Information */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Pregnancy Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700">Pregnancy Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPregnancyStatusColor(aiRecord.pregnancy_status)}`}>
                  {aiRecord.pregnancy_status || 'Unknown'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Pregnancy Check Date</label>
                <p className="text-sm text-purple-900">{formatDate(aiRecord.pregnancy_check_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Expected Calving Date</label>
                <p className="text-sm text-purple-900 font-medium">{formatDate(aiRecord.expected_calving_date)}</p>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileTextIcon className="w-5 h-5 mr-2" />
              Record Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Record ID</label>
                <p className="text-sm text-gray-900 font-mono">{aiRecord._id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-sm text-gray-900">{formatDate(aiRecord.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 