<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/" class="nav-brand">JualBeliKendaraan.com</router-link>
        <div class="nav-links">
          <router-link to="/">Beranda</router-link>
          <router-link to="/vehicles">Cari Kendaraan</router-link>
          <router-link v-if="authStore.isLoggedIn && (authStore.user.role === 'seller' || authStore.user.role === 'admin')" to="/sell">Jual Kendaraan</router-link>
          <router-link v-if="authStore.isLoggedIn && (authStore.user.role === 'seller' || authStore.user.role === 'admin')" to="/my-vehicles">Kendaraan Saya</router-link>
          <router-link v-if="authStore.isLoggedIn" to="/profile">Profil</router-link>
          <router-link to="/about">Tentang Kami</router-link>
        </div>
        <div class="auth-links">
          <span v-if="authStore.isLoggedIn">Halo, {{ authStore.user.username }}!</span>
          <button v-if="authStore.isLoggedIn" @click="handleLogout" class="btn-auth">Logout</button>
          <router-link v-else to="/login" class="btn-auth">Login</router-link>
          <router-link v-if="!authStore.isLoggedIn" to="/register" class="btn-auth secondary">Register</router-link>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <router-view /> </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login'); // Redirect ke halaman login setelah logout
};
</script>

<style>
/* Basic Styling untuk App.vue */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-header {
  background-color: #333;
  padding: 15px 20px;
  color: white;
}

.app-header nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  color: white;
  text-decoration: none;
  font-size: 1.5em;
  font-weight: bold;
}

.nav-links a, .auth-links a, .auth-links button {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-links a:hover, .auth-links a:hover, .auth-links button:hover {
  background-color: #555;
}

.btn-auth {
  background-color: #007bff;
  border: none;
  cursor: pointer;
  font-size: 1em;
}

.btn-auth.secondary {
    background-color: #6c757d;
}

.app-main {
  padding: 20px;
}

/* Basic container style for views */
.container {
    max-width: 960px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>