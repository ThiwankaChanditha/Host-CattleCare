import React from 'react';

const Card = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
            {children}
        </div>
    );
};

export default Card;
