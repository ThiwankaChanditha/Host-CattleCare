import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, FilterIcon, User } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Validations() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingReports, setProcessingReports] = useState(new Set());
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const ldiOfficerId = user?.id;
        if (!ldiOfficerId) {
          setError("LDI officer ID not found");
          setLoading(false);
          return;
        }
        const response = await axios.get(`/api/ldi/validations/${ldiOfficerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setReports(response.data.data || []);
      } catch {
        setError("Failed to load validations");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token, user]);

  const handleApprove = async (reportId) => {
    if (processingReports.has(reportId)) return;

    setProcessingReports(prev => new Set(prev).add(reportId));

    try {
      const response = await axios.put(
        `/api/farmer-reports/${reportId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setReports(prevReports =>
          prevReports.map(report =>
            report._id === reportId
              ? { ...report, validation_status: 'Approved', validated_by: response.data.data.validated_by }
              : report
          )
        );
      }
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setProcessingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleReject = async (reportId) => {
    if (processingReports.has(reportId)) return;

    setProcessingReports(prev => new Set(prev).add(reportId));

    try {
      const response = await axios.put(
        `/api/farmer-reports/${reportId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setReports(prevReports =>
          prevReports.map(report =>
            report._id === reportId
              ? { ...report, validation_status: 'Rejected', validated_by: response.data.data.validated_by }
              : report
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    } finally {
      setProcessingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const filteredReports = reports.filter(report => {
    switch (filter) {
      case 'pending':
        return report.validation_status === 'Pending';
      case 'approved':
        return report.validation_status === 'Approved';
      case 'rejected':
        return report.validation_status === 'Rejected';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Farmer Monthly Reports
        </h1>
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="pending">Pending ({reports.filter(r => r.validation_status === 'Pending').length})</option>
            <option value="approved">Approved ({reports.filter(r => r.validation_status === 'Approved').length})</option>
            <option value="rejected">Rejected ({reports.filter(r => r.validation_status === 'Rejected').length})</option>
            <option value="all">All ({reports.length})</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading reports...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : filteredReports.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-10">No reports found for the selected filter.</p>
      ) : (
        <div className="grid gap-6 max-h-[70vh] overflow-y-auto pr-2">
          {filteredReports.map(report => (
            <div key={report._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {report.farm_id?.farm_name || "Unknown Farm"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Report Month: {report.report_month ? new Date(report.report_month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : "-"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${report.validation_status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : report.validation_status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {report.validation_status}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Milk Production</p>
                  <p className="font-medium text-gray-900">{report.total_milk_production ?? "-"} L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium text-gray-900">{report.submitted_date ? new Date(report.submitted_date).toLocaleDateString() : "-"}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500 mb-1">Events Reported:</p>
                <ul className="text-gray-700 text-sm list-disc pl-5">
                  {report.birth_reported && <li>Birth</li>}
                  {report.death_reported && <li>Death</li>}
                  {report.purchase_reported && <li>Purchase</li>}
                  {report.sale_reported && <li>Sale</li>}
                  {report.company_change_reported && <li>Company Change</li>}
                  {!(report.birth_reported || report.death_reported || report.purchase_reported || report.sale_reported || report.company_change_reported) && <li>None</li>}
                </ul>
              </div>
              <div className="flex gap-3">
                {(filter === 'all' || filter === 'pending') && report.validation_status === 'Pending' && (
                  <button
                    onClick={() => handleApprove(report._id)}
                    disabled={processingReports.has(report._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${processingReports.has(report._id)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {processingReports.has(report._id) ? 'Processing...' : 'Approve'}
                  </button>
                )}

                {(filter === 'all' || filter === 'pending') && report.validation_status === 'Pending' && (
                  <button
                    onClick={() => handleReject(report._id)}
                    disabled={processingReports.has(report._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${processingReports.has(report._id)
                      ? 'bg-red-500 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    <XCircleIcon className="h-5 w-5" />
                    {processingReports.has(report._id) ? 'Processing...' : 'Reject'}
                  </button>
                )}

                {report.validation_status === 'Approved' && (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Approved
                  </button>
                )}

                {report.validation_status === 'Rejected' && (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg cursor-not-allowed"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Rejected
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
