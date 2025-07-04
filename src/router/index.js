import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import store autentikasi Pinia Anda

// Import komponen-komponen utama
import HomeView from '../views/HomeView.vue';
import AllVehiclesView from '../views/AllVehiclesView.vue';
import VehicleDetailView from '../views/VehicleDetailView.vue';
import SellVehicleView from '../views/SellVehicleView.vue';
import MyVehiclesView from '../views/MyVehiclesView.vue';
import EditVehicleView from '../views/EditVehicleView.vue';
import ProfileView from '../views/ProfileView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import NotFoundView from '../views/NotFoundView.vue';

// Import komponen FirestoreViewer yang baru Anda buat
import FirestoreViewer from '../views/FirestoreViewer.vue'; // Pastikan path ini benar!

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView, // Menggunakan import langsung
  },
  {
    path: '/vehicles',
    name: 'all-vehicles',
    component: AllVehiclesView,
  },
  {
    path: '/vehicles/:id',
    name: 'vehicle-detail',
    component: VehicleDetailView,
    props: true,
  },
  {
    path: '/sell',
    name: 'sell-vehicle',
    component: SellVehicleView,
    meta: { requiresAuth: true, requiresSeller: true }
  },
  {
  path: '/chat/:vehicleId',
  name: 'ChatView',
  component: () => import('@/views/ChatView.vue'),
  meta: { requiresAuth: true } // Jika hanya login user boleh chat
},

{
    path: '/my-vehicles',
    name: 'my-vehicles',
    component: MyVehiclesView,
    meta: { requiresAuth: true, requiresSeller: true }
  },
  {
    path: '/my-vehicles/edit/:id',
    name: 'edit-vehicle',
    component: EditVehicleView,
    props: true,
    meta: { requiresAuth: true, requiresSeller: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  // Rute baru untuk melihat data Firestore
  {
    path: '/firestore-data', // URL yang akan Anda akses di browser
    name: 'FirestoreData',
    component: FirestoreViewer, // Menggunakan komponen FirestoreViewer
  },
  // Catch-all route for 404
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundView,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// Navigation Guard: Melindungi rute yang memerlukan autentikasi/role tertentu
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Ambil instance authStore
  const isLoggedIn = authStore.isLoggedIn;
  const userRole = authStore.user ? authStore.user.role : null;

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Jika rute butuh login tapi belum login, redirect ke login
    next({ name: 'login' });
  } else if (to.meta.requiresSeller && userRole !== 'seller' && userRole !== 'admin') {
    // Jika rute butuh seller/admin tapi role tidak sesuai, redirect ke home
    next({ name: 'home' });
  } else {
    // Lanjutkan navigasi
    next();
  }
});

export default router;
