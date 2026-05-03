import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGlobalStore, type UserProfile } from '../store/store';

interface AuthContextType {
    user: UserProfile | null;
    role: string | null;
    login: (userData: UserProfile) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, setUser, clearUser } = useGlobalStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Zustand persist handles rehydration, we just need to signal loading is done
        setIsLoading(false);
    }, []);

    const login = (userData: UserProfile) => {
        setUser(userData);
    };

    const logout = () => {
        clearUser();
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
