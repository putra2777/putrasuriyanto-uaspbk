<template>
  <div class="container form-container">
    <h1>Jual Kendaraan Anda</h1>
    <p v-if="!authStore.isLoggedIn" class="error-message">Anda harus login untuk menjual kendaraan.</p>
    <p v-else-if="authStore.user.role !== 'seller' && authStore.user.role !== 'admin'" class="error-message">Hanya penjual atau admin yang bisa menambah kendaraan.</p>
    <form @submit.prevent="handleSubmit" v-else>
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
        <input type="text" id="image" v-model="vehicle.image" placeholder="https://via.placeholder.com/300x200" class="form-control">
      </div>
      <button type="submit" :disabled="loading" class="btn btn-primary">
        {{ loading ? 'Mengunggah...' : 'Unggah Kendaraan' }}
      </button>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Untuk mendapatkan sellerId

const authStore = useAuthStore();
const router = useRouter();

const vehicle = ref({
  brand: '',
  model: '',
  year: null,
  price: null,
  description: '',
  image: ''
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  if (!authStore.isLoggedIn || (authStore.user.role !== 'seller' && authStore.user.role !== 'admin')) {
    errorMessage.value = 'Anda tidak memiliki izin untuk mengunggah kendaraan.';
    loading.value = false;
    return;
  }

  // Tambahkan sellerId dari user yang login
  const newVehicle = {
    ...vehicle.value,
    id: Date.now().toString(), // ID unik sederhana untuk json-server
    sellerId: authStore.user.id
  };

  try {
    const response = await fetch('https://27579367-a44f-4ba7-9bf1-059fc3a3cf64-00-38hegy5ahuasz.worf.replit.dev/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newVehicle)
    });

    if (!response.ok) {
      throw new Error(`Gagal mengunggah kendaraan. Status: ${response.status}`);
    }

    const result = await response.json();
    successMessage.value = 'Kendaraan berhasil diunggah!';
    console.log('Kendaraan baru:', result);

    // Opsional: Reset form atau arahkan ke halaman detail kendaraan baru
    vehicle.value = {
      brand: '', model: '', year: null, price: null, description: '', image: ''
    };
    // router.push({ name: 'vehicle-detail', params: { id: result.id } });

  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat mengunggah kendaraan.';
    console.error('Error adding vehicle:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
</style>