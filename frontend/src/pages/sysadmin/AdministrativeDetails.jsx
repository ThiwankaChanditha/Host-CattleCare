/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Trash2, Filter } from 'lucide-react';
import axios from 'axios';

const AdministrativeDetails = ({ setCurrentView }) => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchDivisions();
  }, [filterType]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/admin/administrative_division';
      if (filterType !== 'all') {
        url = `http://localhost:5000/api/admin/administrative_division/filter?division_type=${filterType}`;
      }
      const response = await axios.get(url);
      setDivisions(response.data.data);
    } catch (err) {
      console.error("Error fetching administrative divisions:", err);
      setError("Failed to load administrative divisions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/administrative_division/${id}`);
        fetchDivisions();
      } catch (err) {
        console.error("Error deleting administrative division:", err);
        setError("Failed to delete administrative division");
      }
    }
  };

  const divisionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'GN', label: 'GN' },
    { value: 'LDI', label: 'LDI' },
    { value: 'VS', label: 'VS' },
    { value: 'RD', label: 'RD' },
    { value: 'PD', label: 'PD' },
    { value: 'DG', label: 'DG' }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading administrative divisions...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Administrative Details</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            {divisionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Divisions Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisions.map(division => (
                <tr key={division._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {division.division_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {division.division_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {division.parent_division_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(division.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(division._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {divisions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No administrative divisions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrativeDetails;
