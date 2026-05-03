import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    to,
    onClick,
    type = 'button',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none";

    const variants = {
        primary: "bg-gradient-to-br from-[#d4af37] to-[#b8860b] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] text-black font-semibold hover:-translate-y-[1px]",
        danger: "bg-[#dc3545] hover:bg-[#bb2d3b] text-white shadow-sm hover:-translate-y-[1px]",
        outlinePrimary: "border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-semibold bg-transparent",
        outlineDanger: "border border-[#dc3545] text-[#dc3545] hover:bg-[#dc3545] hover:text-white bg-transparent",
        outlineSecondary: "border border-[#0000001a] text-[#6c757d] hover:text-[#212529] hover:border-[#212529] bg-transparent",
        ghostPrimary: "text-[#d4af37] hover:bg-[#d4af37]/10 bg-transparent",
        ghostDanger: "text-[#dc3545] hover:bg-[#dc3545]/10 bg-transparent",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-1.5", // Specifically for small icon buttons in tables
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={`${classes} no-underline`} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={classes} {...props}>
            {children}
        </button>
    );
};
