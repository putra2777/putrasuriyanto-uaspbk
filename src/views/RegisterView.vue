<template>
  <div class="video-background">
    <video autoplay muted loop playsinline>
      <source src="/videos/fast-and-furious.mp4" type="video/mp4" />
      Browser kamu tidak mendukung video HTML5.
    </video>
  </div>
  
  <div class="container form-container">
    <h1>Daftar Akun Baru</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="reg-username">Username:</label>
        <input type="text" id="reg-username" v-model="username" required class="form-control">
      </div>
      <div class="form-group">
        <label for="reg-email">Email:</label>
        <input type="email" id="reg-email" v-model="email" required class="form-control">
      </div>
      <div class="form-group">
        <label for="reg-password">Password:</label>
        <input type="password" id="reg-password" v-model="password" required class="form-control">
      </div>
      <div class="form-group">
        <label for="role">Daftar Sebagai:</label>
        <select id="role" v-model="role" class="form-control">
          <option value="buyer">Pembeli</option>
          <option value="seller">Penjual</option>
        </select>
      </div>
      <button type="submit" :disabled="loading" class="btn btn-primary">
        {{ loading ? 'Mendaftar...' : 'Daftar Sekarang' }}
      </button>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>

    <div class="social-login-options">
      <div class="divider"><span>ATAU</span></div>
      <button @click="signInWithGoogle" :disabled="loading" class="btn btn-social google">
        <img src="https://1000logos.net/wp-content/uploads/2016/11/Google-Symbol-768x480.png" alt="Google Icon">
        Daftar dengan Google
      </button>

    </div>

    <p class="login-link">Sudah punya akun? <router-link to="/login">Login di sini</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import {
  doc, setDoc, getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const email = ref('');
const password = ref('');
const role = ref('buyer');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const syncToJSONServer = async (userData) => {
  try {
    const res = await fetch(`https://27579367-a44f-4ba7-9bf1-059fc3a3cf64-00-38hegy5ahuasz.worf.replit.dev/users?email=${userData.email}`);

    const data = await res.json();

    if (data.length === 0) {
      const jsonUser = {
        id: userData.uid, // gunakan uid sebagai id
        username: userData.username,
        email: userData.email,
        password: userData.password || '', // tambahkan password jika tersedia
        role: userData.role
      };

      await fetch('https://27579367-a44f-4ba7-9bf1-059fc3a3cf64-00-38hegy5ahuasz.worf.replit.dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonUser),
      });


      console.log('✅ Disimpan ke JSON Server');
    } else {
      console.log('🔁 User sudah ada di JSON Server');
    }
  } catch (err) {
    console.error('❌ Gagal sync ke JSON Server:', err);
  }
};

const loginWithFirebase = (firebaseUser, userData) => {
  authStore.user = userData;
  authStore.token = `firebase_token_${firebaseUser.uid}`;
  authStore.isLoggedIn = true;
};

const handleRegister = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const newUser = {
      uid: user.uid,
      username: username.value,
      email: user.email,
      password: password.value, // penting untuk JSON Server
      role: role.value,
      createdAt: new Date().toISOString(),
    };

    // Simpan ke Firebase Firestore
    await setDoc(doc(db, 'users', user.uid), newUser);

    // Sinkron ke JSON Server
    await syncToJSONServer(newUser);

    successMessage.value = 'Pendaftaran berhasil! Silakan login.';
    console.log('✅ Firebase user:', user);

    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      errorMessage.value = 'Email sudah digunakan. Silakan gunakan email lain atau login.';
    } else if (err.code === 'auth/weak-password') {
      errorMessage.value = 'Password terlalu lemah. Minimal 6 karakter.';
    } else {
      errorMessage.value = err.message || 'Terjadi kesalahan saat pendaftaran.';
    }
    console.error('❌ Error register:', err);
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    const newUser = {
      uid: user.uid,
      username: user.displayName || user.email.split('@')[0],
      email: user.email,
      password: '', // Google tidak memberikan password
      role: role.value || 'buyer',
      createdAt: new Date().toISOString(),
    };

    // Simpan ke Firestore jika belum ada
    if (!userSnap.exists()) {
      await setDoc(userDocRef, newUser);
    }

    // Simpan ke JSON Server
    await syncToJSONServer(newUser);

    loginWithFirebase(user, newUser);
    router.push('/');
  } catch (error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage.value = 'Akun dengan email ini sudah ada menggunakan metode login lain.';
    } else {
      errorMessage.value = error.message || 'Terjadi kesalahan saat daftar dengan Google.';
    }
    console.error('❌ Error signing in with Google:', error);
  } finally {
    loading.value = false;
  }
};

const signInWithFacebook = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    const newUser = {
      uid: user.uid,
      username: user.displayName || user.email.split('@')[0],
      email: user.email,
      role: role.value,
      createdAt: new Date().toISOString(),
    };

    if (!userSnap.exists()) {
      await setDoc(userDocRef, newUser);
    }
    await syncToJSONServer(newUser);

    loginWithFirebase(user, newUser);
    router.push('/');
  } catch (error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage.value = 'Akun dengan email ini sudah ada menggunakan metode login lain.';
    } else {
      errorMessage.value = error.message || 'Terjadi kesalahan saat daftar dengan Facebook.';
    }
    console.error('Error signing in with Facebook:', error);
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
