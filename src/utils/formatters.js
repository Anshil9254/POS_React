// formatters.js
// Shared utility functions for formatting values across the app

export const formatCurrency = (amount, symbol = 'Rs.') =>
    ${symbol} ;

export const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN') : '-';

export const formatDateTime = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString('en-IN') : '-';

export const truncate = (str, len = 30) =>
    str && str.length > len ? str.slice(0, len) + '...' : str || '-';
