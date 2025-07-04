// src/stores/__tests__/auth.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth'; // Sesuaikan path ke store Anda

// Mock the global fetch function
global.fetch = vi.fn();

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia()); // Reset Pinia store sebelum setiap test
    // Reset mock sebelum setiap test
    vi.clearAllMocks();
  });

  it('should have initial state correct', () => {
    const authStore = useAuthStore();
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.isLoggedIn).toBe(false);
  });

  it('should successfully log in a user with correct credentials', async () => {
    // Mock a successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 'user1', username: 'penjual1', role: 'seller' }]),
    });

    const authStore = useAuthStore();
    await authStore.login('penjual1', 'password123'); // Gunakan kredensial dari db.json

    expect(authStore.user).toEqual({ id: 'user1', username: 'penjual1', role: 'seller' });
    expect(authStore.token).toMatch(/^dummy_jwt_token_for_user1/); // Cek format token
    expect(authStore.isLoggedIn).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/users?username=penjual1&password=password123');
  });

  it('should fail login with incorrect credentials', async () => {
    // Mock a fetch response where no user is found
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const authStore = useAuthStore();
    // Expect the login function to throw an error
    await expect(authStore.login('wronguser', 'wrongpass')).rejects.toThrow('Username atau password salah.');

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
  });

  it('should handle network errors during login', async () => {
    // Mock a failed fetch response (e.g., network down)
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    const authStore = useAuthStore();
    await expect(authStore.login('anyuser', 'anypass')).rejects.toThrow('Network Error');

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
  });

  it('should log out a user', () => {
    const authStore = useAuthStore();
    // Simulasikan state sudah login
    authStore.user = { id: 'user1', username: 'penjual1', role: 'seller' };
    authStore.token = 'dummy_jwt_token_for_user1';
    authStore.isLoggedIn = true;

    authStore.logout();

    expect(authStore.user).toBeNull();
    expect(authStore.token).toBeNull();
    expect(authStore.isLoggedIn).toBe(false);
  });
});