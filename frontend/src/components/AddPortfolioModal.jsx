import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AddPortfolioModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    program_name: '',
    program_type: '',
    description: '',
    program_date: '',
    location: '',
    participants_count: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const programTypes = ['Training', 'Field Day', 'Workshop', 'Demonstration'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.program_name.trim()) newErrors.program_name = 'Program name is required';
    if (!formData.program_type) newErrors.program_type = 'Program type is required';
    if (!formData.program_date) newErrors.program_date = 'Program date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!token) {
      setErrors({ general: 'Authentication token not found. Please log in again.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/programs', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      onSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('Error creating program:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to create program. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      program_name: '',
      program_type: '',
      description: '',
      program_date: '',
      location: '',
      participants_count: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-stretch sm:items-center justify-center z-50">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-2xl mx-0 sm:mx-4 max-h-none sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Portfolio</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name *
            </label>
            <input
              type="text"
              name="program_name"
              value={formData.program_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter program name"
              required
            />
            {errors.program_name && <p className="text-red-500 text-xs mt-1">{errors.program_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Type *
            </label>
            <select
              name="program_type"
              value={formData.program_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select program type</option>
              {programTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.program_type && <p className="text-red-500 text-xs mt-1">{errors.program_type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter program description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Date *
            </label>
            <input
              type="date"
              name="program_date"
              value={formData.program_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {errors.program_date && <p className="text-red-500 text-xs mt-1">{errors.program_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter program location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Participants Count
            </label>
            <input
              type="number"
              name="participants_count"
              value={formData.participants_count}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter expected number of participants"
              min="0"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Portfolio'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 