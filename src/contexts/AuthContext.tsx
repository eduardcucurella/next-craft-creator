import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  dig: string;
  sub: string;
  uid: number;
  gid: number;
  iat: number;
  cli: string;
  clv: string;
  fev: string;
  exp: number;
}

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  uid: number;
  gid: number;
  digition: string;
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
    
    // Descodificar el JWT per obtenir les dades de l'usuari
    const decoded = jwtDecode<JwtPayload>(userData.accessToken);
    console.log('Decoded JWT:', decoded);
    
    // Mapejar les dades del JWT a l'estructura esperada
    const mappedUser: User = {
      id: decoded.uid.toString(),
      email: decoded.sub,
      role: 'user', // Per defecte, es pot canviar segons la lògica necessària
      name: decoded.sub,
      uid: decoded.uid,
      gid: decoded.gid,
      digition: decoded.dig,
    };
    
    console.log('Mapped user data:', mappedUser);
    
    setUser(mappedUser);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    
    // Desar l'accessToken
    localStorage.setItem('accessToken', userData.accessToken);
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
