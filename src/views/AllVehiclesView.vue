<template>
  <div class="container">
    <h1>Semua Kendaraan Tersedia</h1>

    <div class="filter-controls">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari berdasarkan merek, model..."
        class="form-control search-input"
        @keyup.enter="applyFilters"
      />
      <select v-model="selectedYear" class="form-control filter-select" @change="applyFilters">
        <option value="">Semua Tahun</option>
        <option v-for="yearOption in availableYears" :key="yearOption" :value="yearOption">{{ yearOption }}</option>
      </select>
      <button @click="applyFilters" class="btn btn-filter">Terapkan Filter</button>
      <button @click="resetFilters" class="btn btn-secondary">Reset</button>
    </div>

    <p v-if="loading">Memuat kendaraan...</p>
    <p v-if="error" class="error-message">{{ error }}</p>
    <div v-else-if="vehicles.length > 0" class="vehicles-grid">
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
      <div class="vehicle-card-content">
        <img :src="vehicle.image" :alt="vehicle.model" class="vehicle-image" />
        <div class="vehicle-info">
          <h3>{{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})</h3>
          <p class="price">Harga: Rp {{ formatPrice(vehicle.price) }}</p>
          <router-link :to="{ name: 'vehicle-detail', params: { id: vehicle.id } }" class="btn btn-detail">Lihat Detail</router-link>
        </div>
      </div>
      </div>

    </div>
    <div v-else class="no-vehicles-message">
      <p>Tidak ada kendaraan yang ditemukan dengan kriteria pencarian ini.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const vehicles = ref([]);
const loading = ref(true);
const error = ref(null);

const searchQuery = ref('');
const selectedYear = ref('');

// Dapatkan daftar tahun unik dari data kendaraan yang ada (untuk filter dropdown)
const availableYears = computed(() => {
  const years = new Set(vehicles.value.map(v => v.year).filter(Boolean)); // filter(Boolean) untuk hapus null/undefined
  return [...years].sort((a, b) => b - a); // Urutkan dari tahun terbaru
});

const fetchVehicles = async () => {
  loading.value = true;
  error.value = null;
  vehicles.value = []; // Kosongkan dulu

  let url = 'https://27579367-a44f-4ba7-9bf1-059fc3a3cf64-00-38hegy5ahuasz.worf.replit.dev/vehicles';
  const params = new URLSearchParams(); // Untuk membangun query string

  // Tambahkan parameter pencarian
  if (searchQuery.value) {
    params.append('q', searchQuery.value); // 'q' untuk full-text search di json-server
  }

  // Tambahkan parameter filter tahun
  if (selectedYear.value) {
    params.append('year', selectedYear.value);
  }

  if (params.toString()) {
    url += '?' + params.toString();
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    vehicles.value = await response.json();
  } catch (err) {
    error.value = 'Gagal memuat daftar kendaraan: ' + err.message;
    console.error('Error fetching vehicles:', err);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  fetchVehicles(); // Panggil ulang fetch dengan parameter baru
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedYear.value = '';
  fetchVehicles(); // Panggil ulang fetch tanpa filter
};

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

onMounted(fetchVehicles);
</script>

<style scoped>
.vehicles-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Kartu kendaraan */
.vehicle-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.vehicle-card:hover {
  transform: scale(1.01);
}

/* Konten dalam kartu */
.vehicle-card-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px;
  gap: 20px;
}

/* Gambar kendaraan */
.vehicle-image {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

/* Info kendaraan di samping gambar */
.vehicle-info {
  flex-grow: 1;
}

.vehicle-info h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
}

.vehicle-info .price {
  font-weight: bold;
  margin-bottom: 10px;
}

/* Tombol */
.btn.btn-detail {
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 6px;
  display: inline-block;
}

.btn.btn-detail:hover {
  background-color: #0056b3;
}

/* Jika tidak ada kendaraan */
.no-vehicles-message {
  text-align: center;
  padding: 50px;
  color: #555;
}

/* Form Filter */
.filter-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  justify-content: center;
  flex-wrap: wrap;
}

.form-control {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  box-sizing: border-box;
}

.search-input {
  flex-grow: 1;
  min-width: 200px;
}

.filter-select {
  min-width: 150px;
}

.btn-filter, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.btn-filter {
  background-color: #007bff;
  color: white;
}

.btn-filter:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

</style>