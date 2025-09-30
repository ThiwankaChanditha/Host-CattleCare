import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { HomeIcon, HeartIcon, DropletsIcon, TrendingUpIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import MilkAnalytics from './MilkAnalytics';
import AIAnalytics from './AIAnalytics';
import FarmReportGenerator from './FarmReportGenerator';

const COLORS = {
  herd: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  ai: ['#00C49F', '#FF8042', '#FFBB28', '#8884D8'],
  milk: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  breed: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
};

export default function FarmAnalytics({ animals, aiData, milkData, farm }) {
  // Calculate herd composition
  const calculateHerdComposition = () => {
    const composition = {
      'Milking Cows': 0,
      'Dry Cows': 0,
      'Pregnant Heifers': 0,
      'Non-Pregnant Heifers': 0,
      'Bulls': 0,
      'Calves': 0
    };

    animals.forEach(animal => {
      const category = animal.category?.toLowerCase() || '';
      const gender = animal.gender?.toLowerCase() || '';
      
      if (category.includes('cow')) {
        if (category.includes('dry') || category.includes('non-milking')) {
          composition['Dry Cows']++;
        } else {
          composition['Milking Cows']++;
        }
      } else if (category.includes('heifer')) {
        // Check if pregnant based on AI records
        const isPregnant = aiData.some(ai => 
          ai.animal_tag === animal.animal_tag && 
          ai.pregnancy_status === 'Pregnant'
        );
        if (isPregnant) {
          composition['Pregnant Heifers']++;
        } else {
          composition['Non-Pregnant Heifers']++;
        }
      } else if (category.includes('bull')) {
        composition['Bulls']++;
      } else if (category.includes('calf')) {
        composition['Calves']++;
      }
    });

    return Object.entries(composition)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // Calculate AI records composition
  const calculateAIComposition = () => {
    const composition = {
      'Pregnant': 0,
      'Not Pregnant': 0,
      'Aborted': 0,
      'Unknown': 0
    };

    aiData.forEach(record => {
      const status = record.pregnancy_status || 'Unknown';
      if (composition.hasOwnProperty(status)) {
        composition[status]++;
      } else {
        composition['Unknown']++;
      }
    });

    return Object.entries(composition)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // Calculate breed distribution
  const calculateBreedDistribution = () => {
    const breeds = {};
    
    animals.forEach(animal => {
      const breed = animal.breed || 'Unknown';
      breeds[breed] = (breeds[breed] || 0) + 1;
    });

    return Object.entries(breeds)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate milk production trends
  const calculateMilkTrends = () => {
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



  // Calculate productivity metrics
  const calculateProductivityMetrics = () => {
    const totalAnimals = animals.length;
    const milkingCows = animals.filter(animal => 
      animal.category?.toLowerCase().includes('cow') && 
      !animal.category?.toLowerCase().includes('dry')
    ).length;
    
    const totalMilkProduction = milkData.reduce((sum, record) => 
      sum + (record.total_milk_production || 0), 0
    );
    
    const avgMilkPerCow = milkingCows > 0 ? totalMilkProduction / milkingCows : 0;
    const pregnancyRate = aiData.length > 0 ? 
      (aiData.filter(ai => ai.pregnancy_status === 'Pregnant').length / aiData.length) * 100 : 0;

    return {
      totalAnimals,
      milkingCows,
      totalMilkProduction,
      avgMilkPerCow,
      pregnancyRate
    };
  };

  const herdComposition = calculateHerdComposition();
  const aiComposition = calculateAIComposition();
  const breedDistribution = calculateBreedDistribution();
  const milkTrends = calculateMilkTrends();
  const productivityMetrics = calculateProductivityMetrics();

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

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <HomeIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Animals</p>
              <p className="text-2xl font-bold text-gray-900">{productivityMetrics.totalAnimals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <DropletsIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Milking Cows</p>
              <p className="text-2xl font-bold text-gray-900">{productivityMetrics.milkingCows}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <HeartIcon className="w-8 h-8 text-pink-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">AI Records</p>
              <p className="text-2xl font-bold text-gray-900">{aiData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <TrendingUpIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.totalMilkProduction.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityMetrics.pregnancyRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Herd Composition Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Herd Composition</h4>
          </div>
          
          {herdComposition.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={herdComposition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {herdComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.herd[index % COLORS.herd.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <HomeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No herd data available</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {herdComposition.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS.herd[index % COLORS.herd.length] }}
                />
                <span className="text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Records Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <HeartIcon className="w-5 h-5 text-pink-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">AI Records Status</h4>
          </div>
          
          {aiComposition.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiComposition}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {aiComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.ai[index % COLORS.ai.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <HeartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No AI records available</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {aiComposition.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS.ai[index % COLORS.ai.length] }}
                />
                <span className="text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breed Distribution */}
      {breedDistribution.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Breed Distribution</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breedDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Milk Analytics */}
      <MilkAnalytics milkData={milkData} />

      {/* Detailed AI Analytics */}
      <AIAnalytics aiData={aiData} />

      {/* Productivity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <DropletsIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Average Milk per Cow</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {productivityMetrics.avgMilkPerCow.toFixed(0)} L
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {productivityMetrics.milkingCows} milking cows
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <HeartIcon className="w-6 h-6 text-pink-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Pregnancy Success Rate</h4>
          </div>
          <p className="text-3xl font-bold text-pink-600">
            {productivityMetrics.pregnancyRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {aiData.length} AI records
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="w-6 h-6 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Total Milk Production</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {productivityMetrics.totalMilkProduction.toLocaleString()} L
          </p>
          <p className="text-sm text-gray-500 mt-2">
            From {milkData.length} monthly reports
          </p>
        </div>
      </div>
    </div>
  );
} 