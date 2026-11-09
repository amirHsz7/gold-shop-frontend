export interface User {
  id: string
  fullName: string
  mobile: string
  role: 'ADMIN' | 'CUSTOMER'
}

const TOKEN_MAX_AGE = 60 * 15 

export const useUserStore = defineStore('user', () => {
  const accessToken = useCookie<string | null>('access_token', {
    default: () => null,
    maxAge: TOKEN_MAX_AGE,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  const user = ref<any>(null)

  const isLoggedIn = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setSession(payload: { accessToken: string, user: User }) {
    accessToken.value = payload.accessToken
    user.value = payload.user
  }

  async function fetchUser() {
    if (!accessToken.value) return
    const { $api } = useNuxtApp()
    const res = await $api<{ data: { userId: string, role: 'ADMIN' | 'CUSTOMER' } }>('/users/me')
    user.value = { id: res.data.userId, role: res.data.role }
  }

  function logout() {
    accessToken.value = null
    user.value = null
  }

  return { accessToken, user, isLoggedIn, isAdmin, setSession, fetchUser, logout }
})