<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Pastikan path ini benar ke file firebase.js Anda

// Ref untuk menyimpan data pengguna yang diambil dari Firestore
const usersData = ref([]);
// Ref untuk menyimpan data satu dokumen pengguna (misalnya, untuk profil)
const singleUserData = ref(null);
// Ref untuk menyimpan data kendaraan
const vehiclesData = ref([]);

// Fungsi untuk mengambil semua dokumen dari koleksi 'users'
const fetchAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      // Mengambil data dokumen dan menambahkannya ke array
      // doc.data() mengembalikan objek JavaScript biasa (JSON-like)
      users.push({ id: doc.id, ...doc.data() });
    });
    usersData.value = users;
    console.log("Data semua pengguna dari Firestore (JSON):", usersData.value);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Fungsi untuk mengambil satu dokumen pengguna berdasarkan UID
const fetchSingleUser = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Mengambil data dokumen tunggal
      singleUserData.value = { id: docSnap.id, ...docSnap.data() };
      console.log("Data pengguna tunggal dari Firestore (JSON):", singleUserData.value);
    } else {
      console.log("Dokumen pengguna tidak ditemukan!");
      singleUserData.value = null;
    }
  } catch (error) {
    console.error("Error fetching single user:", error);
  }
};

// Fungsi untuk mengambil semua dokumen dari koleksi 'vehicles'
const fetchAllVehicles = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "vehicles"));
    const vehicles = [];
    querySnapshot.forEach((doc) => {
      vehicles.push({ id: doc.id, ...doc.data() });
    });
    vehiclesData.value = vehicles;
    console.log("Data semua kendaraan dari Firestore (JSON):", vehiclesData.value);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
  }
};


// Panggil fungsi saat komponen dimuat
onMounted(() => {
  fetchAllUsers();
  // Contoh: Ambil data pengguna tunggal (Anda bisa mengganti UID ini dengan UID pengguna yang sedang login)
  // fetchSingleUser("u5ickEv3gpogf45IDuRh0WkKxEmq2"); // Ganti dengan UID yang valid dari Firestore Anda
  fetchAllVehicles();
});

// Anda bisa menambahkan logika lain di sini,
// misalnya fungsi untuk mengirim data ini ke JSON Server jika memang diperlukan
const sendUsersToJsonServer = async () => {
  try {
    // Contoh: Mengirim data pengguna yang diambil dari Firestore ke JSON Server Anda
    // Ini hanya contoh, Anda mungkin perlu menyesuaikan endpoint dan metode
    const response = await fetch('http://localhost:3001/users', {
      method: 'POST', // Atau 'PUT'/'PATCH' jika memperbarui
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usersData.value) // Mengirim data yang sudah dalam format JSON
    });

    if (!response.ok) {
      throw new Error(`Gagal mengirim data ke JSON Server. Status: ${response.status}`);
    }
    console.log("Data berhasil dikirim ke JSON Server!");
  } catch (error) {
    console.error("Error sending data to JSON Server:", error);
  }
};

</script>

<template>
  <div class="firestore-data-viewer">
    <h2>Data Pengguna dari Firestore</h2>
    <div v-if="usersData.length > 0">
      <pre>{{ JSON.stringify(usersData, null, 2) }}</pre>
    </div>
    <div v-else>
      <p>Memuat data pengguna...</p>
    </div>

    <h2>Data Kendaraan dari Firestore</h2>
    <div v-if="vehiclesData.length > 0">
      <pre>{{ JSON.stringify(vehiclesData, null, 2) }}</pre>
    </div>
    <div v-else>
      <p>Memuat data kendaraan...</p>
    </div>

    <!-- Tombol untuk mengirim data ke JSON Server (opsional) -->
    <button @click="sendUsersToJsonServer" :disabled="usersData.length === 0">
      Kirim Data Pengguna ke JSON Server
    </button>
  </div>
</template>

<style scoped>
.firestore-data-viewer {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
  color: #333;
  margin-bottom: 15px;
}

pre {
  background-color: #eef;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.4;
  white-space: pre-wrap; /* Memastikan teks wrap */
  word-wrap: break-word; /* Memastikan kata wrap */
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
