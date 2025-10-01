import React, { useState, useEffect } from 'react';
import { XIcon, HomeIcon, MapPinIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddFarmModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    farm_registration_number: '',
    farmer_id: '',
    farm_name: '',
    location_address: '',
    farm_type: '',
    registration_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchFarmers();
    }
  }, [isOpen]);

  const fetchFarmers = async () => {
    try {
      const response = await fetch('/api/ldi/farmers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFarmers(data.data);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.farm_registration_number || !formData.farmer_id || !formData.location_address || !formData.farm_type) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ldi/create-farm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onAddSuccess();
        resetForm();
        onClose();
      } else {
        setError(data.message || 'Failed to create farm');
      }
    } catch (error) {
      console.error('Error creating farm:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      farm_registration_number: '',
      farmer_id: '',
      farm_name: '',
      location_address: '',
      farm_type: '',
      registration_date: new Date().toISOString().split('T')[0]
    });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HomeIcon className="w-5 h-5 mr-2 text-green-600" />
            Add New Farm
          </h2>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Farm Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Registration Number *
              </label>
              <input
                type="text"
                name="farm_registration_number"
                value={formData.farm_registration_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter farm registration number"
                required
              />
            </div>

            {/* Farm Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name
              </label>
              <input
                type="text"
                name="farm_name"
                value={formData.farm_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter farm name"
              />
            </div>

            {/* Farmer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Farmer *
              </label>
              <select
                name="farmer_id"
                value={formData.farmer_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select a farmer</option>
                {farmers.map((farmer) => (
                  <option key={farmer._id} value={farmer._id}>
                    {farmer.user_id?.full_name} - {farmer.nic}
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Type *
              </label>
              <select
                name="farm_type"
                value={formData.farm_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select farm type</option>
                <option value="Intensive">Intensive</option>
                <option value="Semi-Intensive">Semi-Intensive</option>
                <option value="Extensive">Extensive</option>
              </select>
            </div>
            
            {/* Registration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Date *
              </label>
              <input
                type="date"
                name="registration_date"
                value={formData.registration_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Location Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Address *
            </label>
            <textarea
              name="location_address"
              value={formData.location_address}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter farm location address"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
              {loading ? 'Creating...' : 'Create Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
