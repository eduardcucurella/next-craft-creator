//TEST: 'http://tomcat01-test.pub.dtvc.local:8214/v2'
//PRE: 'http://digi01-pre.dtvc.local:8214/v2'
//PRE: 'http://digi02-pre.dtvc.local:8214/v2'
//BETA: 'http://digi-beta.dtvc.local:8214/v2'
//PRO: 'https://digition.ccma.cat/digition-api/v2'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://tomcat01-test.pub.dtvc.local:8214/v2';

// Get API key from environment or stored token
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    // Prioritzar el token desat del login
    const accessToken = localStorage.getItem('accessToken');
    const token = accessToken || import.meta.env.VITE_API_KEY;
    
    if (token) {
      // Netejar el token d'espais en blanc i caràcters estranys
      const cleanToken = token.trim();
      
      // Verificar si el token ha expirat
      try {
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        
        if (exp && exp < now) {
          console.error('Token has expired!', { exp, now, diff: now - exp });
          // Netejar token expirat
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return headers;
        }
        
        console.log('Token is valid. Expires at:', new Date(exp * 1000).toISOString());
      } catch (e) {
        console.error('Error checking token expiration:', e);
      }
      
      headers['Authorization'] = cleanToken; // Sense prefix Bearer
      console.log('Sending Authorization header (first 50 chars):', cleanToken.substring(0, 50) + '...');
      console.log('Full token length:', cleanToken.length);
    } else {
      console.warn('No token available for authentication');
    }
  }
  
  return headers;
};

// Mock data
const mockUsers = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' as const, profileId: '1' },
  { id: '2', email: 'user@example.com', name: 'Regular User', role: 'user' as const, profileId: '2' },
];

const mockProfiles = [
  { id: '1', userId: '1', firstName: 'Admin', lastName: 'User', bio: 'System administrator', avatar: '' },
  { id: '2', userId: '2', firstName: 'Regular', lastName: 'User', bio: 'Standard user', avatar: '' },
];

const mockGroups = [
  { id: '1', name: 'Administrators', description: 'System administrators group', memberCount: 1 },
  { id: '2', name: 'Users', description: 'Standard users group', memberCount: 1 },
];

const mockRoles = [
  { id: '1', name: 'admin', description: 'Full system access', permissions: ['read', 'write', 'delete', 'manage'] },
  { id: '2', name: 'user', description: 'Standard user access', permissions: ['read', 'write'] },
];

export const authApi = {
  login: async (login: string, clau: string, digition: string) => {
    const response = await fetch(`${API_BASE_URL}/autenticacio/login`, {
      method: 'POST',
      headers: getHeaders(false), // No enviem Bearer token al login
      body: JSON.stringify({ login, clau, digition }),
    });
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    return response.json();
  },
};

export const usersApi = {
  search: async (params: {
    login?: string;
    nom?: string;
    cognom?: string;
    page: number;
    pageSize: number;
    sortBy?: 'name' | 'description' | 'roleId';
    sortOrder?: 'asc' | 'desc';
    digition: string;
  }) => {
    // Tots els paràmetres ara van al body amb els nous noms
    const body: any = {
      pagina: params.page,
      midaPagina: params.pageSize,
      digition: params.digition,
    };
    
    if (params.sortBy) body.campOrdenacio = params.sortBy;
    if (params.sortOrder) body.ordreOrdenacio = params.sortOrder;
    if (params.login && params.login.trim()) body.login = params.login.trim();
    if (params.nom && params.nom.trim()) body.nom = params.nom.trim();
    if (params.cognom && params.cognom.trim()) body.cognom = params.cognom.trim();

    console.log('Search request body:', body);
    console.log('Search request URL:', `${API_BASE_URL}/usuaris/_cerca`);

    const response = await fetch(`${API_BASE_URL}/usuaris/_cerca`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search error response:', errorText);
      throw new Error('Failed to search users');
    }
    
    return response.json();
  },
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/usuaris`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  getById: async (id: string, digition: string) => {
    const prefixMap: Record<string, string> = {
      'PRODUCCIO': 'PRO',
      'DOCUMENTACIO': 'ARX',
      'ARXIU': 'ARX',
      'EMISSIO': 'EMI',
      'PARLAMENT': 'PAR',
    };
    const prefix = prefixMap[digition] || '';
    const prefixedId = prefix ? `${prefix}${id}` : id;
    
    const response = await fetch(`${API_BASE_URL}/usuaris/id/${prefixedId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('User not found');
    return response.json();
  },
  saveNotes: async (userId: string, notes: string, digition: string) => {
    const queryParams = new URLSearchParams({
      digition,
    });
    
    const response = await fetch(`${API_BASE_URL}/usuaris/${userId}/notes?${queryParams}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.missatge || 'Failed to save notes';
      throw new Error(errorMessage);
    }
    return response.json();
  },
  create: async (data: {
    login: string;
    nom: string;
    cognoms: string;
    correu: string;
    grup: number;
    actiu: boolean;
    notes: string;
    digition: string;
  }) => {
    const queryParams = new URLSearchParams({
      digition: data.digition,
    });
    
    const { digition, ...bodyData } = data;
    
    const response = await fetch(`${API_BASE_URL}/usuaris?${queryParams}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bodyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.missatge || 'Failed to create user';
      const debugInfo = errorData.debugInfo ? ` (${errorData.debugInfo})` : '';
      throw new Error(`${errorMessage}${debugInfo}`);
    }
    return response.json();
  },
  update: async (userId: number, data: {
    login: string;
    nom: string;
    cognoms: string;
    correu: string;
    grup: number;
    actiu: boolean;
    notes: string;
    digition: string;
  }) => {
    const prefixMap: Record<string, string> = {
      'PRODUCCIO': 'PRO',
      'DOCUMENTACIO': 'ARX',
      'ARXIU': 'ARX',
      'EMISSIO': 'EMI',
      'PARLAMENT': 'PAR',
    };
    const prefix = prefixMap[data.digition] || '';
    const prefixedId = prefix ? `${prefix}${userId}` : String(userId);
    
    const { digition, login, correu, ...restData } = data;
    const bodyData = { ...restData, correu: correu };
    
    const response = await fetch(`${API_BASE_URL}/usuaris/${prefixedId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bodyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.missatge || 'Failed to update user';
      const debugInfo = errorData.debugInfo ? ` (${errorData.debugInfo})` : '';
      throw new Error(`${errorMessage}${debugInfo}`);
    }
    return response.json();
  },
  delete: async (id: number, digition: string) => {
    const queryParams = new URLSearchParams({
      digition,
    });
    
    const response = await fetch(`${API_BASE_URL}/usuaris/${id}?${queryParams}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.missatge || 'Failed to delete user';
      const debugInfo = errorData.debugInfo ? ` (${errorData.debugInfo})` : '';
      throw new Error(`${errorMessage}${debugInfo}`);
    }
    return { success: true };
  },
  assignRole: async (userId: number, roleId: number, digition: string) => {
    const queryParams = new URLSearchParams({
      digition,
    });
    
    const response = await fetch(`${API_BASE_URL}/usuaris/${userId}/rol/${roleId}/assignar?${queryParams}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.missatge || 'Failed to assign role';
      throw new Error(errorMessage);
    }
    // Gestionar resposta 200 sense body JSON
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  },
  removeRole: async (userId: number, roleId: number, digition: string) => {
    const queryParams = new URLSearchParams({
      digition,
    });
    
    const response = await fetch(`${API_BASE_URL}/usuaris/${userId}/rol/${roleId}/eliminar?${queryParams}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.missatge || 'Failed to remove role';
      throw new Error(errorMessage);
    }
    // Gestionar resposta 200 sense body JSON
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  },
};

