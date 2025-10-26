<template>
  <div class="login-box">
    <!-- Error -->
    <div v-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
      <button @click="initTelegramWidget" class="retry">Retry</button>
    </div>

    <!-- Loading / Button -->
    <div v-else-if="!loggedIn">
      <div id="telegram-login-button" class="telegram-login-container">
        <p v-if="!buttonLoaded">Loading login button...</p>
      </div>
    </div>

    <!-- Success -->
    <div v-else class="success">
      <p><strong>Accepted</strong></p>
      <p>You have successfully logged in.</p>
      <p><strong>Browser:</strong> {{ browser }}</p>
      <p><strong>IP:</strong> {{ ip }} ({{ location }})</p>
      <button @click="terminateSession" class="terminate">
        Terminate session
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      botUsername: 'ccn_assistant168_bot',
      loggedIn: false,
      buttonLoaded: false,
      error: '',
      ip: '',
      location: '',
      browser: '',
      userId: ''
    };
  },

  mounted() {
    // Safety net – make sure the global exists before the widget loads
    if (!window.onTelegramAuth) {
      window.onTelegramAuth = this.handleTelegramAuth;
    }
    this.initTelegramWidget();
  },

  methods: {
    initTelegramWidget() {
      this.error = '';
      this.buttonLoaded = false;

      const container = document.getElementById('telegram-login-button');
      if (!container) return;

      // Clean previous attempt
      container.innerHTML = '<p>Loading login button...</p>';

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', this.botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-corner-radius', '20');

      script.onload = () => {
        this.buttonLoaded = true;
        console.log('Telegram widget loaded');
      };

      script.onerror = () => {
        this.error =
          'Failed to load Telegram widget. Check BotFather domain and open the ngrok HTTPS URL.';
      };

      container.appendChild(script);
    },

    async handleTelegramAuth(user) {
      try {
        const res = await axios.post('http://localhost:3000/api/auth/telegram/login', user);
        if (res.status !== 200) throw new Error('Failed to log in');
        console.log('Login response:', res.data);
        const data = res.data;

        this.ip = data.ip;
        this.location = data.location;
        this.browser = data.browser || navigator.userAgent;
        this.userId = data.user.id;
        this.loggedIn = true;

      } catch (err) {
        this.error =
          'Login failed: ' +
          (err.response?.data?.message || err.message);
      }
    },

    async terminateSession() {
      await axios.get(`/api/auth/telegram/terminate?userId=${this.userId}`);
      this.loggedIn = false;
      alert('Session terminated');
    }

  }
};

</script>

<style scoped>
.login-box {
  margin: 2rem auto;
  max-width: 400px;
  text-align: center;
}
.error {
  border: 2px solid #f44336;
  background: #fff5f5;
  padding: 1rem;
  border-radius: 8px;
}
.retry {
  margin-top: .5rem;
  padding: .5rem 1rem;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.success {
  border: 2px solid #4caf50;
  background: #f9fff9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}
.terminate {
  margin-top: 1rem;
  padding: .5rem 1rem;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.terminate:hover { background: #d32f2f; }

</style>