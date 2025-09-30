import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AIRecordModal({ isOpen, onClose, farmId, animals, onAddSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    animal_id: '',
    ai_date: '',
    bull_breed: '',
    technician_name: '',
    technician_code: '',
    semen_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        animal_id: '',
        ai_date: '',
        bull_breed: '',
        technician_name: '',
        technician_code: '',
        semen_code: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/ldi/ai', {
        farm_id: farmId,
        ...formData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAddSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating AI record:', error);
      setError(error.response?.data?.message || 'Failed to create AI record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add AI Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
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
              Animal *
            </label>
            <select
              name="animal_id"
              value={formData.animal_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select an animal</option>
              {animals.map(animal => (
                <option key={animal._id} value={animal._id}>
                  {animal.animal_tag} ({animal.animal_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Date *
            </label>
            <input
              type="date"
              name="ai_date"
              value={formData.ai_date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bull Breed *
            </label>
            <input
              type="text"
              name="bull_breed"
              value={formData.bull_breed}
              onChange={handleChange}
              required
              placeholder="e.g., Holstein, Jersey, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technician Name *
            </label>
            <input
              type="text"
              name="technician_name"
              value={formData.technician_name}
              onChange={handleChange}
              required
              placeholder="Enter technician name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technician Code
            </label>
            <input
              type="text"
              name="technician_code"
              value={formData.technician_code}
              onChange={handleChange}
              placeholder="Enter technician code (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semen Code
            </label>
            <input
              type="text"
              name="semen_code"
              value={formData.semen_code}
              onChange={handleChange}
              placeholder="Enter semen code (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
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
              {loading ? 'Creating...' : 'Create AI Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 