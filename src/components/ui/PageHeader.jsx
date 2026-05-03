import React from 'react';
import { Link } from 'react-router-dom';

export const PageHeader = ({ title, description, breadcrumbs, actionButton }) => {
    return (
        <div className="mb-4">
            {breadcrumbs && (
                <nav className="flex text-sm text-[#6c757d] mb-4">
                    <ol className="flex items-center space-x-2">
                        {breadcrumbs.map((bc, index) => (
                            <React.Fragment key={index}>
                                <li>
                                    {bc.link ? (
                                        <Link to={bc.link} className="hover:text-[#b8860b] hover:underline text-[#d4af37] font-medium transition-colors">
                                            {bc.label}
                                        </Link>
                                    ) : (
                                        <span className="text-[#6c757d]">{bc.label}</span>
                                    )}
                                </li>
                                {index < breadcrumbs.length - 1 && (
                                    <li className="text-[#6c757d] before:content-['/'] before:mx-2"></li>
                                )}
                            </React.Fragment>
                        ))}
                    </ol>
                </nav>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[28px] font-montserrat font-bold text-[#d4af37] m-0 leading-tight">
                        {title}
                    </h2>
                    {description && <p className="text-[#6c757d] mt-1 mb-0">{description}</p>}
                </div>
                {actionButton && (
                    <div>
                        {actionButton}
                    </div>
                )}
            </div>
        </div>
    );
};
