import React, { useEffect, useState } from "react";
import { MilkIcon, UsersIcon, ClipboardCheckIcon, BoxIcon } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

export default function StatsOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState([{
    title: "Total Farms",
    value: "0",
    change: "Loading...",
    icon: UsersIcon,
    color: "bg-blue-500"
  }, {
    title: "Total Milk Production",
    value: "0L",
    change: "Loading...",
    icon: MilkIcon,
    color: "bg-green-500"
  }, {
    title: "Total Animals",
    value: "0",
    change: "Loading...",
    icon: BoxIcon,
    color: "bg-purple-500"
  }, {
    title: "Pending Validations",
    value: "0",
    change: "Loading...",
    icon: ClipboardCheckIcon,
    color: "bg-yellow-500"
  }]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/ldi/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const dashboardData = response.data.data;
          const newStats = [{
            title: "Total Farms",
            value: dashboardData.stats.totalFarms.toString(),
            change: `${dashboardData.stats.activeFarms} active`,
            icon: UsersIcon,
            color: "bg-blue-500"
          }, {
            title: "Total Milk Production",
            value: `${dashboardData.stats.totalMilkProduction}L`,
            change: "From approved reports",
            icon: MilkIcon,
            color: "bg-green-500"
          }, {
            title: "Total Animals",
            value: dashboardData.stats.totalAnimals.toString(),
            change: "Active animals",
            icon: BoxIcon,
            color: "bg-purple-500"
          }, {
            title: "Pending Validations",
            value: dashboardData.stats.pendingValidations.toString(),
            change: dashboardData.stats.pendingValidations > 0 ? "Urgent" : "All clear",
            icon: ClipboardCheckIcon,
            color: "bg-yellow-500"
          }];
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {stats.map(stat => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group min-h-[140px] sm:min-h-0 relative overflow-hidden">
          {/* Subtle background pattern for mobile */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-full relative z-10">
            <div className="flex-1 mb-3 sm:mb-0">
              <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 leading-tight truncate">{stat.title}</p>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {stat.value}
              </h3>
              {/* Conditional styling for the 'change' text */}
              <div className="flex items-center space-x-1">
                <p className={`text-xs sm:text-sm font-medium leading-tight truncate ${
                  stat.change === "Urgent"
                    ? "text-red-500" // For "Urgent" status
                    : stat.change.startsWith('+')
                    ? "text-green-600" // For positive changes
                    : stat.change.startsWith('-')
                    ? "text-red-600" // For negative changes (if you add them later)
                    : "text-gray-600" // Default for other cases
                }`}>
                  {stat.change}
                </p>
                {stat.change !== "Urgent" && (
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    stat.change.startsWith('+') ? 'bg-green-500' : 
                    stat.change.startsWith('-') ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                )}
              </div>
            </div>
            <div className={`${stat.color} p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 self-end sm:self-auto shadow-sm flex-shrink-0`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}