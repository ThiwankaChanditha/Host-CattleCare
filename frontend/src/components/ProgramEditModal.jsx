import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';

export default function ProgramEditModal({ isOpen, onClose, program, onSave }) {
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

  useEffect(() => {
    if (isOpen && program) {
      setFormData({
        program_name: program.program_name || '',
        program_type: program.program_type || '',
        description: program.description || '',
        program_date: program.program_date ? new Date(program.program_date).toISOString().split('T')[0] : '',
        location: program.location || '',
        participants_count: program.participants_count || ''
      });
      setErrors({});
    }
  }, [isOpen, program]);

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
    
    if (!formData.program_name) newErrors.program_name = 'Program name is required';
    if (!formData.program_type) newErrors.program_type = 'Program type is required';
    if (!formData.program_date) newErrors.program_date = 'Program date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(program._id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating program:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Program</h2>
          <button
            onClick={onClose}
            className="relative z-50 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <option value="">Select Type</option>
              <option value="Training">Training</option>
              <option value="Field Day">Field Day</option>
              <option value="Workshop">Workshop</option>
              <option value="Demonstration">Demonstration</option>
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
              placeholder="Enter program description..."
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
              placeholder="Enter program location..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participants Count
            </label>
            <input
              type="number"
              name="participants_count"
              value={formData.participants_count}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              min="0"
            />
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
