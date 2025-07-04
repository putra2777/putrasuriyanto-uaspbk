// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Pastikan ini diimpor
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia() // Buat instance Pinia terlebih dahulu

app.use(pinia) // Gunakan Pinia
app.use(router) // Kemudian gunakan Router

app.mount('#app')