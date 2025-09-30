import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import Button from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto  backdrop-blur-sm flex items-center justify-center">
            <div
                ref={modalRef}
                className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                        type="button"
                        className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {title}
                        </h3>
                        <div className="mt-2">{children}</div>
                    </div>
                </div>
                {footer && (
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;