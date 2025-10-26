// frontend/vue.config.js
module.exports = {
  devServer: {
    // REMOVE THIS LINE:
    // https: true,

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        headers: {
          host: 'a68eebebfc3c.ngrok-free.app'  // ← UPDATE TO CURRENT ngrok URL
        }
      },
    },
    allowedHosts: 'all',
    hot: false,
    liveReload: false,
    webSocketServer: false
  },
}