import React from 'react';
import { XIcon } from 'lucide-react'; // Assuming you have lucide-react for icons

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, confirmButtonClass = 'bg-red-600 hover:bg-red-700', cancelButtonClass = 'border-gray-300 text-gray-700 hover:bg-gray-100' }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
            onClick={onClose} // Allows clicking outside to close
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto transform scale-95 animate-scale-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${cancelButtonClass}`}
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors duration-200 ${confirmButtonClass}`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}