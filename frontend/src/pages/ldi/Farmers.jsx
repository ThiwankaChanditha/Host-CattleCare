import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, UsersIcon, HomeIcon, SearchIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AddFarmerModal from '../../components/AddFarmerModal';
import AddFarmModal from '../../components/AddFarmModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Farmers() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'farms' ? 'farms' : 'farmers';
  });
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    fetchFarmers();
    fetchFarms();
  }, []);

  console.log('user details 123', user);
  const handleAddFarmSuccess = () => {
    fetchFarms(); // Refresh farms list after adding
  };

  const fetchFarmers = async () => {
    
    try {

      const response = await fetch('http://localhost:5000/api/ldi/farmers',{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetching farmers data:', data);
      if (data.success) {
        setFarmers(data.data);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setError('Failed to load farmers data');
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ldi/farms',{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetching farms data:', data);
      if (data.success) {
        setFarms(data.data);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      setError('Failed to load farms data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Farmers Management</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('farmers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'farmers'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UsersIcon className="w-5 h-5 inline mr-2" />
            Farmers ({farmers.length})
          </button>
          <button
            onClick={() => setActiveTab('farms')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'farms'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <HomeIcon className="w-5 h-5 inline mr-2" />
            Farms ({farms.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'farmers' ? <FarmersSection farmers={farmers} onAddFarmerClick={() => setIsAddFarmerModalOpen(true)} /> : <FarmsSection farms={farms} onAddFarmClick={() => setIsAddFarmModalOpen(true)} />}
      <AddFarmerModal
        isOpen={isAddFarmerModalOpen}
        onClose={() => setIsAddFarmerModalOpen(false)}
        onAddSuccess={() => {
          fetchFarmers();
          setIsAddFarmerModalOpen(false);
        }}
      />
      <AddFarmModal
        isOpen={isAddFarmModalOpen}
        onClose={() => setIsAddFarmModalOpen(false)}
        onAddSuccess={handleAddFarmSuccess}
      />
    </>
  );
}

function FarmersSection({ farmers, onAddFarmerClick}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const filteredFarmers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter((f) => {
      const name = (f.user_id?.full_name || '').toLowerCase();
      const nic = (f.nic || '').toLowerCase();
      return name.includes(q) || nic.includes(q);
    });
  }, [farmers, query]);

  const handleViewFarmer = (farmerId) => {
    navigate(`/ldi/farmerdetails/${farmerId}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or NIC..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center w-full sm:w-auto" onClick={onAddFarmerClick}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Farmer
        </button>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredFarmers.length === 0 ? (
          <div className="text-center text-gray-500 py-6 bg-white rounded-lg border">No farmers found</div>
        ) : (
          filteredFarmers.map((farmer) => (
            <div key={farmer._id} className="bg-white rounded-lg border p-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <h3 className="text-base font-semibold text-gray-900">{farmer.user_id?.full_name || 'N/A'}</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {farmer.rating || 0}/5
                </span>
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                <div><span className="text-gray-500">Phone:</span> {farmer.user_id?.contact_number || 'N/A'}</div>
                <div className="truncate"><span className="text-gray-500">Address:</span> {farmer.user_id?.address || 'N/A'}</div>
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  className="text-green-700 hover:text-green-900 font-medium"
                  onClick={() => handleViewFarmer(farmer._id)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No farmers found
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {farmer.user_id?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farmer.nic || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farmer.user_id?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farmer.user_id?.contact_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farmer.user_id?.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {farmer.rating || 0}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => handleViewFarmer(farmer._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FarmsSection({ farms, onAddFarmClick }) {
  const navigate = useNavigate();
  const [farmQuery, setFarmQuery] = useState('');
  const filteredFarms = useMemo(() => {
    const q = farmQuery.trim().toLowerCase();
    if (!q) return farms;
    return farms.filter((f) => {
      const name = (f.farm_name || '').toLowerCase();
      const reg = (f.farm_registration_number || '').toLowerCase();
      return name.includes(q) || reg.includes(q);
    });
  }, [farms, farmQuery]);

  const handleViewFarm = (farmId) => {
    navigate(`/ldi/farmdetails/${farmId}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={farmQuery}
            onChange={(e) => setFarmQuery(e.target.value)}
            placeholder="Search by farm name or registration number..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center w-full sm:w-auto" onClick={onAddFarmClick}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Farm
        </button>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredFarms.length === 0 ? (
          <div className="text-center text-gray-500 py-6 bg-white rounded-lg border">No farms found</div>
        ) : (
          filteredFarms.map((farm) => (
            <div key={farm._id} className="bg-white rounded-lg border p-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Farm Name</p>
                  <h3 className="text-base font-semibold text-gray-900">{farm.farm_name || 'N/A'}</h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {farm.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                <div><span className="text-gray-500">Owner:</span> {farm.farmer_id?.user_id?.full_name || 'N/A'}</div>
                <div><span className="text-gray-500">Reg No:</span> {farm.farm_registration_number || 'N/A'}</div>
                <div className="truncate"><span className="text-gray-500">Location:</span> {farm.location_address || 'N/A'}</div>
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  className="text-green-700 hover:text-green-900 font-medium"
                  onClick={() => handleViewFarm(farm._id)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
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
              {filteredFarms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No farms found
                  </td>
                </tr>
              ) : (
                filteredFarms.map((farm) => (
                  <tr key={farm._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {farm.farm_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.farmer_id?.user_id?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.farm_registration_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.location_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {farm.farm_type || 'N/A'}
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
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => handleViewFarm(farm._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
