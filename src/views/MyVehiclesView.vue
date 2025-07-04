<template>
  <div class="container my-vehicles-container">
    <h1>Kendaraan Saya</h1>
    <p v-if="loading">Memuat kendaraan Anda...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <div v-else-if="myVehicles.length > 0" class="vehicles-grid">
      <div v-for="vehicle in myVehicles" :key="vehicle.id" class="vehicle-card">
        <img :src="vehicle.image" :alt="vehicle.model" class="vehicle-image" />
        <div class="vehicle-info">
          <h3>{{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})</h3>
          <p class="price">Harga: Rp {{ formatPrice(vehicle.price) }}</p>
        </div>
        <div class="vehicle-actions">
          <router-link :to="{ name: 'edit-vehicle', params: { id: vehicle.id } }" class="btn btn-edit">Edit</router-link>
          <button @click="confirmDelete(vehicle.id)" class="btn btn-delete">Hapus</button>
        </div>
      </div>
    </div>
    <div v-else class="no-vehicles-message">
      <p>Anda belum memiliki kendaraan yang dipasang untuk dijual.</p>
      <router-link to="/sell" class="btn btn-primary">Jual Kendaraan Sekarang</router-link>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <p>Anda yakin ingin menghapus kendaraan ini?</p>
        <div class="modal-buttons">
          <button @click="deleteVehicle" class="btn btn-delete-confirm" :disabled="deleting">
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
          <button @click="cancelDelete" class="btn btn-cancel">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const allVehicles = ref([]); // Menyimpan semua kendaraan yang di-fetch
const loading = ref(true);
const error = ref(null);

const showDeleteConfirm = ref(false);
const vehicleToDeleteId = ref(null);
const deleting = ref(false);

// Filter kendaraan berdasarkan sellerId dari user yang login
const myVehicles = computed(() => {
  if (!authStore.isLoggedIn || !authStore.user) {
    return [];
  }
  return allVehicles.value.filter(
    (vehicle) => vehicle.sellerId === authStore.user.id
  );
});

// Fungsi untuk mengambil semua kendaraan, lalu difilter di computed property
const fetchMyVehicles = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3001/vehicles');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    allVehicles.value = await response.json();
  } catch (err) {
    error.value = 'Gagal memuat daftar kendaraan Anda: ' + err.message;
    console.error('Error fetching my vehicles:', err);
  } finally {
    loading.value = false;
  }
};

// Fungsi konfirmasi hapus
const confirmDelete = (id) => {
  vehicleToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

// Fungsi batal hapus
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  vehicleToDeleteId.value = null;
};

// Fungsi hapus kendaraan
const deleteVehicle = async () => {
  if (!vehicleToDeleteId.value) return;

  deleting.value = true;
  try {
    const response = await fetch(`http://localhost:3001/vehicles/${vehicleToDeleteId.value}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Gagal menghapus kendaraan. Status: ${response.status}`);
    }

    // Hapus kendaraan dari daftar di UI tanpa perlu fetch ulang semua
    allVehicles.value = allVehicles.value.filter(
      (v) => v.id !== vehicleToDeleteId.value
    );
    console.log(`Kendaraan dengan ID ${vehicleToDeleteId.value} berhasil dihapus.`);
    alert('Kendaraan berhasil dihapus!'); // Notifikasi sederhana

  } catch (err) {
    error.value = err.message || 'Terjadi kesalahan saat menghapus kendaraan.';
    console.error('Error deleting vehicle:', err);
    alert('Gagal menghapus kendaraan: ' + err.message); // Notifikasi sederhana
  } finally {
    deleting.value = false;
    cancelDelete(); // Tutup modal konfirmasi
  }
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return 'N/A';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Panggil fetch saat komponen dimuat
onMounted(() => {
  if (authStore.isLoggedIn && authStore.user) {
    fetchMyVehicles();
  } else {
    error.value = 'Anda harus login sebagai penjual untuk melihat kendaraan Anda.';
    loading.value = false;
  }
});
</script>

<style scoped>
.my-vehicles-container {
  max-width: 960px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}
.vehicle-card {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.vehicle-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}
.vehicle-info {
  padding: 15px;
}
.vehicle-info h3 {
  font-size: 1.2em;
  margin-bottom: 5px;
  color: #333;
}
.vehicle-info .price {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1em;
}
.vehicle-actions {
  display: flex;
  gap: 10px;
  padding: 0 15px 15px;
  margin-top: auto; /* Push actions to bottom */
}
.btn {
  flex: 1; /* Make buttons take equal width */
  padding: 10px;
  text-align: center;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.btn-edit {
  background-color: #ffc107;
  color: #333;
}
.btn-edit:hover {
  background-color: #e0a800;
}
.btn-delete {
  background-color: #dc3545;
  color: white;
}
.btn-delete:hover {
  background-color: #c82333;
}
.no-vehicles-message {
  text-align: center;
  padding: 50px;
  color: #555;
}
.no-vehicles-message .btn-primary {
  margin-top: 20px;
  display: inline-block;
  width: auto;
  padding: 10px 20px;
}
.error-message {
  color: red;
  text-align: center;
  font-weight: bold;
  margin-top: 20px;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 300px;
}
.modal-content p {
  margin-bottom: 25px;
  font-size: 1.1em;
  color: #333;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}
.btn-delete-confirm {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
}
.btn-cancel {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
}
</style>