export const profilesApi = {
  getAll: async () => {
    return mockProfiles;
  },
  getById: async (id: string) => {
    const profile = mockProfiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    return profile;
  },
  create: async (data: Omit<typeof mockProfiles[0], 'id'>) => {
    return { id: String(Date.now()), ...data };
  },
  update: async (id: string, data: Partial<typeof mockProfiles[0]>) => {
    const profile = mockProfiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    return { ...profile, ...data };
  },
  delete: async (id: string) => {
    return { success: true };
  },
};

export const groupsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/grups`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    return response.json();
  },
  getById: async (id: string) => {
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  },
  create: async (data: { nom: string }) => {
    return { id: String(Date.now()), ...data };
  },
  update: async (id: string, data: Partial<{ nom: string }>) => {
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return { ...group, ...data };
  },
  delete: async (id: string) => {
    return { success: true };
  },
};

export const rolesApi = {
  search: async (params: {
    roleid?: number;
    name?: string;
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    digition: string;
  }) => {
    const bodyData: Record<string, any> = {
      pagina: params.page,
      midaPagina: params.pageSize,
      digition: params.digition,
    };

    if (params.sortBy) {
      bodyData.campOrdenacio = params.sortBy;
    }
    if (params.sortOrder) {
      bodyData.ordreOrdenacio = params.sortOrder;
    }
    if (params.roleid !== undefined && params.roleid !== null) {
      // Afegir prefix segons digition
      const prefix = params.digition === 'PRODUCCIO' ? 'P' : 'T';
      bodyData.rolId = `${prefix}${params.roleid}`;
    }
    if (params.name && params.name.trim()) {
      bodyData.nom = params.name.trim();
    }

    const response = await fetch(`${API_BASE_URL}/rols/_cerca`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bodyData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search error response:', errorText);
      throw new Error('Failed to search roles');
    }
    
    const result = await response.json();
    
    // Map response to expected format
    return {
      content: result.rols || [],
      totalElements: result.elementsTotals || 0,
      totalPages: result.paginesTotals || 0,
      page: result.pagina || params.page,
    };
  },
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/rols`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rols/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Role not found');
    return response.json();
  },
  getUserRoles: async (userId: number, digition: string) => {
    const response = await fetch(`${API_BASE_URL}/rols/user/${userId}?digition=${digition}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user roles');
    return response.json();
  },
  create: async (data: { nom: string; descripcio: string; digition: string }) => {
    const queryParams = new URLSearchParams({
      digition: data.digition,
    });

    const response = await fetch(`${API_BASE_URL}/rols?${queryParams}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nom: data.nom, descripcio: data.descripcio }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.missatge || 'Failed to create role');
    }
    return response.json();
  },
  update: async (id: string, data: { descripcio: string; digition: string }) => {
    const queryParams = new URLSearchParams({
      digition: data.digition,
    });

    const response = await fetch(`${API_BASE_URL}/rols/${id}?${queryParams}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ descripcio: data.descripcio }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.missatge || 'Failed to update role');
    }
    return response.json();
  },
  delete: async (id: string, digition: string) => {
    const queryParams = new URLSearchParams({
      digition: digition,
    });

    const response = await fetch(`${API_BASE_URL}/rols/${id}?${queryParams}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.missatge || 'Failed to delete role');
    }
    return { success: true };
  },
};
