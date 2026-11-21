import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/icon/module',
    '@pinia/nuxt'
  ],
  
  css: ['@/assets/css/main.css'],
  icon: {
    // آیکون‌ها از مسیری غیر از /api گرفته شوند (آن مسیر به بک‌اند پروکسی می‌شود)
    localApiEndpoint: '/_nuxt_icon',
    // آیکون‌های استفاده‌شده در پروژه داخل باندل می‌روند؛ نیازی به درخواست جدا نیست
    clientBundle: { scan: true },
    // سایت روی سرور ایران است؛ به API عمومی iconify وصل نشود
    fallbackToApi: false,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
    },
  },
  routeRules: {
    '/backend/**': { proxy: 'http://localhost:5000/**' },
  },

  runtimeConfig: {
    // فقط سمت سرور Nuxt استفاده میشه (SSR)
    apiServerUrl: 'http://localhost:5000',
    
    public: {
      // آدرس نهایی سایت بدون اسلش آخر، برای canonical و تصویر شبکه‌های اجتماعی
      siteUrl: '',
      // مرورگر از پروکسی رد میشه
      apiBaseUrl: '/backend',
      manualGoldPrice: 0,
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