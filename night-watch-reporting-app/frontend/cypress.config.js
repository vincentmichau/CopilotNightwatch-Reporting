const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    specPattern: 'cypress/integration/**/*.spec.js',
    supportFile: false
  }
})
