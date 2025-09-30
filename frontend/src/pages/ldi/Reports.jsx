import React, { useState, useEffect } from "react";
import { FileTextIcon, DownloadIcon, BarChart3Icon, PieChartIcon, HomeIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ComprehensiveReportGenerator from "../../components/ComprehensiveReportGenerator";

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    farms: [],
    animals: [],
    milkData: [],
    aiData: []
  });
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastGeneratedReport, setLastGeneratedReport] = useState('');
  const [error, setError] = useState(null);

  const reports = [
    {
      id: "farm-production",
      title: "Monthly Farm Production",
      description: "Comprehensive report of all farm production data including milk production, AI records, and farm performance metrics",
      icon: BarChart3Icon,
      type: "Performance"
    },
    {
      id: "livestock-census",
      title: "Livestock Census",
      description: "Current statistics of all registered livestock with category-wise breakdown and farm distribution",
      icon: PieChartIcon,
      type: "Statistics"
    },
    {
      id: "validation-summary",
      title: "Validation Summary",
      description: "Monthly summary of all validations performed with farm-wise validation status",
      icon: FileTextIcon,
      type: "Activity"
    }
  ];

  // Fetch all data for reports
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch farms (this endpoint works correctly)
        const farmsResponse = await fetch('http://localhost:5000/api/ldi/farms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (farmsResponse.ok) {
          const farmsData = await farmsResponse.json();
          console.log('Farms data:', farmsData);
          setReportData(prev => ({ ...prev, farms: farmsData.data || [] }));
        }

        // Fetch animals for all farms - we need to fetch animals for each farm individually
        const farmsForAnimals = await fetch('http://localhost:5000/api/ldi/farms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (farmsForAnimals.ok) {
          const farmsData = await farmsForAnimals.json();
          const allAnimals = [];
          
          // Fetch animals for each farm
          for (const farm of farmsData.data) {
            const animalsResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${farm._id}/animals`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (animalsResponse.ok) {
              const animalsData = await animalsResponse.json();
              if (animalsData.data) {
                allAnimals.push(...animalsData.data);
              }
            }
          }
          
          console.log('All animals data:', allAnimals);
          setReportData(prev => ({ ...prev, animals: allAnimals }));
        }

        // Fetch milk production data for all farms
        const farmsForMilk = await fetch('http://localhost:5000/api/ldi/farms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (farmsForMilk.ok) {
          const farmsData = await farmsForMilk.json();
          const allMilkData = [];
          
          // Fetch milk data for each farm
          for (const farm of farmsData.data) {
            const milkResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${farm._id}/milk`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (milkResponse.ok) {
              const milkData = await milkResponse.json();
              if (milkData.data) {
                allMilkData.push(...milkData.data);
              }
            }
          }
          
          console.log('All milk data:', allMilkData);
          setReportData(prev => ({ ...prev, milkData: allMilkData }));
        }

        // Fetch AI data for all farms
        const farmsForAI = await fetch('http://localhost:5000/api/ldi/farms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (farmsForAI.ok) {
          const farmsData = await farmsForAI.json();
          const allAIData = [];
          
          // Fetch AI data for each farm
          for (const farm of farmsData.data) {
            const aiResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${farm._id}/ai`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.data) {
                allAIData.push(...aiData.data);
              }
            }
          }
          
          console.log('All AI data:', allAIData);
          setReportData(prev => ({ ...prev, aiData: allAIData }));
        }

      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReportData();
    }
  }, [token]);

  const handleReportGenerate = (reportType) => {
    setSelectedReportType(reportType);
    setLastGeneratedReport(reportType);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Reports Data</h3>
          <p className="text-gray-600">Fetching farms, animals, and production data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <FileTextIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Report generated successfully! Check your downloads folder.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-400 hover:text-green-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-2 text-gray-600">Generate comprehensive reports for all farms under your jurisdiction</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-green-800">
                  {reportData.farms.length} Farms
                </span>
              </div>
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-800">
                  {reportData.animals.length} Animals
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <HomeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Farms</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.farms.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.animals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Milk Records</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.milkData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-lg">
                <FileTextIcon className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Records</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.aiData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <report.icon className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {report.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">{report.description}</p>
              
              <div className="mt-auto">
                <ComprehensiveReportGenerator
                  reportType={report.id}
                  data={reportData}
                  onGenerate={() => handleReportGenerate(report.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom Report Generator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Custom Report Generator</h2>
            <p className="text-gray-600">Create custom reports with specific parameters and date ranges</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select 
                id="report-type" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                <option value="">Select Report Type</option>
                <option value="farm-production">Farm Production</option>
                <option value="livestock-census">Livestock Census</option>
                <option value="validation-summary">Validation Summary</option>
              </select>
            </div>
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select 
                id="date-range" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedReportType && (
                <span>Ready to generate {selectedReportType.replace('-', ' ')} report</span>
              )}
            </div>
            <ComprehensiveReportGenerator
              reportType={selectedReportType}
              data={reportData}
              onGenerate={() => handleReportGenerate(selectedReportType)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}