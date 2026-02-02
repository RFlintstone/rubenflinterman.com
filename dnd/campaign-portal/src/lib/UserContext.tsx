'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {User} from '@/types';

interface UserContextType {
    user: User | null;
    isLoading: boolean; // Added to prevent flickering/redirects during check
    login: (role: 'dm' | 'player') => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('userToken');

        async function fetchUsername() {
            try {
                if (!token) {
                    setIsLoading(false); // No token, stop loading
                    return;
                }

                const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error(`User API error: ${userResponse.status}`);
                }

                const userData = await userResponse.json();
                const username = userData.username ? userData.username : null;

                const lookingAtCampaign = localStorage.getItem('campaignId');
                const campaignResponse = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/campaign/${lookingAtCampaign}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!campaignResponse.ok) {
                    throw new Error(`Campaign API error: ${campaignResponse.status}`);
                }

                const campaignData = await campaignResponse.json();
                const isDM = userData.id?.trim() === campaignData?.dungeonmaster?.id?.trim();

                const role = isDM ? 'dm' : 'player';
                setUser({
                    id: userData.id,
                    username: username || 'User',
                    role
                });
                localStorage.setItem('userRole', role);
            } catch (error) {
                console.error('Error fetching username:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsername();
    }, []);

    // Login function simply reloads the page to re-trigger the UserProvider logic
    const login = () => {
        window.location.reload();
    };

    // Logout function clears local storage and user state
    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{user, isLoading, login, logout}}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}