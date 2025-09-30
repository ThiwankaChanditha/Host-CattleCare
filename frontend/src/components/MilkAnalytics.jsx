import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { DropletsIcon, TrendingUpIcon, CalendarIcon, BarChart3Icon } from 'lucide-react';

const COLORS = {
  milk: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  months: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80', '#FFD54F', '#81C784', '#64B5F6', '#BA68C8', '#FFB74D']
};

export default function MilkAnalytics({ milkData }) {
  // Calculate monthly milk production
  const calculateMonthlyProduction = () => {
    const monthlyData = {};
    
    milkData.forEach(record => {
      if (record.report_month) {
        const month = new Date(record.report_month).toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + (record.total_milk_production || 0);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, production]) => ({ month, production }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  // Calculate seasonal trends
  const calculateSeasonalTrends = () => {
    const seasonalData = {
      'Spring': 0,
      'Summer': 0,
      'Autumn': 0,
      'Winter': 0
    };

    milkData.forEach(record => {
      if (record.report_month) {
        const month = new Date(record.report_month).getMonth();
        const production = record.total_milk_production || 0;
        
        if (month >= 2 && month <= 4) seasonalData['Spring'] += production;
        else if (month >= 5 && month <= 7) seasonalData['Summer'] += production;
        else if (month >= 8 && month <= 10) seasonalData['Autumn'] += production;
        else seasonalData['Winter'] += production;
      }
    });

    return Object.entries(seasonalData)
      .map(([season, production]) => ({ season, production }))
      .filter(item => item.production > 0);
  };

  // Calculate productivity metrics
  const calculateProductivityMetrics = () => {
    if (milkData.length === 0) return null;

    const totalProduction = milkData.reduce((sum, record) => 
      sum + (record.total_milk_production || 0), 0
    );
    
    const avgProduction = totalProduction / milkData.length;
    const maxProduction = Math.max(...milkData.map(record => record.total_milk_production || 0));
    const minProduction = Math.min(...milkData.map(record => record.total_milk_production || 0));
    
    const recentData = milkData
      .sort((a, b) => new Date(b.report_month) - new Date(a.report_month))
      .slice(0, 3);
    
    const recentAvg = recentData.length > 0 ? 
      recentData.reduce((sum, record) => sum + (record.total_milk_production || 0), 0) / recentData.length : 0;

    return {
      totalProduction,
      avgProduction,
      maxProduction,
      minProduction,
      recentAvg,
      totalReports: milkData.length
    };
  };

  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (milkData.length < 2) return null;

    const sortedData = milkData
      .sort((a, b) => new Date(a.report_month) - new Date(b.report_month));
    
    const firstProduction = sortedData[0].total_milk_production || 0;
    const lastProduction = sortedData[sortedData.length - 1].total_milk_production || 0;
    
    const growthRate = firstProduction > 0 ? 
      ((lastProduction - firstProduction) / firstProduction) * 100 : 0;

    return {
      growthRate,
      firstProduction,
      lastProduction
    };
  };

  const monthlyProduction = calculateMonthlyProduction();
  const seasonalTrends = calculateSeasonalTrends();
  const productivityMetrics = calculateProductivityMetrics();
  const growthRate = calculateGrowthRate();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} L
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (milkData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <DropletsIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Milk Production Analytics</h3>
        </div>
        <div className="text-center py-8">
          <DropletsIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No milk production data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DropletsIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Milk Production Analytics</h3>
        </div>
        <div className="text-sm text-gray-500">
          {milkData.length} monthly reports analyzed
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <DropletsIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.totalProduction.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <TrendingUpIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Average per Report</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.avgProduction.toFixed(0)} L
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <BarChart3Icon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.maxProduction.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.recentAvg.toFixed(0)} L
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Production Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Monthly Production Trend</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#0088FE" 
                  fill="#0088FE"
                  fillOpacity={0.3}
                  name="Production (L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Seasonal Distribution</h4>
          </div>
          
          {seasonalTrends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={seasonalTrends}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ season, percent }) => `${season} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="production"
                  >
                    {seasonalTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.milk[index % COLORS.milk.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No seasonal data available</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {seasonalTrends.map((item, index) => (
              <div key={item.season} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS.milk[index % COLORS.milk.length] }}
                />
                <span className="text-gray-600">{item.season}: {item.production.toLocaleString()} L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Analysis */}
      {growthRate && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Production Growth Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Growth Rate</p>
              <p className={`text-2xl font-bold ${growthRate.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate.growthRate >= 0 ? '+' : ''}{growthRate.growthRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Initial Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {growthRate.firstProduction.toLocaleString()} L
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Latest Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {growthRate.lastProduction.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Production Range */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <BarChart3Icon className="w-5 h-5 text-purple-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-800">Production Range Analysis</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600">Peak Production</p>
            <p className="text-2xl font-bold text-green-700">
              {productivityMetrics.maxProduction.toLocaleString()} L
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-600">Average Production</p>
              <p className="text-2xl font-bold text-blue-700">
                {productivityMetrics.avgProduction.toFixed(0)} L
              </p>
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-600">Minimum Production</p>
            <p className="text-2xl font-bold text-orange-700">
              {productivityMetrics.minProduction.toLocaleString()} L
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 