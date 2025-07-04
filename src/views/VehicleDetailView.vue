<template>
  <div class="container vehicle-detail-container">
    <router-link to="/vehicles" class="back-link">&larr; Kembali ke Daftar Kendaraan</router-link>

    <h1 v-if="loading">Memuat detail kendaraan...</h1>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <p>Gagal memuat detail kendaraan. Mohon coba lagi nanti.</p>
    </div>
    <div v-else-if="vehicle" class="detail-card">
      <img :src="vehicle.image" :alt="vehicle.model" class="detail-image" />
      <div class="detail-content">
        <h2>{{ vehicle.brand }} {{ vehicle.model }}</h2>
        <p class="detail-price">Harga: Rp {{ formatPrice(vehicle.price) }}</p>
        <p><strong>Tahun:</strong> {{ vehicle.year }}</p>
        <p><strong>Deskripsi:</strong> {{ vehicle.description }}</p>
        <p class="seller-info">Dijual oleh: {{ sellerUsername }}</p>
        <router-link :to="`/chat/${vehicle.id}`" class="btn btn-primary contact-button">
        Hubungi Penjual</router-link>

      </div>
    </div>
    <div v-else class="not-found-message">
      <p>Kendaraan tidak ditemukan.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'; // Gunakan useRoute untuk akses params
// Jika Anda ingin menampilkan nama penjual, Anda perlu fetch data user juga
// import { useAuthStore } from '@/stores/auth'; // Hanya jika perlu akses user login atau data user lain

const route = useRoute(); // Inisialisasi useRoute
const vehicle = ref(null);
const loading = ref(true);
const error = ref(null);
const sellerUsername = ref('Memuat...'); // Untuk menampilkan username penjual

// Fungsi untuk mengambil detail kendaraan
const fetchVehicleDetail = async (id) => {
  loading.value = true;
  error.value = null;
  vehicle.value = null; // Reset vehicle data
  sellerUsername.value = 'Memuat...'; // Reset seller info

  try {
    const response = await fetch(`http://localhost:3001/vehicles/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    vehicle.value = data;

    // Ambil data penjual untuk menampilkan username
    if (vehicle.value.sellerId) {
      const sellerResponse = await fetch(`http://localhost:3001/users/${vehicle.value.sellerId}`);
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        sellerUsername.value = sellerData.username || 'Tidak Diketahui';
      } else {
        sellerUsername.value = 'Tidak Diketahui';
      }
    } else {
      sellerUsername.value = 'Tidak Tersedia';
    }

  } catch (err) {
    error.value = 'Gagal memuat detail kendaraan: ' + err.message;
    console.error('Error fetching vehicle detail:', err);
  } finally {
    loading.value = false;
  }
};

// Fungsi format harga
const formatPrice = (price) => {
  if (price === undefined || price === null) return 'N/A';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Panggil fetchVehicleDetail saat komponen dimuat
onMounted(() => {
  fetchVehicleDetail(route.params.id);
});

// Watcher untuk memanggil fetch ulang jika ID di URL berubah (misalnya navigasi dari detail ke detail lain)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) { // Pastikan ID ada
      fetchVehicleDetail(newId);
    }
  }
);
</script>

<style scoped>
.vehicle-detail-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 25px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-link {
  align-self: flex-start; /* Posisikan di kiri atas */
  margin-bottom: 20px;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s ease;
}
.back-link:hover {
  color: #0056b3;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.detail-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.detail-content {
  padding: 10px;
}

.detail-content h2 {
  font-size: 2.2em;
  margin-bottom: 10px;
  color: #333;
}

.detail-price {
  font-size: 1.8em;
  color: #28a745;
  font-weight: bold;
  margin-bottom: 15px;
}

.detail-content p {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 10px;
  color: #555;
}

.seller-info {
    font-style: italic;
    color: #777;
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 10px;
}

.contact-button {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 25px;
  font-size: 1.1em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-button:hover {
  background-color: #0056b3;
}

.error-message, .not-found-message {
  text-align: center;
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
.not-found-message {
    color: #777;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .detail-card {
    flex-direction: row;
  }
  .detail-image {
    width: 45%;
    max-height: none;
  }
  .detail-content {
    width: 55%;
    padding-left: 30px;
  }
}
</style>