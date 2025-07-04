// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isLoggedIn = ref(false);
  const loginMethod = ref(null); // "firebase" atau "json-server"

  // Login via JSON Server (username + password)
  async function login(username, password) {
    try {
      const response = await fetch(`http://localhost:3001/users?username=${username}&password=${password}`);
      if (!response.ok) throw new Error(`Login gagal. Status: ${response.status}`);

      const users = await response.json();
      if (users.length > 0) {
        user.value = users[0];
        token.value = `dummy_jwt_token_for_${user.value.id}`;
        isLoggedIn.value = true;
        loginMethod.value = 'json-server';
        return true;
      } else {
        throw new Error('Username atau password salah.');
      }
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  // Login dari Firebase Auth (dipanggil dari komponen register/google/facebook login)
  function loginWithFirebase(firebaseUser) {
    user.value = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
    };
    isLoggedIn.value = true;
    token.value = firebaseUser.accessToken || `token-${firebaseUser.uid}`;
    loginMethod.value = 'firebase';
  }

  // Logout universal
  async function logout() {
    if (loginMethod.value === 'firebase') {
      await signOut(auth);
    }
    clearAuth();
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    isLoggedIn.value = false;
    loginMethod.value = null;
  }

  // Deteksi login dari Firebase (otomatis saat refresh)
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      loginWithFirebase(firebaseUser);
    } else if (loginMethod.value === 'firebase') {
      clearAuth();
    }
  });

  return {
    user,
    token,
    isLoggedIn,
    loginMethod,
    login,
    loginWithFirebase,
    logout,
  };
});
