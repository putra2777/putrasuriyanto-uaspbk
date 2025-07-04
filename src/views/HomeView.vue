<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';

// Daftar gambar latar belakang yang akan digunakan
// Pastikan Anda menempatkan gambar-gambar ini di folder `public` Anda
// Contoh: public/images/hero-bg-1.jpg, public/images/hero-bg-2.jpg, dll.
const backgroundImages = ref([
  'https://i.pinimg.com/736x/d2/78/89/d278899683dec398c0734e4e060ad44d.jpg', // GANTI DENGAN PATH GAMBAR ASLI ANDA
  'https://i.pinimg.com/736x/b6/57/6f/b6576f8269a3e8f520c85dffcad81e6d.jpg', // GANTI DENGAN PATH GAMBAR ASLI ANDA
  'https://i.pinimg.com/736x/74/bf/d3/74bfd377ba65c6ba3a4a3769264d2334.jpg'  // GANTI DENGAN PATH GAMBAR ASLI ANDA
]);

const currentImageIndex = ref(0);
let intervalId = null;

// Fungsi untuk mengganti gambar latar belakang
const changeBackground = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.value.length;
};

// Ketika komponen dimuat (mounted), mulai interval slider
onMounted(() => {
  // Mulai interval untuk mengganti gambar setiap 5 detik (5000 ms)
  intervalId = setInterval(changeBackground, 5000); // Ganti 5000 menjadi 4000 untuk 4 detik
});

// Ketika komponen dihapus (unmounted), bersihkan interval
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// Computed property untuk mendapatkan URL gambar latar belakang saat ini
const currentBackgroundStyle = ref({});

// Watcher untuk memperbarui style saat currentImageIndex berubah
// Menggunakan watchEffect untuk reaksi instan dan pembaruan awal
watchEffect(() => {
  currentBackgroundStyle.value = {
    backgroundImage: `url(${backgroundImages.value[currentImageIndex.value]})`
  };
});

// Data contoh untuk Kendaraan Pilihan
const featuredVehicles = ref([
  {
    id: 1,
    name: 'Toyota Avanza 2020',
    price: 'Rp 180.000.000',
    location: 'Jakarta',
    imageUrl: 'https://i.pinimg.com/736x/c6/94/27/c6942748a44631dc9897cfc21bd1b976.jpg' // GANTI DENGAN PATH GAMBAR ASLI ANDA
  },
  {
    id: 2,
    name: 'Honda Civic 2018',
    price: 'Rp 250.000.000',
    location: 'Bandung',
    imageUrl: 'https://i.pinimg.com/736x/03/42/1b/03421bf6604056dc245ee014e70fcf3e.jpg' // GANTI DENGAN PATH GAMBAR ASLI ANDA
  },
  {
    id: 3,
    name: 'Mitsubishi Pajero Sport 2021',
    price: 'Rp 480.000.000',
    location: 'Surabaya',
    imageUrl: 'https://i.pinimg.com/736x/a9/2c/8f/a92c8f24970944e1832bcac0ed7277c0.jpg' // GANTI DENGAN PATH GAMBAR ASLI ANDA
  },
  {
    id: 4,
    name: 'Yamaha NMAX 2022',
    price: 'Rp 32.000.000',
    location: 'Yogyakarta',
    imageUrl: 'https://i.pinimg.com/736x/68/e5/0d/68e50d8f3cc851a4c5de163133fcd265.jpg' // GANTI DENGAN PATH GAMBAR ASLI ANDA
  }
]);
</script>

<template>
  <main>
    <section class="hero-section" :style="currentBackgroundStyle">
      <div class="hero-content">
        <h1>Temukan Kendaraan Impian Anda!</h1>
        <p>Jual beli mobil dan motor bekas berkualitas dengan mudah dan aman.</p>
        <div class="hero-buttons">
          <button class="btn btn-primary">Lihat Semua Kendaraan</button>
          <button class="btn btn-secondary">Jual Kendaraan Anda</button>
        </div>
      </div>
    </section>

    <!-- Bagian Kendaraan Pilihan -->
    <section class="featured-vehicles-section">
      <h2>Kendaraan Pilihan</h2>
      <div class="vehicle-grid">
        <div v-for="vehicle in featuredVehicles" :key="vehicle.id" class="vehicle-card">
          <img :src="vehicle.imageUrl" :alt="vehicle.name" class="vehicle-image">
          <div class="vehicle-info">
            <h3>{{ vehicle.name }}</h3>
            <p class="vehicle-price">{{ vehicle.price }}</p>
            <span class="vehicle-location">{{ vehicle.location }}</span>
            <router-link :to="`/vehicles/${vehicle.id}`" class="btn btn-card">
            Lihat Detail</router-link>
          </div>
        </div>
      </div>
      <div class="view-more-container">
        <button class="btn btn-secondary-outline">Lihat Semua Kendaraan</button>
      </div>
    </section>

  </main>

  <footer>
    <p>&copy; 2025 JualBeliKendaraan.com. All rights reserved.</p>
  </footer>
