import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HeartIcon, TrendingUpIcon, UsersIcon, CalendarIcon, TargetIcon } from 'lucide-react';

const COLORS = {
  ai: ['#00C49F', '#FF8042', '#FFBB28', '#8884D8', '#FF6B6B', '#4ECDC4'],
  status: ['#00C49F', '#FF8042', '#FFBB28', '#8884D8']
};

export default function AIAnalytics({ aiData }) {
  // Calculate AI success rate over time
  const calculateAISuccessRate = () => {
    const monthlySuccess = {};
    
    aiData.forEach(record => {
      if (record.ai_date) {
        const month = new Date(record.ai_date).toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlySuccess[month]) {
          monthlySuccess[month] = { total: 0, pregnant: 0, notPregnant: 0, aborted: 0 };
        }
        
        monthlySuccess[month].total++;
        if (record.pregnancy_status === 'Pregnant') {
          monthlySuccess[month].pregnant++;
        } else if (record.pregnancy_status === 'Not Pregnant') {
          monthlySuccess[month].notPregnant++;
        } else if (record.pregnancy_status === 'Aborted') {
          monthlySuccess[month].aborted++;
        }
      }
    });

    return Object.entries(monthlySuccess)
      .map(([month, data]) => ({ 
        month, 
        successRate: data.total > 0 ? (data.pregnant / data.total) * 100 : 0,
        total: data.total,
        pregnant: data.pregnant,
        notPregnant: data.notPregnant,
        aborted: data.aborted
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  // Calculate technician performance
  const calculateTechnicianPerformance = () => {
    const technicianData = {};
    
    aiData.forEach(record => {
      const technician = record.technician_name || 'Unknown';
      if (!technicianData[technician]) {
        technicianData[technician] = { total: 0, pregnant: 0, notPregnant: 0, aborted: 0 };
      }
      
      technicianData[technician].total++;
      if (record.pregnancy_status === 'Pregnant') {
        technicianData[technician].pregnant++;
      } else if (record.pregnancy_status === 'Not Pregnant') {
        technicianData[technician].notPregnant++;
      } else if (record.pregnancy_status === 'Aborted') {
        technicianData[technician].aborted++;
      }
    });

    return Object.entries(technicianData)
      .map(([technician, data]) => ({
        technician,
        successRate: data.total > 0 ? (data.pregnant / data.total) * 100 : 0,
        total: data.total,
        pregnant: data.pregnant,
        notPregnant: data.notPregnant,
        aborted: data.aborted
      }))
      .sort((a, b) => b.successRate - a.successRate);
  };

  // Calculate breed analysis
  const calculateBreedAnalysis = () => {
    const breedData = {};
    
    aiData.forEach(record => {
      const breed = record.bull_breed || 'Unknown';
      if (!breedData[breed]) {
        breedData[breed] = { total: 0, pregnant: 0, notPregnant: 0, aborted: 0 };
      }
      
      breedData[breed].total++;
      if (record.pregnancy_status === 'Pregnant') {
        breedData[breed].pregnant++;
      } else if (record.pregnancy_status === 'Not Pregnant') {
        breedData[breed].notPregnant++;
      } else if (record.pregnancy_status === 'Aborted') {
        breedData[breed].aborted++;
      }
    });

    return Object.entries(breedData)
      .map(([breed, data]) => ({
        breed,
        successRate: data.total > 0 ? (data.pregnant / data.total) * 100 : 0,
        total: data.total,
        pregnant: data.pregnant,
        notPregnant: data.notPregnant,
        aborted: data.aborted
      }))
      .sort((a, b) => b.successRate - a.successRate);
  };

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (aiData.length === 0) return null;

    const totalRecords = aiData.length;
    const pregnantCount = aiData.filter(record => record.pregnancy_status === 'Pregnant').length;
    const notPregnantCount = aiData.filter(record => record.pregnancy_status === 'Not Pregnant').length;
    const abortedCount = aiData.filter(record => record.pregnancy_status === 'Aborted').length;
    const unknownCount = totalRecords - pregnantCount - notPregnantCount - abortedCount;

    const successRate = (pregnantCount / totalRecords) * 100;
    const avgRecordsPerMonth = totalRecords / Math.max(1, new Set(aiData.map(r => 
      new Date(r.ai_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    )).size);

    return {
      totalRecords,
      pregnantCount,
      notPregnantCount,
      abortedCount,
      unknownCount,
      successRate,
      avgRecordsPerMonth
    };
  };

  const aiSuccessRate = calculateAISuccessRate();
  const technicianPerformance = calculateTechnicianPerformance();
  const breedAnalysis = calculateBreedAnalysis();
  const overallStats = calculateOverallStats();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (aiData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <HeartIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">AI Records Analytics</h3>
        </div>
        <div className="text-center py-8">
          <HeartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No AI records available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HeartIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">AI Records Analytics</h3>
        </div>
        <div className="text-sm text-gray-500">
          {aiData.length} AI records analyzed
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <HeartIcon className="w-8 h-8 text-pink-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total AI Records</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalRecords}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <TargetIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Pregnant Animals</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.pregnantCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Avg per Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.avgRecordsPerMonth.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Trends */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Success Rate Trends</h4>
          </div>
          
          {aiSuccessRate.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aiSuccessRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUpIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No trend data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Technician Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Technician Performance</h4>
          </div>
          
          {technicianPerformance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicianPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="technician" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <UsersIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No technician data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breed Analysis */}
      {breedAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TargetIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Breed Performance Analysis</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breedAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="breed" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#FF6B6B" name="Success Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Pregnancy Status Distribution</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pregnant</span>
                <span className="font-semibold text-green-600">{overallStats.pregnantCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Not Pregnant</span>
                <span className="font-semibold text-red-600">{overallStats.notPregnantCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aborted</span>
                <span className="font-semibold text-orange-600">{overallStats.abortedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unknown</span>
                <span className="font-semibold text-gray-600">{overallStats.unknownCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Success Rate Analysis</p>
            <div className="mt-4">
              <div className="text-3xl font-bold text-green-600">
                {overallStats.successRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Overall pregnancy success rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Activity Metrics</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Records</span>
                <span className="font-semibold text-blue-600">{overallStats.totalRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg per Month</span>
                <span className="font-semibold text-purple-600">
                  {overallStats.avgRecordsPerMonth.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 