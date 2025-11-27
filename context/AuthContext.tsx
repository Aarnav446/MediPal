import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { loginUser as dbLogin, registerUser as dbRegister } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: 'patient' | 'doctor') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('medimatch_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 800));
    
    try {
        const userFound = dbLogin(email, pass);
        if (userFound) {
            setUser(userFound);
            localStorage.setItem('medimatch_user', JSON.stringify(userFound));
        } else {
            throw new Error("Invalid email or password");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, role: 'patient' | 'doctor') => {
     setIsLoading(true);
     await new Promise(r => setTimeout(r, 800));
     
     try {
        const newUser = dbRegister(name, email, pass, role);
        // Auto login after register
        const u: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role as 'patient'|'doctor' };
        setUser(u);
        localStorage.setItem('medimatch_user', JSON.stringify(u));
     } finally {
        setIsLoading(false);
     }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medimatch_user');
    window.location.hash = '#/';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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