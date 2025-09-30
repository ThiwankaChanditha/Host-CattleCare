import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';

export default function AnimalEditModal({ isOpen, onClose, onUpdateAnimal, animal }) {
  const [formData, setFormData] = useState({
    animal_tag: '',
    animal_type: '',
    category: '',
    birth_date: '',
    gender: '',
    purchase_date: '',
    purchase_price: '',
    current_status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && animal) {
      setFormData({
        animal_tag: animal.animal_tag || '',
        animal_type: animal.animal_type || '',
        category: animal.category || '',
        birth_date: animal.birth_date ? animal.birth_date.split('T')[0] : '',
        gender: animal.gender || '',
        purchase_date: animal.purchase_date ? animal.purchase_date.split('T')[0] : '',
        purchase_price: animal.purchase_price || '',
        current_status: animal.current_status || 'Active'
      });
      setErrors({});
    }
  }, [isOpen, animal]);

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
    
    if (!formData.animal_type) newErrors.animal_type = 'Animal type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert date strings to Date objects for the backend
      const updateData = {
        ...formData,
        birth_date: formData.birth_date ? new Date(formData.birth_date) : null,
        purchase_date: formData.purchase_date ? new Date(formData.purchase_date) : null
      };
      
      await onUpdateAnimal(animal._id, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating animal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Animal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal Tag
            </label>
            <input
              type="text"
              name="animal_tag"
              value={formData.animal_tag}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., COW-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal Type *
            </label>
            <select
              name="animal_type"
              value={formData.animal_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Cattle">Cattle</option>
              <option value="Buffalo">Buffalo</option>
            </select>
            {errors.animal_type && <p className="text-red-500 text-xs mt-1">{errors.animal_type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Milking Cow">Milking Cow</option>
              <option value="Dry Cow">Dry Cow</option>
              <option value="Pregnant Heifer">Pregnant Heifer</option>
              <option value="Non-Pregnant Heifer">Non-Pregnant Heifer</option>
              <option value="Female Calf (less than 3m)">Female Calf (less than 3m)</option>
              <option value="Female Calf (3-12m)">Female Calf (3-12m)</option>
              <option value="Male Calf (less than 12m)">Male Calf (less than 12m)</option>
              <option value="Bull">Bull</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price
            </label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status
            </label>
            <select
              name="current_status"
              value={formData.current_status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Sold">Sold</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 