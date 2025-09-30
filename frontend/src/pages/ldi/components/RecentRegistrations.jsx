import React, { useEffect, useState } from "react";
import { HomeIcon, UserIcon, MapPinIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

export default function RecentRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFarms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ldi/farms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          // Get the 3 most recent farms
          const recentFarms = response.data.data.slice(0, 3);
          setRegistrations(recentFarms);
        }
      } catch (error) {
        console.error('Error fetching recent farms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecentFarms();
    }
  }, [token]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Registrations
              </h2>
              <p className="text-sm text-gray-500">
                New farms and farmers
              </p>
            </div>
          </div>
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {registrations.length}
          </div>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading recent farms...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent farm registrations found</p>
            </div>
          ) : (
            registrations.map((registration, index) => (
              <div key={registration._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    {registration.is_active ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {registration.farm_name || 'Unnamed Farm'}
                    </h3>
                    <p className="text-xs text-gray-600">{registration.farm_type || 'Unknown Type'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <UserIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {registration.farmer_id?.user_id?.full_name || 'Unknown Farmer'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPinIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {registration.location_address || 'No address'}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  registration.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {registration.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}