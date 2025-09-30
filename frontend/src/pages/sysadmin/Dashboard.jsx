import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from './StatCard';
import { RegionSelector } from './RegionSelector';
import { Users, Milk, Bell, CalendarClock, Shell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [chartData, setChartData] = useState([]);
  const [totalFarms, setTotalFarms] = useState(0);
  const [totalMilk, setTotalMilk] = useState(0);
  const [totalCattle, setTotalCattle] = useState(0);
  const [farmTypeData, setFarmTypeData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/farms/distribution-by-province');
        const totalFarmsResponse = await axios.get('http://localhost:5000/api/admin/farms/total');
        const totalMilkResponse = await axios.get('http://localhost:5000/api/admin/monthly_milk_production/total');
        const totalCattleResponse = await axios.get('http://localhost:5000/api/admin/animals/total');

        if (response.data.success) {
          const combinedData = response.data.data;
          setChartData(combinedData);
        }

        if (totalFarmsResponse.data.success) {
          setTotalFarms(totalFarmsResponse.data.totalFarms);
        }
        if (totalMilkResponse.data.success) {
          setTotalMilk(totalMilkResponse.data.totalMilk);
        }
        if (totalCattleResponse.data.success) {
          setTotalCattle(totalCattleResponse.data.totalCattle);
        }
      } catch (error) {
        console.error('Error fetching farm or milk production data:', error);
      }
    };

    fetchChartData();
  }, []);

  useEffect(() => {
    const fetchFarmTypeData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/farms/farm-type-distribution');
        if (response.data && response.data.success) {
          setFarmTypeData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching farm type distribution data:', error);
      }
    };
    fetchFarmTypeData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">System Dashboard</h1>
        <RegionSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Farms" value={totalFarms.toLocaleString()} change="+11%" isPositive={true} icon={<Users className="text-blue-500" />} />
        <StatCard title="Milk Production" value={`${totalMilk.toLocaleString()} L`} change="+5.2%" isPositive={true} icon={<Milk className="text-green-500" />} />
        <StatCard title="Cattle Population" value={totalCattle.toLocaleString()} change="+3.7%" isPositive={true} icon={<Shell className="text-amber-700" />} />
        <StatCard title="Pending Validations" value="38" change="-8%" isPositive={false} icon={<CalendarClock className="text-red-500" />} />
      </div>

      {/* Farm Distribution & Production - Full Width */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-lg font-medium text-gray-800">Farm Distribution & Production</h2>

        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="farms" name="Number of Farms" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="milk" name="Milk Production (L)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Farm Type Distribution and Recent Notifications - Same Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Farm Type Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={farmTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {farmTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Recent Notifications</h2>
            <Bell size={18} />
          </div>
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;