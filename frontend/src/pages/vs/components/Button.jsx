import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    type = 'button',
    onClick,
    disabled = false,
    className = '',
}) => {
    const baseClasses =
        'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            type={type}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;


