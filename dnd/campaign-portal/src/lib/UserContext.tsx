'use client';

import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {User} from '@/types';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>; // No longer needs campaignId
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const initUser = useCallback(async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

            // 1. Fetch User Identity ONLY
            const userResponse = await fetch(`${API_HOST}/api/v1/user`, {
                headers: {'Authorization': `Bearer ${token}`},
            });

            if (!userResponse.ok) throw new Error("Invalid Token");
            const userData = await userResponse.json();

            // 2. Set only the core profile.
            // We don't calculate 'role' here anymore to prevent API spam.
            setUser({
                role: userData.role,
                id: userData.id,
                username: userData.username || 'User',
                email: userData.email || 'email@example.com'
                // role is removed from the user object state
            });

        } catch (error) {
            console.error('Session initialization failed:', error);
            localStorage.removeItem('userToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initUser();
    }, [initUser]);

    const login = async () => {
        setIsLoading(true);
        await initUser();
    };

    const refreshUser = async () => {
        await initUser();
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <UserContext.Provider value={{user, isLoading, login, logout, refreshUser}}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
}