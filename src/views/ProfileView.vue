<template>
  <div class="container profile-container">
    <h1>Profil Pengguna</h1>
    <p v-if="!authStore.isLoggedIn" class="error-message">Anda harus login untuk melihat profil Anda.</p>
    <div v-else class="profile-details">
      <p><strong>Username:</strong> {{ authStore.user.username }}</p>
      <p><strong>Email:</strong> {{ authStore.user.email }}</p>
      <p><strong>Peran:</strong> {{ authStore.user.role === 'seller' ? 'Penjual' : authStore.user.role === 'admin' ? 'Administrator' : 'Pengguna Biasa' }}</p>
      </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 30px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}
h1 {
  color: #333;
  margin-bottom: 25px;
}
.profile-details {
  text-align: left;
  margin-top: 20px;
  padding: 0 20px;
}
.profile-details p {
  margin-bottom: 10px;
  font-size: 1.1em;
  color: #555;
}
.profile-details strong {
  color: #333;
}
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>