<template>
  <div class="video-background">
    <video autoplay muted loop playsinline>
      <source src="/videos/fast-and-furious.mp4" type="video/mp4" />
      Browser tidak mendukung video HTML5.
    </video>
  </div>

  <div class="register-page">
    <form @submit.prevent="handleRegister">
      <h2>Daftar Akun Baru</h2>
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <select v-model="role">
        <option value="buyer">Pembeli</option>
        <option value="seller">Penjual</option>
      </select>
      <button type="submit" :disabled="loading">{{ loading ? 'Mendaftar...' : 'Daftar' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
      <p>Sudah punya akun? <router-link to="/login">Login</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

const username = ref('');
const email = ref('');
const password = ref('');
const role = ref('buyer');
const error = ref('');
const success = ref('');
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const newUser = {
      uid: user.uid,
      username: username.value,
      email: user.email,
      role: role.value,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), newUser);

    success.value = 'Berhasil mendaftar! Mengalihkan ke login...';
    setTimeout(() => router.push('/login'), 2000);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'Email sudah digunakan.';
    } else if (err.code === 'auth/weak-password') {
      error.value = 'Password terlalu lemah.';
    } else {
      error.value = 'Gagal daftar: ' + err.message;
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>



<style scoped>
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.video-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4);
}

/* Container transparan dan neon glow */
.form-container {
  max-width: 450px;
  margin: 50px auto;
  padding: 35px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #0ff;
  border-radius: 16px;
  box-shadow: 0 0 25px #0ff, 0 0 40px #0ff2;
  backdrop-filter: blur(8px);
  color: #fff;
}

h1 {
  text-align: center;
  color: #0ff;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #0ff;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #ccc;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #0ff;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  border-color: #00ffff;
  outline: none;
}

/* Tombol daftar */
.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.btn-primary {
  background-color: #0ff;
  color: #000;
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
}

.btn-primary:hover:not(:disabled) {
  background-color: #00d4d4;
}

.btn:disabled {
  background-color: #444;
  cursor: not-allowed;
  opacity: 0.6;
}

.success-message {
  color: #00ff88;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}

.error-message {
  color: #ff4a4a;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}

p {
  text-align: center;
  margin-top: 20px;
}

p a {
  color: #00ffff;
  text-decoration: none;
}

p a:hover {
  text-decoration: underline;
}

/* Divider dan social login */
.social-login-options {
  margin-top: 30px;
  text-align: center;
}

.divider {
  position: relative;
  height: 1px;
  background-color: #444;
  margin: 25px 0;
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0 10px;
  color: #ccc;
  font-size: 0.9em;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 20px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-social img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.btn-social.google {
  background-color: #f6f5f5;
  color: rgb(21, 21, 21);
}

.btn-social.google:hover:not(:disabled) {
  background-color: #c23321;
}

.btn-social.facebook {
  background-color: #fdfeff;
  color: rgb(2, 2, 2);
}

.btn-social.facebook:hover:not(:disabled) {
  background-color: #365899;
}

</style>
