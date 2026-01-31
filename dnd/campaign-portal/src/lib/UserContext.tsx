'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types';

interface UserContextType {
  user: User | null;
  isLoading: boolean; // Added to prevent flickering/redirects during check
  login: (role: 'admin' | 'player') => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'admin' | 'player' | null;
    const token = localStorage.getItem('userToken');

    if (savedRole && token) {
      setUser({
        name: savedRole === 'admin' ? 'Dungeon Master' : 'Player',
        role: savedRole
      });
    }
    setIsLoading(false);
  }, []);

  const login = (role: 'admin' | 'player') => {
    // Persist the role choice to localStorage
    localStorage.setItem('userRole', role);
    setUser({
      name: role === 'admin' ? 'Dungeon Master' : 'Player',
      role
    });
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
      <UserContext.Provider value={{ user, isLoading, login, logout }}>
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