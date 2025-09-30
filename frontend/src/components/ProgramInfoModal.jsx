import React from 'react';
import { XIcon, CalendarIcon, MapPinIcon, UsersIcon, UserIcon } from 'lucide-react';

export default function ProgramInfoModal({ isOpen, onClose, program }) {
  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Program Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.program_name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {program.program_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Program Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {program.program_date ? new Date(program.program_date).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {program.location || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <UsersIcon className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Participants</p>
                <p className="text-sm font-medium text-gray-900">
                  {program.participants_count || 0} participants
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Conducted By</p>
                <p className="text-sm font-medium text-gray-900">
                  {program.conducted_by?.full_name || program.conducted_by?.username || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-900">
              {program.description || 'No description available'}
            </p>
          </div>

          <div className="text-xs text-gray-400 pt-2 border-t">
            Created: {program.created_at ? new Date(program.created_at).toLocaleString() : 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
} 