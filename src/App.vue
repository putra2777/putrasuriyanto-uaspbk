<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <div class="left-nav">
          <router-link to="/" class="nav-brand">JualBeliKendaraan.com</router-link>
          <button class="menu-toggle" @click="menuOpen = !menuOpen">☰</button>
        </div>

        <div :class="['nav-links', { open: menuOpen }]">
          <router-link to="/">Beranda</router-link>
          <router-link to="/vehicles">Cari Kendaraan</router-link>
          <router-link v-if="authStore.isLoggedIn && (authStore.user.role === 'seller' || authStore.user.role === 'admin')" to="/sell">Jual Kendaraan</router-link>
          <router-link v-if="authStore.isLoggedIn && (authStore.user.role === 'seller' || authStore.user.role === 'admin')" to="/my-vehicles">Kendaraan Saya</router-link>
          <router-link v-if="authStore.isLoggedIn" to="/profile">Profil</router-link>
          <router-link to="/about">Tentang Kami</router-link>
        </div>

        <div :class="['auth-links', { open: menuOpen }]">
          <span v-if="authStore.isLoggedIn">Halo, {{ authStore.user.username }}!</span>
          <button v-if="authStore.isLoggedIn" @click="handleLogout" class="btn-auth">Logout</button>
          <router-link v-else to="/login" class="btn-auth">Login</router-link>
          <router-link v-if="!authStore.isLoggedIn" to="/register" class="btn-auth secondary">Register</router-link>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
/* Layout umum */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.app-header {
  background-color: #333;
  color: white;
  padding: 12px 20px;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.left-nav {
  display: flex;
  align-items: center;
}

.nav-brand {
  color: white;
  text-decoration: none;
  font-size: 1.4em;
  font-weight: bold;
  margin-right: 20px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.6em;
  cursor: pointer;
}

/* Nav & Auth */
.nav-links,
.auth-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-links a,
.auth-links a,
.auth-links button {
  color: white;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 5px;
  transition: background 0.3s;
}

.nav-links a:hover,
.auth-links a:hover,
.auth-links button:hover {
  background-color: #555;
}

.btn-auth {
  background-color: #007bff;
  border: none;
  cursor: pointer;
}

.btn-auth.secondary {
  background-color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .nav-links,
  .auth-links {
    display: none;
    flex-direction: column;
    width: 100%;
    margin-top: 10px;
  }

  .nav-links.open,
  .auth-links.open {
    display: flex;
  }

  nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links a,
  .auth-links a,
  .auth-links button {
    width: 100%;
    text-align: left;
  }
}

.app-main {
  padding: 20px;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
