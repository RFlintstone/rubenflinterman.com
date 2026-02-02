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
        const savedRole = localStorage.getItem('userRole') as 'dm' | 'player' | null;
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

                if (savedRole && token) {
                    setUser({
                        id: userData.id,
                        username: username || 'User',
                        role: isDM ? 'dm' : 'player'
                    });
                    localStorage.setItem('userRole', isDM ? 'dm' : 'player');
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsername();
    }, []);

    const login = (role: 'dm' | 'player') => {
        // Persist the role choice to localStorage
        localStorage.setItem('userRole', role);

        // Populated by useEffect on mount, but we set a basic user here for immediate state update
        setUser({
            id: 'current-user-id',
            username: role === 'dm' ? 'Dungeon Master' : 'Player',
            role
        });
    };

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