import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // Tambahkan atau ubah properti 'base' di sini
  // Mengatur base menjadi '' akan membuat path aset menjadi relatif terhadap index.html
  base: '', // PENTING: Tambahkan baris ini!

  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Pastikan tidak ada build.rollupOptions.output.assetFileNames atau chunkFileNames yang menimpa base
  build: {
    rollupOptions: {
      output: {
        // Ini memastikan nama file aset dan chunk menggunakan path relatif
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
