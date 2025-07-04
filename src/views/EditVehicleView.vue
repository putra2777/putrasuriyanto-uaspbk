<template>
  <div class="container form-container">
    <h1>Edit Kendaraan</h1>
    <p v-if="loading">Memuat detail kendaraan...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <form @submit.prevent="handleSubmit" v-else-if="vehicle.id">
      <div class="form-group">
        <label for="brand">Merek:</label>
        <input type="text" id="brand" v-model="vehicle.brand" required class="form-control">
      </div>
      <div class="form-group">
        <label for="model">Model:</label>
        <input type="text" id="model" v-model="vehicle.model" required class="form-control">
      </div>
      <div class="form-group">
        <label for="year">Tahun:</label>
        <input type="number" id="year" v-model="vehicle.year" required class="form-control">
      </div>
      <div class="form-group">
        <label for="price">Harga (Rp):</label>
        <input type="number" id="price" v-model="vehicle.price" required class="form-control">
      </div>
      <div class="form-group">
        <label for="description">Deskripsi:</label>
        <textarea id="description" v-model="vehicle.description" rows="5" class="form-control"></textarea>
      </div>
      <div class="form-group">
        <label for="image">URL Gambar:</label>
        <input type="text" id="image" v-model="vehicle.image" class="form-control">
      </div>
      <button type="submit" :disabled="submitting" class="btn btn-primary">
        {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </button>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <router-link :to="{ name: 'my-vehicles' }" class="btn btn-secondary back-to-list">Kembali ke Daftar</router-link>
    </form>
    <div v-else class="error-message">
        <p>Kendaraan tidak ditemukan atau Anda tidak memiliki izin untuk mengeditnya.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Untuk validasi sellerId

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const vehicle = ref({
  id: null,
  brand: '',
  model: '',
  year: null,
  price: null,
  description: '',
  image: '',
  sellerId: '' // Pastikan ada untuk validasi
});

const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const successMessage = ref('');
const errorMessage = ref('');

const fetchVehicleForEdit = async (id) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:3001/vehicles/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    // Validasi apakah user yang login adalah pemilik kendaraan atau admin
    if (authStore.isLoggedIn && (authStore.user.role === 'admin' || authStore.user.id === data.sellerId)) {
      vehicle.value = data; // Isi form dengan data yang diambil
    } else {
      router.push({ name: 'home' }); // Redirect jika tidak punya izin
      alert('Anda tidak memiliki izin untuk mengedit kendaraan ini.');
      return;
    }

  } catch (err) {
    error.value = 'Gagal memuat detail kendaraan untuk diedit: ' + err.message;
    console.error('Error fetching vehicle for edit:', err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const response = await fetch(`http://localhost:3001/vehicles/${vehicle.value.id}`, {
      method: 'PUT', // Menggunakan PUT untuk memperbarui seluruh sumber daya
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicle.value) // Kirim seluruh objek vehicle
    });

    if (!response.ok) {
      throw new Error(`Gagal menyimpan perubahan. Status: ${response.status}`);
    }

    const result = await response.json();
    successMessage.value = 'Perubahan berhasil disimpan!';
    console.log('Kendaraan diperbarui:', result);
    // Opsional: Redirect kembali ke My Vehicles atau detail kendaraan
    // router.push({ name: 'my-vehicles' });

  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat menyimpan perubahan.';
    console.error('Error updating vehicle:', err);
  } finally {
    submitting.value = false;
  }
};

// Panggil fetch saat komponen dimuat atau ID di URL berubah
onMounted(() => {
  fetchVehicleForEdit(route.params.id);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchVehicleForEdit(newId);
    }
  }
);
</script>

<style scoped>
/* Gunakan styling yang sama dari SellVehicleView.vue untuk form-container, h1, form-group, form-control, btn, dll. */
/* Atau Anda bisa mengimpor file CSS yang sama jika mengaturnya sebagai global/reusable */

.form-container {
  max-width: 600px;
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
textarea.form-control {
  resize: vertical;
  min-height: 80px;
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
  margin-bottom: 10px; /* Tambahan margin untuk tombol kembali */
}
.btn-primary:hover:not(:disabled) {
  background-color: #218838;
}
.btn-secondary {
    background-color: #6c757d;
    color: white;
    width: 100%;
    display: block; /* Agar tampil seperti tombol blok */
    text-align: center; /* Agar teks di tengah */
    text-decoration: none; /* Hilangkan underline router-link */
}
.btn-secondary:hover {
    background-color: #5a6268;
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
.back-to-list {
    margin-top: 15px;
}
</style>