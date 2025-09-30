import React, { useState, useEffect } from 'react';
import { XIcon, HomeIcon, MapPinIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EditFarmModal({ isOpen, onClose, farm, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    farm_name: '',
    location_address: '',
    farm_type: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && farm) {
      setFormData({
        farm_name: farm.farm_name || '',
        location_address: farm.location_address || '',
        farm_type: farm.farm_type || '',
        is_active: farm.is_active !== undefined ? farm.is_active : true
      });
      setError(null);
    }
  }, [isOpen, farm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.location_address || !formData.farm_type) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/ldi/farms/${farm._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onUpdateSuccess(data.data);
        onClose();
      } else {
        setError(data.message || 'Failed to update farm');
      }
    } catch (error) {
      console.error('Error updating farm:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !farm) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HomeIcon className="w-5 h-5 mr-2 text-green-600" />
            Edit Farm Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Farm Information Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Farm Information (Read-only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Registration Number
                </label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {farm.farm_registration_number || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {farm.registration_date ? new Date(farm.registration_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {farm.farmer_id?.user_id?.full_name || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner NIC
                </label>
                <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                  {farm.farmer_id?.nic || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Editable Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Farm Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Farm is Active
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Uncheck this if the farm is no longer operational
              </p>
            </div>
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
              {loading ? 'Updating...' : 'Update Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 