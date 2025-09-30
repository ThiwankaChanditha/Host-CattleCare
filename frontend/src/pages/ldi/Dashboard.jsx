import React, { useState } from "react";
import { CalendarIcon, BookOpenIcon } from "lucide-react";
import StatsOverview from "./components/StatsOverview";
import PendingValidations from "./components/PendingValidations";
import RecentRegistrations from "./components/RecentRegistrations";
import AddFarmerModal from "../../components/AddFarmerModal";
import MemoModal from "../../components/MemoModal";

export default function Dashboard() {
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);

  const handleAddFarmerSuccess = (newFarmer) => {
    console.log("New farmer added:", newFarmer);
    // Here you can add logic to refresh the dashboard data
  };

  const handleMemoUpdate = () => {
    // Refresh dashboard data if needed
    console.log("Memo updated");
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, John!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Here's what's happening with your livestock development activities today.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <button
              onClick={() => setIsMemoModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Open Memo Book"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span className="text-sm">Memo</span>
            </button>
          </div>
        </div>
      </div>



      {/* Main Stats */}
      <StatsOverview />
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PendingValidations />
        <RecentRegistrations />
      </div>
      
      <AddFarmerModal
        isOpen={isAddFarmerModalOpen}
        onClose={() => setIsAddFarmerModalOpen(false)}
        onAddSuccess={handleAddFarmerSuccess}
      />
      
      <MemoModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        onMemoUpdate={handleMemoUpdate}
      />
    </div>
  );
}
