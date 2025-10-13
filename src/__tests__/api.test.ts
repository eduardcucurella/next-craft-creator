import { describe, it, expect } from 'vitest';
import { usersApi, profilesApi, groupsApi, rolesApi } from '@/services/api';

describe('API Services', () => {
  describe('usersApi', () => {
    it('fetches all users', async () => {
      const users = await usersApi.getAll();
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
    });

    it('fetches user by id', async () => {
      const user = await usersApi.getById('1');
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
    });

    it('creates new user', async () => {
      const newUser = await usersApi.create({
        email: 'new@example.com',
        name: 'New User',
        role: 'user',
        profileId: '1',
      });
      expect(newUser).toHaveProperty('id');
    });
  });

  describe('profilesApi', () => {
    it('fetches all profiles', async () => {
      const profiles = await profilesApi.getAll();
      expect(profiles).toBeInstanceOf(Array);
      expect(profiles.length).toBeGreaterThan(0);
    });
  });

  describe('groupsApi', () => {
    it('fetches all groups', async () => {
      const groups = await groupsApi.getAll();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('rolesApi', () => {
    it('fetches all roles', async () => {
      const roles = await rolesApi.getAll();
      expect(roles).toBeInstanceOf(Array);
      expect(roles.length).toBeGreaterThan(0);
    });
  });
});
