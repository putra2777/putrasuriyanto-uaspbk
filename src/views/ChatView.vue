<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const vehicleId = route.params.vehicleId;

const messages = ref([]);
const newMessage = ref('');

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;

  // Tambah pesan pengguna
  messages.value.push({
    sender: 'Anda',
    text: newMessage.value.trim()
  });

  const userMessage = newMessage.value;
  newMessage.value = '';

  // Simulasi balasan otomatis dari penjual
  setTimeout(() => {
    messages.value.push({
      sender: 'Penjual',
      text: `Terima kasih atas pertanyaannya: "${userMessage}"`
    });
  }, 1000);
};
</script>

<template>
  <div class="chat-container">
    <h2>Chat Kendaraan ID: {{ vehicleId }}</h2>

    <div class="chat-box">
      <div v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.sender }}:</strong> {{ msg.text }}
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="chat-form">
      <input type="text" v-model="newMessage" placeholder="Ketik pesan..." />
      <button type="submit">Kirim</button>
    </form>
  </div>
</template>

<style scoped>
.chat-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  max-width: 600px;
  margin: 30px auto;
  background-color: #fff;
}
.chat-box {
  background-color: #f8f8f8;
  padding: 15px;
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.chat-form {
  display: flex;
}
.chat-form input {
  flex: 1;
  padding: 8px;
}
.chat-form button {
  padding: 8px 15px;
}
</style>
