<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login ke Akun Anda</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required class="form-control" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Memuat...' : 'Login' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="divider"><span>ATAU</span></div>

      <button @click="signInWithGoogle" :disabled="loading" class="btn btn-social google">
        <img src="https://1000logos.net/wp-content/uploads/2016/11/Google-Symbol-768x480.png" alt="Google Icon" />
        Login dengan Google
      </button>

      <button @click="signInWithFacebook" :disabled="loading" class="btn btn-social facebook">
        <img src="https://www.clipartmax.com/png/full/223-2237173_facebook-messenger-social-media-computer-icons-clip-facebook-f-logo-svg.png" alt="Facebook Icon" />
        Login dengan Facebook
      </button>

      <p class="register-text">
        Belum punya akun? <router-link to="/register">Daftar sekarang</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const router = useRouter();
const authStore = useAuthStore();

const syncToJSONServer = async (userData) => {
  try {
    // Cek apakah user sudah ada berdasarkan UID
    const res = await fetch(`http://localhost:3001/users?uid=${userData.uid}`);
    const data = await res.json();

    if (data.length === 0) {
      await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    }
  } catch (err) {
    console.error('Gagal sync ke JSON Server:', err);
  }
};

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Terjadi kesalahan saat login.';
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  loading.value = true;
  error.value = null;
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      await syncToJSONServer(newUser);
    } else {
      await syncToJSONServer(userSnap.data());
    }

    router.push('/');
  } catch (err) {
    error.value = err.message || 'Login dengan Google gagal.';
  } finally {
    loading.value = false;
  }
};

const signInWithFacebook = async () => {
  loading.value = true;
  error.value = null;
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      await syncToJSONServer(newUser);
    } else {
      await syncToJSONServer(userSnap.data());
    }

    router.push('/');
  } catch (err) {
    error.value = err.message || 'Login dengan Facebook gagal.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: #f0f2f5;
}

.login-box {
  background-color: #fff;
  padding: 35px 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0 15px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ccc;
}

.divider span {
  margin: 0 10px;
  color: #888;
  font-weight: bold;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-social.google {
  background-color: #db4437;
  color: white;
}

.btn-social.google:hover {
  background-color: #c33d2e;
}

.btn-social.facebook {
  background-color: #3b5998;
  color: white;
}

.btn-social.facebook:hover {
  background-color: #2d4373;
}

.btn-social img {
  width: 20px;
  height: 20px;
}

.register-text {
  text-align: center;
  margin-top: 20px;
}
</style>
