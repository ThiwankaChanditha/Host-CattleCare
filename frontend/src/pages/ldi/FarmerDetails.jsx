import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon, HomeIcon, MapPinIcon, CalendarIcon, PhoneIcon, MailIcon, EditIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EditFarmerModal from '../../components/EditFarmerModal';

export default function FarmerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [farmer, setFarmer] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchFarmerDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch farmer details
        const farmerResponse = await fetch(`/api/ldi/farmerdetails/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!farmerResponse.ok) {
          throw new Error('Failed to fetch farmer details');
        }

        const farmerData = await farmerResponse.json();
        setFarmer(farmerData.data);

        // Fetch farms for this farmer
        const farmsResponse = await fetch(`http://localhost:5000/api/ldi/farmerdetails/${id}/farms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (farmsResponse.ok) {
          const farmsData = await farmsResponse.json();
          setFarms(farmsData.data || []);
        } else {
          console.warn('Failed to fetch farms:', farmsResponse.statusText);
          setFarms([]);
        }
      } catch (err) {
        console.error('Error fetching farmer details:', err);
        setError(err.message || 'Failed to load farmer details');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchFarmerDetails();
    }
  }, [id, token]);

  const handleBack = () => {
    navigate('/ldi/farmers');
  };

  const handleViewFarm = (farmId) => {
    navigate(`/ldi/farmdetails/${farmId}`);
  };

  const handleEditFarmer = () => {
    setShowEditModal(true);
  };

  const handleFarmerUpdate = (updatedFarmer) => {
    setFarmer(updatedFarmer);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-semibold mb-2">Farmer Not Found</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Farmers
          </button>
        </div>
        <button
          onClick={handleEditFarmer}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center"
        >
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Farmer
        </button>
      </div>
      
      {/* Farmer Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center mb-4">
          <UserIcon className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg sm:text-xl font-semibold text-green-700">{farmer.user_id?.full_name || 'Unnamed Farmer'}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-sm text-gray-900">{farmer.user_id?.full_name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">NIC</p>
              <p className="text-sm text-gray-900">{farmer.nic || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <MailIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{farmer.user_id?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <PhoneIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{farmer.user_id?.contact_number || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <MapPinIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{farmer.user_id?.address || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Rating</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {farmer.rating || 0}/5
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Age</p>
              <p className="text-sm text-gray-900">{farmer.age || 'N/A'} years</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-pink-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Gender</p>
              <p className="text-sm text-gray-900">{farmer.gender || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Household Size</p>
              <p className="text-sm text-gray-900">{farmer.household_size || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Farms Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Farms Owned by this Farmer</h3>
          <span className="text-sm text-gray-500">{farms.length} farms</span>
        </div>

        {farms.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <HomeIcon className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No farms found for this farmer</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {farms.map((farm) => (
                <div key={farm._id} className="bg-white border rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Farm Name</p>
                      <h4 className="text-base font-semibold text-gray-900">{farm.farm_name || 'Unnamed Farm'}</h4>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      farm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {farm.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                    <div><span className="text-gray-500">Reg No:</span> {farm.farm_registration_number || '-'}</div>
                    <div className="truncate"><span className="text-gray-500">Location:</span> {farm.location_address || '-'}</div>
                    <div><span className="text-gray-500">Type:</span> {farm.farm_type || '-'}</div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleViewFarm(farm._id)}
                      className="text-green-700 hover:text-green-900 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farm Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farm Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farms.map((farm) => (
                    <tr key={farm._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {farm.farm_name || 'Unnamed Farm'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.farm_registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.location_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {farm.farm_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          farm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {farm.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewFarm(farm._id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Farmer Modal */}
      <EditFarmerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        farmer={farmer}
        onUpdateSuccess={handleFarmerUpdate}
      />
    </div>
  );
} 