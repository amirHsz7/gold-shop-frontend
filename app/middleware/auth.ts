export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn) {
    useState<string | null>('redirect-after-login').value = to.fullPath
    return navigateTo('/login')
  }
})