<template>
  <div class="video-background">
    <video autoplay muted loop playsinline>
      <source src="/videos/fast-and-furious.mp4" type="video/mp4" />
      Browser kamu tidak mendukung video HTML5.
    </video>
  </div>
  <div class="login-page">
    <div class="form-container">
      <h2>Login ke Akun Anda</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>

        <div class="divider"><span>ATAU</span></div>

        <button @click="signInWithGoogle" class="btn btn-social google">
          <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
          Login dengan Google
        </button>
        <button @click="signInWithFacebook" class="btn btn-social facebook">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
          Login dengan Facebook
        </button>

        <p class="register-link">
          Belum punya akun? <router-link to="/register">Daftar sekarang</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuthStore } from '@/stores/auth'; // pastikan path sesuai

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const firebaseUser = userCredential.user;

    // Ambil user dari JSON Server
    const res = await fetch(`http://localhost:3001/users?email=${firebaseUser.email}`);
    const data = await res.json();

    if (data.length > 0) {
      const userData = data[0];

      // Simpan ke store
      authStore.user = userData;
      authStore.token = `firebase_token_${firebaseUser.uid}`;
      authStore.isLoggedIn = true;

      // Arahkan sesuai role
      if (userData.role === 'seller') {
        router.push('/dashboard-penjual');
      } else {
        router.push('/dashboard-pembeli');
      }
    } else {
      alert('❌ Data user tidak ditemukan di JSON Server!');
    }
  } catch (err) {
    alert('Login gagal: ' + err.message);
    console.error('Login error:', err);
  }
};

const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Ambil user dari JSON Server
    const res = await fetch(`http://localhost:3001/users?email=${firebaseUser.email}`);
    const data = await res.json();

    if (data.length > 0) {
      const userData = data[0];
      authStore.user = userData;
      authStore.token = `firebase_token_${firebaseUser.uid}`;
      authStore.isLoggedIn = true;

      if (userData.role === 'seller') {
        router.push('/dashboard-penjual');
      } else {
        router.push('/dashboard-pembeli');
      }
    } else {
      alert('❌ Data user tidak ditemukan di JSON Server!');
    }
  } catch (err) {
    alert('Login dengan Google gagal: ' + err.message);
    console.error('Google login error:', err);
  }
};

const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const res = await fetch(`http://localhost:3001/users?email=${firebaseUser.email}`);
    const data = await res.json();

    if (data.length > 0) {
      const userData = data[0];
      authStore.user = userData;
      authStore.token = `firebase_token_${firebaseUser.uid}`;
      authStore.isLoggedIn = true;

      if (userData.role === 'seller') {
        router.push('/dashboard-penjual');
      } else {
        router.push('/dashboard-pembeli');
      }
    } else {
      alert('❌ Data user tidak ditemukan di JSON Server!');
    }
  } catch (err) {
    alert('Login dengan Facebook gagal: ' + err.message);
    console.error('Facebook login error:', err);
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
  filter: brightness(0.4); /* Biar form tetap terlihat jelas */
}

/* Background full screen untuk animasi */
.login-page {
  height: 100vh;
  width: 100%;

  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Container transparan */
.form-container {
  background-color: rgba(0, 0, 0, 0.75);
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 30px #0ff;
  color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #0ff;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #0ff;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.form-control::placeholder {
  color: #bbb;
}

.btn {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #28a745;
  color: #fff;
}
.btn-primary:hover {
  background-color: #218838;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}
.divider span {
  background: rgba(0, 0, 0, 0.75);
  padding: 0 10px;
  position: relative;
  z-index: 1;
  color: #ccc;
}
.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  height: 1px;
  width: 100%;
  background-color: #ccc;
  z-index: 0;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333;
  color: #fff;
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
.btn-social.google:hover {
  background-color: #c23321;
}

.btn-social.facebook {
  background-color: #fdfeff;
  color: rgb(2, 2, 2);
}
.btn-social.facebook:hover {
  background-color: #2d4373;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: #0ff;
  text-decoration: underline;
}
</style>
