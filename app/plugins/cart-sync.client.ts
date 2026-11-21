import { useCartStore } from "~/stores/cart"

export default defineNuxtPlugin(() => {
  const userStore = useUserStore()
  const cartStore = useCartStore()

  watch(
    () => userStore.accessToken,
    async (token) => {
      if (!token) {
        cartStore.reset()
        return
      }

      try {
        await cartStore.fetchCart()
      }
      catch {
        // خطا در دریافت سبد نباید سایت را از کار بیندازد
      }
    },
    { immediate: true },
  )
})