import React from 'react';

export const TableContainer = ({ children, className = '' }) => (
    <div className={`overflow-x-auto ${className}`}>
        <table className="w-full text-left border-collapse align-middle">
            {children}
        </table>
    </div>
);

export const Thead = ({ children, className = '' }) => (
    <thead className={`bg-[#f8f9fa] text-[#6c757d] text-xs uppercase tracking-wider font-medium border-b border-[#0000001a] ${className}`}>
        {children}
    </thead>
);

export const Tbody = ({ children, className = '' }) => (
    <tbody className={`divide-y divide-[#0000000d] ${className}`}>
        {children}
    </tbody>
);

export const Tr = ({ children, className = '', isHoverable = true }) => (
    <tr className={`${isHoverable ? 'hover:bg-black/5 transition-colors group' : ''} ${className}`}>
        {children}
    </tr>
);

export const Th = ({ children, className = '', isAction = false }) => (
    <th className={`p-4 ${isAction ? 'text-right pr-6 w-32' : ''} ${className}`}>
        {children}
    </th>
);

export const Td = ({ children, className = '', isAction = false }) => (
    <td className={`p-4 ${isAction ? 'pr-6 text-right' : ''} ${className}`}>
        {children}
    </td>
);