</template>

<style scoped>
/* General Body & Font Styling */
body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f7f6;
    color: #333;
}

/* Hero Section Styling */
.hero-section {
    position: relative;
    height: 500px;
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    overflow: hidden;
    margin-top: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    transition: background-image 1s ease-in-out; /* Transisi untuk gambar latar belakang */
}

/* Overlay untuk kontras teks */
.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
    border-radius: 15px;
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    padding: 0 20px;
}

.hero-content h1 {
    font-size: 3.5em;
    margin-bottom: 15px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
}

.hero-content p {
    font-size: 1.3em;
    margin-bottom: 30px;
    line-height: 1.5;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
}

.hero-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.hero-buttons .btn {
    padding: 15px 30px;
    font-size: 1.1em;
    border-radius: 7px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-primary {
    background-color: #28a745;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
}

.btn-primary:hover {
    background-color: #218838;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
    box-shadow: 0 4px 6px rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
    background-color: white;
    color: #337ab7;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 255, 255, 0.3);
}

/* Styling untuk bagian footer */
footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 20px;
    margin-top: 40px;
    border-radius: 10px 10px 0 0;
}

/* Bagian Kendaraan Pilihan */
.featured-vehicles-section {
    padding: 40px 20px;
    max-width: 1200px;
    margin: 40px auto; /* Pusatkan dan berikan jarak */
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    text-align: center;
}

.featured-vehicles-section h2 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 30px;
    font-weight: bold;
}

.vehicle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
    gap: 25px;
    justify-content: center;
    margin-bottom: 30px;
}

.vehicle-card {
    background-color: #f9f9f9;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 15px;
}

.vehicle-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.vehicle-image {
    width: 100%;
    height: 200px; /* Tinggi gambar tetap */
    object-fit: cover; /* Pastikan gambar mengisi area tanpa terdistorsi */
    border-radius: 10px 10px 0 0;
}

.vehicle-info {
    padding: 15px;
    text-align: left;
    width: 100%; /* Pastikan info memenuhi lebar kartu */
}

.vehicle-info h3 {
    font-size: 1.4em;
    color: #337ab7;
    margin-top: 0;
    margin-bottom: 10px;
    white-space: nowrap; /* Mencegah teks terlalu panjang */
    overflow: hidden;
    text-overflow: ellipsis; /* Menambahkan elipsis jika teks terlalu panjang */
}

.vehicle-price {
    font-size: 1.2em;
    font-weight: bold;
    color: #28a745;
    margin-bottom: 8px;
}

.vehicle-location {
    font-size: 0.95em;
    color: #666;
    margin-bottom: 15px;
    display: block; /* Agar span mengambil baris baru */
}

.btn-card {
    background-color: #337ab7; /* Biru untuk tombol detail */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9em;
    width: 100%; /* Tombol memenuhi lebar kartu */
    margin-top: 10px;
}

.btn-card:hover {
    background-color: #2a6496;
}

.view-more-container {
    text-align: center;
    margin-top: 20px;
}

.btn-secondary-outline {
    background-color: transparent;
    color: #337ab7;
    border: 2px solid #337ab7;
    padding: 12px 25px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-secondary-outline:hover {
    background-color: #337ab7;
    color: white;
    box-shadow: 0 4px 8px rgba(51, 122, 183, 0.3);
}


/* Responsiveness */
@media (max-width: 768px) {
    .hero-section {
        height: 400px;
        margin-top: 10px;
    }
    .hero-content h1 {
        font-size: 2.5em;
    }
    .hero-content p {
        font-size: 1em;
    }
    .hero-buttons {
        flex-direction: column;
        gap: 10px;
    }
    .hero-buttons .btn {
        padding: 12px 25px;
        font-size: 1em;
        width: 80%;
    }

    .featured-vehicles-section {
        padding: 20px 10px;
        margin: 20px auto;
    }

    .featured-vehicles-section h2 {
        font-size: 2em;
        margin-bottom: 20px;
    }

    .vehicle-grid {
        grid-template-columns: 1fr; /* Satu kolom di mobile */
        gap: 20px;
    }

    .vehicle-image {
        height: 180px;
    }
}
</style>
