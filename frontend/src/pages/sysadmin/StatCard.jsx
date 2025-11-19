import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
export const StatCard = ({
  title,
  value,
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
  </div>;
};
