import React from "react";
import { BellIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Urgent Validation Required",
      message: "New calving reported at Green Valley Farm needs immediate validation",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "success",
      title: "Monthly Update Completed",
      message: "Highland Dairy has submitted their monthly production data",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      type: "info",
      title: "System Update",
      message: "New features will be added to the dashboard next week",
      time: "2 hours ago",
      read: true
    }
  ];

  // Removed type annotation 'type: string' for JSX compatibility
  const getIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircleIcon className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "info":
        return <InfoIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {/* The 'Mark all as read' button is purely presentational in this self-contained version,
            as there's no state management to actually mark them as read. */}
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`p-6 flex gap-4 ${
              index !== notifications.length - 1 ? "border-b border-gray-100" : ""
            } ${!notification.read ? "bg-gray-50" : ""}`}
          >
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">
                  {notification.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {notification.time}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}