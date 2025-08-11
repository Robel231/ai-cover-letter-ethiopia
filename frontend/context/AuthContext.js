'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create the Provider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cover-letter-backend.onrender.com';

    const fetchUser = async (currentToken) => {
        if (!currentToken) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                // If the token is invalid, log the user out
                logout();
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            // Potentially handle logout here as well if the server is unreachable
        }
    };

    // On initial load, try to get the token from localStorage and fetch user
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        }
    }, []);

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
        fetchUser(newToken); // Fetch user data immediately after login
    };

    const logout = () => {
        setToken(null);
        setUser(null); // Clear user data on logout
        localStorage.removeItem('authToken');
    };

    const authValue = {
        token,
        user,
        isLoggedIn: !!token, // a boolean true if token exists, false otherwise
        login,
        logout,
        fetchUser // Expose fetchUser to manually refresh credits if needed
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
