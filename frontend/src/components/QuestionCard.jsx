import React from "react";
import Modal from "../components/Modal";
import 'flowbite';

export default function QuestionCard({ question }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col justify-between items-center text-center space-y-5 w-full h-full">

            {/* Icon Container */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl shadow-md">
                {question.icon}
            </div>

            {/* Question Text */}
            <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                    {question.text}
                </h3>
                <p className="text-sm text-gray-500">
                    {question.type === "boolean"
                        ? "Yes or No"
                        : question.type === "number"
                            ? "Enter a number"
                            : ""}
                </p>
            </div>

            {/* Modal Trigger Button */}
            <Modal
                title={question.text}
                onConfirm={() => alert("Data Submitted!")}
                confirmText="Submit"
                declineText="Cancel"
                type={question.type}
            >
                <button className="inline-flex items-center px-5 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300">
                    Answer Question
                    <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </Modal>
        </div>
    );
}
