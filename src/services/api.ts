// Mock API service - Replace with real API calls when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  login: async (email: string, password: string) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }
    return user;
  },
};

export const usersApi = {
  getAll: async () => {
    await delay(300);
    return mockUsers;
  },
  getById: async (id: string) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  create: async (data: Omit<typeof mockUsers[0], 'id'>) => {
    await delay(300);
    return { id: String(Date.now()), ...data };
  },
  update: async (id: string, data: Partial<typeof mockUsers[0]>) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return { ...user, ...data };
  },
  delete: async (id: string) => {
    await delay(300);
    return { success: true };
  },
};

export const profilesApi = {
  getAll: async () => {
    await delay(300);
    return mockProfiles;
  },
  getById: async (id: string) => {
    await delay(300);
    const profile = mockProfiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    return profile;
  },
  create: async (data: Omit<typeof mockProfiles[0], 'id'>) => {
    await delay(300);
    return { id: String(Date.now()), ...data };
  },
  update: async (id: string, data: Partial<typeof mockProfiles[0]>) => {
    await delay(300);
    const profile = mockProfiles.find(p => p.id === id);
    if (!profile) throw new Error('Profile not found');
    return { ...profile, ...data };
  },
  delete: async (id: string) => {
    await delay(300);
    return { success: true };
  },
};

export const groupsApi = {
  getAll: async () => {
    await delay(300);
    return mockGroups;
  },
  getById: async (id: string) => {
    await delay(300);
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  },
  create: async (data: Omit<typeof mockGroups[0], 'id' | 'memberCount'>) => {
    await delay(300);
    return { id: String(Date.now()), memberCount: 0, ...data };
  },
  update: async (id: string, data: Partial<typeof mockGroups[0]>) => {
    await delay(300);
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return { ...group, ...data };
  },
  delete: async (id: string) => {
    await delay(300);
    return { success: true };
  },
};

export const rolesApi = {
  getAll: async () => {
    await delay(300);
    return mockRoles;
  },
  getById: async (id: string) => {
    await delay(300);
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    return role;
  },
  create: async (data: Omit<typeof mockRoles[0], 'id'>) => {
    await delay(300);
    return { id: String(Date.now()), ...data };
  },
  update: async (id: string, data: Partial<typeof mockRoles[0]>) => {
    await delay(300);
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    return { ...role, ...data };
  },
  delete: async (id: string) => {
    await delay(300);
    return { success: true };
  },
};
