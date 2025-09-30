import React, { useState } from 'react';
import { XIcon, UserIcon, MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddFarmerModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    nic: '',
    full_name: '',
    email: '',
    contact_number: '',
    address: '',
    username: '',
    age: '',
    gender: '',
    education_level: '',
    occupation: '',
    ethnicity: '',
    religion: '',
    marital_status: '',
    household_size: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userFound, setUserFound] = useState(false);
  const { token, isAuthenticated, loading: authLoading, logout } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'nic' && value.length >= 5) {
      fetchUserByNIC(value);
    }
  };

  const fetchUserByNIC = async (nic) => {
    setError(null);
    setUserFound(false);
    if (!nic) return;
    try {
      const res = await fetch(`/api/ldi/user-by-nic/${nic}`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          full_name: data.data.full_name || '',
          email: data.data.email || '',
          contact_number: data.data.contact_number || '',
          address: data.data.address || '',
          username: data.data.username || ''
        }));
        setUserFound(true);
      } else {
        setUserFound(false);
        setFormData(prev => ({ ...prev, full_name: '', eAuthorizationmail: '', contact_number: '', address: '', username: '' }));
        setError('No user found for this NIC.');
      }
    } catch (err) {
      setUserFound(false);
      setError('Error fetching user by NIC.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.nic) {
      setError('NIC is required.');
      setLoading(false);
      return;
    }
    if (!userFound) {
      setError('You must enter a valid NIC for an existing user.');
      setLoading(false);
      return;
    }
    // Only send NIC and additional farmer details
    const farmerPayload = {
      nic: formData.nic,
      age: formData.age,
      gender: formData.gender,
      education_level: formData.education_level,
      occupation: formData.occupation,
      ethnicity: formData.ethnicity,
      religion: formData.religion,
      marital_status: formData.marital_status,
      household_size: formData.household_size
    };

    console.log(farmerPayload);
    try {
      const response = await fetch('/api/ldi/create-farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(farmerPayload)
      });

      const data = await response.json();

      if (data.success) {
        onAddSuccess(data.data);
        resetForm();
        onClose();
      } else {
        setError(data.message || 'Failed to create farmer');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nic: '',
      full_name: '',
      email: '',
      contact_number: '',
      address: '',
      username: '',
      age: '',
      gender: '',
      education_level: '',
      occupation: '',
      ethnicity: '',
      religion: '',
      marital_status: '',
      household_size: ''
    });
    setUserFound(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Add New Farmer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    disabled
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Additional Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <input
                    type="text"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    placeholder="e.g., High School, Bachelor's"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g., Farmer, Teacher"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ethnicity
                  </label>
                  <input
                    type="text"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Religion
                  </label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Household Size
                  </label>
                  <input
                    type="number"
                    name="household_size"
                    value={formData.household_size}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Add Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
