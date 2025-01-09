import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        return !!token;  // token이 있으면 true, 없으면 false
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };
    
    return { checkAuth, logout };
}; 