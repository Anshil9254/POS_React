import React from 'react';

export const Avatar = ({ initials, variant = 'primary', size = 'sm' }) => {
    const variants = {
        primary: 'bg-[#cfe2ff] text-[#084298]',
        info: 'bg-[#cff4fc] text-[#055160]',
        success: 'bg-[#d1e7dd] text-[#0f5132]',
        warning: 'bg-[#fff3cd] text-[#664d03]',
        danger: 'bg-[#f8d7da] text-[#842029]',
        dark: 'bg-[#ced4da] text-[#212529]',
    };

    const sizes = {
        sm: 'w-10 h-10 text-lg',
        md: 'w-12 h-12 text-xl',
        lg: 'w-16 h-16 text-2xl',
    };

    const colorClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.sm;

    return (
        <div className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold font-sans ${colorClass} ${sizeClass}`}>
            {initials?.substring(0, 1)?.toUpperCase()}
        </div>
    );
};
