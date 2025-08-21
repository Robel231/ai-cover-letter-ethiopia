'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    useEffect(() => {
        // This listener is the key to Supabase auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                // User is logged in
                setToken(session.access_token);
                setUser(session.user);
                localStorage.setItem('authToken', session.access_token);
            } else {
                // User is logged out
                setToken(null);
                setUser(null);
                localStorage.removeItem('authToken');
            }
            setIsLoading(false); // Set loading to false once we have a session or know there isn't one
        });

        // Also check for the initial session on page load
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setToken(session.access_token);
                setUser(session.user);
                localStorage.setItem('authToken', session.access_token);
            }
            setIsLoading(false);
        };
        
        getInitialSession();

        // Cleanup the listener when the component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Manual login for email/password is now mostly a fallback
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };

    // Logout now uses Supabase's method
    const logout = async () => {
        await supabase.auth.signOut();
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
    };

    const authValue = {
        token,
        user,
        isLoggedIn: !!token,
        isLoading, // Expose loading state
        login,
        logout
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
if (!context) {
        throw new Error('useAuth must be used within an Auth-Provider');
    }
    return context;
};
