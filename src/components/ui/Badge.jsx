import React from 'react';

export const Badge = ({ children, variant = 'light', className = '', icon }) => {
    const variants = {
        light: 'bg-[#f8f9fa] border border-[#dee2e6] text-[#212529]',
        successLight: 'bg-[#00b89426] text-[#00b894] border border-[#00b8944d]',
        dangerLight: 'bg-[#ff767526] text-[#ff7675] border border-[#ff76754d]',
        infoLight: 'bg-[#0dcaf026] text-[#0dcaf0] border border-[#0dcaf04d]',
        warningLight: 'bg-[#fdcb6e26] text-[#fdcb6e] border border-[#fdcb6e4d]',
        secondary: 'bg-[#6c757d26] text-[#6c757d] border border-[#6c757d4d]',
        success: 'bg-[#198754] text-white',
        danger: 'bg-[#dc3545] text-white',
    };

    const colorClass = variants[variant] || variants.light;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wide font-sans ${colorClass} ${className}`}>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
};
