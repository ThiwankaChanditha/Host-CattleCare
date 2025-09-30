import React from 'react';
import { CalendarClock } from 'lucide-react';
export const NotificationPanel = () => {
  const notifications = [{
    id: 1,
    title: 'New Farm Registration',
    description: 'Farm #2458 has been registered by LDI in Kandy region',
    time: '10 minutes ago',
    type: 'registration',
    read: false
  }, {
    id: 2,
    title: 'Calving Report',
    description: 'Farmer reported 2 new calves at Farm #1245',
    time: '45 minutes ago',
    type: 'calving',
    read: false
  }, {
    id: 3,
    title: 'Validation Required',
    description: 'Monthly data update from Farm #0856 needs validation',
    time: '2 hours ago',
    type: 'validation',
    read: true
  }, {
    id: 4,
    title: 'System Update',
    description: 'System maintenance scheduled for tonight at 2:00 AM',
    time: '5 hours ago',
    type: 'system',
    read: true
  }];
 const getIcon = (type) => {
    switch (type) {
      case 'registration':
        return <div size={18} className="text-blue-500" />;
      case 'calving':
        return <div size={18} className="text-green-500" />;
      case 'validation':
        return <CalendarClock size={18} className="text-amber-500" />;
      case 'system':
        return <div size={18} className="text-purple-500" />;
      default:
        return <div size={18} className="text-gray-500" />;
    }
  };
  return <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {notifications.map(notification => <div key={notification.id} className={`p-3 rounded-md ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} flex`}>
          <div className="mr-3 mt-0.5">{getIcon(notification.type)}</div>
          <div>
            <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-800' : 'text-blue-800'}`}>
              {notification.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {notification.description}
            </p>
            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
          </div>
        </div>)}
      <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800">
        View All Notifications
      </button>
    </div>;
};