import React, { useEffect, useState } from "react";
import { ClipboardCheckIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

export default function PendingValidations() {
  const { token } = useAuth();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentValidations = async () => {
      try {
        const response = await axios.get('/api/ldi/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const recentValidations = response.data.data.recentValidations || [];
          setValidations(recentValidations);
        }
      } catch (error) {
        console.error('Error fetching recent validations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecentValidations();
    }
  }, [token]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClipboardCheckIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pending Validations
              </h2>
              <p className="text-sm text-gray-500">
                Reports awaiting your review
              </p>
            </div>
          </div>
          <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {validations.length}
          </div>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading validations...</p>
            </div>
          ) : validations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent validations found</p>
            </div>
          ) : (
            validations.map((validation, index) => (
              <div key={validation._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    {validation.validation_status === "Approved" ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : validation.validation_status === "Rejected" ? (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {validation.farm_name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {validation.report_month ? new Date(validation.report_month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Monthly Report'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {validation.submitted_date ? new Date(validation.submitted_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    validation.validation_status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : validation.validation_status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {validation.validation_status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}