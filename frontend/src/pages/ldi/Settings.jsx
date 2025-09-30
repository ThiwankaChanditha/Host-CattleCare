import React from "react";
import { BellIcon, UserIcon, ShieldIcon, GlobeIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input type="text" id="fullName" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="John Smith" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input type="email" id="email" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="john.smith@example.com" />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input type="tel" id="phoneNumber" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="+94 77 123 4567" />
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              {/* Added id for accessibility */}
              <input type="text" id="district" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="Melsiripura" disabled />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">New Validations</p>
                  <p className="text-sm text-gray-500">
                    Get notified when new validations are required
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                {/* Added id for accessibility, and it's good practice */}
                <input type="checkbox" id="newValidationsToggle" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Monthly Updates</p>
                  <p className="text-sm text-gray-500">
                    Receive monthly summary reports
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                {/* Added id for accessibility */}
                <input type="checkbox" id="monthlyUpdatesToggle" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}