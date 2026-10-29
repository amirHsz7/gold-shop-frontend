import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/icon/module',
    '@pinia/nuxt'
  ],
  
  css: ['@/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },
})