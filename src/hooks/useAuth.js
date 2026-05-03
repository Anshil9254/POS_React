// useAuth.js
// Custom hook to read auth state from localStorage
// Replace with AuthContext when ready

export const useAuth = () => {
    const token = localStorage.getItem('token');
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();
    return { token, user, isAuthenticated: !!token };
};
