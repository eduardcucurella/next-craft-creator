import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, clau: string, digition: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (login: string, clau: string, digition: string) => {
    const userData = await authApi.login(login, clau, digition);
    console.log('Login response data:', userData);
    
    // Mapejar les dades de l'API a l'estructura esperada
    const mappedUser: User = {
      id: userData.id || userData.usuariId || '1',
      email: userData.email || userData.login || login,
      role: userData.role || (userData.admin ? 'admin' : 'user'),
      name: userData.name || userData.nom || userData.nomComplet || login,
    };
    
    console.log('Mapped user data:', mappedUser);
    
    setUser(mappedUser);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    
    // Desar l'accessToken si existeix
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
