import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
export const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon
}) => {
  return <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-2">
        {isPositive ? <TrendingUp size={16} className="text-green-500 mr-1" /> : <TrendingDown size={16} className="text-red-500 mr-1" />}
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change} since last month
        </span>
      </div>
    </div>;
};
