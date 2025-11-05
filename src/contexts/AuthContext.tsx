import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, groupsApi } from '@/services/api';
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

interface Group {
  id: string;
  nom: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  groups: Group[];
  login: (login: string, clau: string, digition: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getGroupName: (groupId: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedGroups = localStorage.getItem('groups');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }
    setLoading(false);
  }, []);

  const login = async (login: string, clau: string, digition: string) => {
    const userData = await authApi.login(login, clau, digition);
    console.log('Login response data:', userData);
    
    // Assegurar-nos que el token està net
    const cleanToken = userData.accessToken.trim();
    console.log('Clean token length:', cleanToken.length);
    console.log('Token preview:', cleanToken.substring(0, 50) + '...');
    
    // Descodificar el JWT per obtenir les dades de l'usuari
    const decoded = jwtDecode<JwtPayload>(cleanToken);
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
    
    // Desar l'accessToken net
    localStorage.setItem('accessToken', cleanToken);
    
    // Carregar els grups després del login
    try {
      const groupsData = await groupsApi.getAll();
      setGroups(groupsData);
      localStorage.setItem('groups', JSON.stringify(groupsData));
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setGroups([]);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('groups');
  };

  const getGroupName = (groupId: number): string => {
    const group = groups.find(g => g.id === groupId.toString());
    return group ? group.nom : groupId.toString();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        groups,
        login,
        logout,
        isAuthenticated: !!user,
        getGroupName,
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
