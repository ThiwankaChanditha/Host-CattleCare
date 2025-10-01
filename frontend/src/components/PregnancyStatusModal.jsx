import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PregnancyStatusModal({ isOpen, onClose, aiRecord, onUpdateSuccess }) {
  const { token } = useAuth();
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && aiRecord) {
      setPregnancyStatus(aiRecord.pregnancy_status || 'Unknown');
      setError('');
    }
  }, [isOpen, aiRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(`/api/ldi/ai/${aiRecord._id}/pregnancy-status`, {
        pregnancy_status: pregnancyStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onUpdateSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating pregnancy status:', error);
      setError(error.response?.data?.message || 'Failed to update pregnancy status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !aiRecord) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Pregnancy Status</h2>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
              {aiRecord.animal_tag}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Date
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
              {aiRecord.ai_date ? new Date(aiRecord.ai_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pregnancy Status *
            </label>
            <select
              value={pregnancyStatus}
              onChange={(e) => setPregnancyStatus(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Unknown">Unknown</option>
              <option value="Pregnant">Pregnant</option>
              <option value="Not Pregnant">Not Pregnant</option>
              <option value="Aborted">Aborted</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
