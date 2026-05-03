import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] overflow-hidden transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};

export const CardBody = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`${noPadding ? 'p-0' : 'p-6'} ${className}`}>
            {children}
        </div>
    );
};
