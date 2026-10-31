export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  const api = $fetch.create({
    // سمت سرور مستقیم به بک‌اند، سمت مرورگر از طریق پروکسی
    baseURL: import.meta.server
      ? config.apiServerUrl
      : config.public.apiBaseUrl,

    onRequest({ options }) {
      const headers = new Headers(options.headers)

      headers.set('Accept', 'application/json')

      if (userStore.accessToken) {
        headers.set('Authorization', `Bearer ${userStore.accessToken}`)
      }
      else {
        headers.delete('Authorization')
      }

      options.headers = headers
    },
  })

  return {
    provide: {
      api,
    },
  }
})