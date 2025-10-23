const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://tomcat01-test.pub.dtvc.local:8214/v2';

// Get API key from environment
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth && import.meta.env.VITE_API_KEY) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_API_KEY}`;
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
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/usuaris`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/usuaris/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('User not found');
    return response.json();
  },
  create: async (data: Omit<typeof mockUsers[0], 'id'>) => {
    const response = await fetch(`${API_BASE_URL}/usuaris`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },
  update: async (id: string, data: Partial<typeof mockUsers[0]>) => {
    const response = await fetch(`${API_BASE_URL}/usuaris/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/usuaris/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return { success: true };
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
    return mockGroups;
  },
  getById: async (id: string) => {
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  },
  create: async (data: Omit<typeof mockGroups[0], 'id' | 'memberCount'>) => {
    return { id: String(Date.now()), memberCount: 0, ...data };
  },
  update: async (id: string, data: Partial<typeof mockGroups[0]>) => {
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return { ...group, ...data };
  },
  delete: async (id: string) => {
    return { success: true };
  },
};

export const rolesApi = {
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
  create: async (data: Omit<typeof mockRoles[0], 'id'>) => {
    const response = await fetch(`${API_BASE_URL}/rols`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create role');
    return response.json();
  },
  update: async (id: string, data: Partial<typeof mockRoles[0]>) => {
    const response = await fetch(`${API_BASE_URL}/rols/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/rols/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete role');
    return { success: true };
  },
};
