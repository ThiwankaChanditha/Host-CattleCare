import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VSSidebar from "./pages/vs/components/Sidebar";
import LDISidebar from "./pages/ldi/components/Sidebar";
import SysAdminSidebar from './pages/sysadmin/Sidebar';
import LDIFarmDetails from "./pages/ldi/FarmDetails";

import Login from "./pages/login/Login";

import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerNotification from "./pages/farmer/Notification";
import FarmerProfile from "./pages/farmer/Profile";
import FarmerAnalytics from "./pages/farmer/Analytics";
import FarmerWorkshop from "./pages/farmer/Workshop";
import FarmerForum from "./pages/farmer/Forum";
import EditProfile from '../src/components/EditProfile';
import Achievements from '../src/components/Achievements';

import ErrorBoundary from './components/ErrorBoundary';

import VSDashboard from "./pages/vs/Dashboard";
import VSRecords from "./pages/vs/AnimalRecords";
import VSAppointments from "./pages/vs/Appointments";
import VSReports from "./pages/vs/Reports";
import VSSettings from "./pages/vs/Settings";
import AnimalDetails from "./pages/vs/AnimalDetail";
import AnimalHealthHistoryPage from "./pages/vs/AnimalHealthHistoryPage";

import LDIDashboard from "./pages/ldi/Dashboard";
import LDIFarmers from "./pages/ldi/Farmers";
import LDIValidations from "./pages/ldi/Validations";
import LDIPortfolio from "./pages/ldi/Portfolio";
import LDINotifications from "./pages/ldi/Notifications";
import LDIReports from "./pages/ldi/Reports";
import LDISettings from "./pages/ldi/Settings";
import LDIFarmerDetails from "./pages/ldi/FarmerDetails";

import SysAdminDashboard from "./pages/sysadmin/Dashboard";
import SysAdminUsers from "./pages/sysadmin/UserManagement";
import SysAdminAdministrative from './pages/sysadmin/AdministrativeDetails';
import SysAdminAddUser from './pages/sysadmin/AddUser';
import SysAdminEditUser from './pages/sysadmin/EditUser';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main
          className={`flex-1 px-4 py-6 lg:p-6 bg-gray-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

const VSLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex min-h-screen">
        <VSSidebar />
         <main
          className={`flex-1 p-6 bg-gray-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
            }`}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

const LDILayout = ({ children }) => (
  <div className="flex min-h-screen">
    <LDISidebar />
    <main className="flex-1 p-6 bg-gray-50 md:ml-0 pt-28 md:pt-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

const SysAdminLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <SysAdminSidebar />
    
    <main className="flex-1 p-6 bg-gray-50 md:ml-0 pt-28 md:pt-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/farmer/dashboard" element={<Layout><FarmerDashboard /></Layout>} />
        <Route path="/farmer/notifications" element={<Layout><FarmerNotification /></Layout>} />
        <Route path="/farmer/profile" element={<Layout><ErrorBoundary><FarmerProfile /></ErrorBoundary></Layout>} />
        <Route path="/farmer/profile/edit" element={<Layout><EditProfile /></Layout>} />
        <Route path="/farmer/profile/achievements" element={<Layout><Achievements /></Layout>} />
        <Route path="/farmer/analytics" element={<Layout><ErrorBoundary><FarmerAnalytics /></ErrorBoundary></Layout>} />
        <Route path="/farmer/workshop" element={<Layout><FarmerWorkshop /></Layout>} />
        <Route path="/farmer/forum" element={<Layout><ErrorBoundary><FarmerForum /></ErrorBoundary></Layout>} />

        <Route path="/vs/dashboard" element={<VSLayout><VSDashboard /></VSLayout>} />
        <Route path="/vs/animals" element={<VSLayout><VSRecords /></VSLayout>} />
        <Route path="/vs/appointments" element={<VSLayout><VSAppointments /></VSLayout>} />
        <Route path="/vs/reports" element={<VSLayout><VSReports /></VSLayout>} />
        <Route path="/vs/settings" element={<VSLayout><VSSettings /></VSLayout>} />
        <Route path="/vs/animals/:id" element={<VSLayout><AnimalDetails /></VSLayout>} />
        <Route path="/vs/animals/:id/*" element={<VSLayout><AnimalDetails /></VSLayout>} />
        <Route path="/vs/animals/:id/health-history" element={<VSLayout><AnimalHealthHistoryPage /></VSLayout>} />

        <Route path="/ldi/dashboard" element={<LDILayout><LDIDashboard /></LDILayout>} />
        <Route path="/ldi/farmers" element={<LDILayout><LDIFarmers /></LDILayout>} />
        <Route path="/ldi/validations" element={<LDILayout><LDIValidations /></LDILayout>} />
        <Route path="/ldi/portfolio" element={<LDILayout><LDIPortfolio /></LDILayout>} />
        <Route path="/ldi/notifications" element={<LDILayout><LDINotifications /></LDILayout>} />
        <Route path="/ldi/reports" element={<LDILayout><LDIReports /></LDILayout>} />
        <Route path="/ldi/settings" element={<LDILayout><LDISettings /></LDILayout>} />
        <Route path="/ldi/farmdetails/:id" element={<LDILayout><LDIFarmDetails /></LDILayout>} />
        <Route path="/ldi/farmerdetails/:id" element={<LDILayout><LDIFarmerDetails /></LDILayout>} />

        <Route path="/sysadmin/dashboard" element={<SysAdminLayout><SysAdminDashboard /></SysAdminLayout>} />
        <Route path="/sysadmin/users" element={<SysAdminLayout><SysAdminUsers /></SysAdminLayout>} />
        <Route path="/sysadmin/administrative-details" element={<SysAdminLayout><SysAdminAdministrative /></SysAdminLayout>} />
        <Route path="/sysadmin/add-user" element={<SysAdminLayout><SysAdminAddUser /></SysAdminLayout>} />
        <Route path="/sysadmin/edit-user/:id" element={<SysAdminLayout><SysAdminEditUser editMode={true} /></SysAdminLayout>} />

      </Routes>
    </Router>
  );
};

export default App;
