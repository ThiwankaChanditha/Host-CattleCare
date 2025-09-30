import React from 'react';
import { ChevronDown } from 'lucide-react';
export const RegionSelector = ({
  selectedRegion,
  setSelectedRegion
}) => {
  const regions = ['All Regions', 'Western Province', 'Central Province', 'Southern Province', 'Northern Province', 'Eastern Province', 'North Western Province', 'North Central Province', 'Uva Province', 'Sabaragamuwa Province'];
  return <div className="relative inline-block">
      <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
        {regions.map(region => <option key={region} value={region}>
            {region}
          </option>)}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>;
};
