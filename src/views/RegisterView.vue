<template>
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
      <button @click="signInWithFacebook" :disabled="loading" class="btn btn-social facebook">
        <img src="https://www.clipartmax.com/png/full/223-2237173_facebook-messenger-social-media-computer-icons-clip-facebook-f-logo-svg.png" alt="Facebook Icon">
        Daftar dengan Facebook
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
    const res = await fetch(`http://localhost:3001/users?uid=${userData.uid}`);
    const data = await res.json();
    if (data.length === 0) {
      await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    }
  } catch (err) {
    console.error('Gagal sync ke JSON Server:', err);
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
      role: role.value,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), newUser);
    await syncToJSONServer(newUser);

    successMessage.value = 'Pendaftaran berhasil! Silakan login.';
    console.log('User baru terdaftar:', user);

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
    console.error('Error registering user:', err);
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
    errorMessage.value = error.message || 'Terjadi kesalahan saat daftar dengan Google.';
    console.error('Error signing in with Google:', error);
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
.form-container {
  max-width: 450px;
  margin: 30px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}
.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.form-control:focus {
  border-color: #007bff;
  outline: none;
}
.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}
.btn-primary {
  background-color: #28a745;
  color: white;
  width: 100%;
  margin-top: 10px; /* Jarak dari form group terakhir */
}
.btn-primary:hover:not(:disabled) {
  background-color: #218838;
}
.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}
.success-message {
  color: #28a745;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
.error-message {
  color: red;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
p {
  text-align: center;
  margin-top: 20px;
}
p a {
  color: #007bff;
  text-decoration: none;
}
p a:hover {
  text-decoration: underline;
}

/* Styling untuk Social Login */
.social-login-options {
  margin-top: 30px;
  text-align: center;
}

.divider {
  position: relative;
  height: 1px;
  background-color: #e0e0e0;
  margin: 25px 0;
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 0 10px;
  color: #888;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Tambah bayangan */
}

.btn-social img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.btn-social.google {
  background-color: #db4437; /* Warna Google */
  color: white;
}

.btn-social.google:hover:not(:disabled) {
  background-color: #c23321;
}

.btn-social.facebook {
  background-color: #4267b2; /* Warna Facebook */
  color: white;
}

.btn-social.facebook:hover:not(:disabled) {
  background-color: #365899;
}
</style>
