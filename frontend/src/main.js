import { createApp } from 'vue';
import App from './App.vue';

// Global fallback – guarantees the function exists even if the widget loads early
if (!window.onTelegramAuth) {
  window.onTelegramAuth = () => console.warn('Telegram auth not wired yet');
}

createApp(App).mount('#app');