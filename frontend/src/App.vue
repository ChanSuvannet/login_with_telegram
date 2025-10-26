<template>
  <div class="container">
    <h1>Telegram Login</h1>
    <TelegramLogin />
  </div>
</template>

<script>
import TelegramLogin from './components/TelegramLogin.vue';

export default {
  components: { TelegramLogin }
};
</script>

<style>
.container {
  max-width: 420px;
  margin: 3rem auto;
  text-align: center;
  font-family: Arial, sans-serif;
}
</style>