import React, { useState } from "react";

export default function Modal({ title, content, onConfirm, confirmText, declineText, type }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                Add data
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray bg-opacity-50 backdrop-blur-md z-50">
                    <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:bg-gray-300 rounded-lg text-sm w-6 h-6 flex justify-center items-center"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="text-gray-600 mt-3">{content}</div>
                        {type === 'number' && (
                            <div className="text-gray-600 mt-3">
                                <input
                                    type="text"
                                    name="input_value"
                                    id="input_value"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder="Enter a number"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    setIsOpen(false);
                                }}
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                            >
                                {confirmText || "Confirm"}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-blue-700"
                            >
                                {declineText || "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}