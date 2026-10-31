import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/icon/module',
    '@pinia/nuxt'
  ],
  
  css: ['@/assets/css/main.css'],
  routeRules: {
    '/backend/**': { proxy: 'http://localhost:5000/**' },
  },

  runtimeConfig: {
    // فقط سمت سرور Nuxt استفاده میشه (SSR)
    apiServerUrl: 'http://localhost:5000',
    public: {
      // مرورگر از پروکسی رد میشه
      apiBaseUrl: '/backend',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  typescript: {
    strict: true,
  },
})