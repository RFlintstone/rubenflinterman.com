'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface UserContextType {
  user: User | null;
  login: (role: 'admin' | 'player') => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'admin' | 'player') => {
    setUser({ 
      name: role === 'admin' ? 'Dungeon Master' : 'Player', 
      role 
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
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
