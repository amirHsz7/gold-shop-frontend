export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn) {
    return navigateTo('/login')
  }

  if (!userStore.user) {
    try {
      await userStore.fetchUser()
    }
    catch {
      userStore.logout()
      return navigateTo('/login')
    }
  }

  if (!userStore.isAdmin) {
    return navigateTo('/')
  }
})