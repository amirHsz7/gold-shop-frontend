
export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null as string | null,
    otp: {
      mobile: null as string | null,
      pending: false as boolean
    }
  }),

  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token
    },
  },
})
