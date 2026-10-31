type LoginResponse = {
  message: string
  status: string
}
type RegisterResponse = {
  message: string
  status: string
}

type RegisterPayload = {
  mobile: string
  fullName: string
}

type LoginPayload = {
  mobile: string
}

type VerifyOtpPayload = {
  mobile: string
  code: string
  purpose: 'LOGIN' | 'REGISTER'
}

export function authRepository() {
  const { $api } = useNuxtApp()

  function login(payload: LoginPayload) {
    return $api<LoginResponse>('/auth/login', {
      method: 'post',
      body: payload,
    })
  }

  function register(payload: RegisterPayload) {
    return $api<RegisterResponse>('/auth/register', {
      method: 'post',
      body: payload,
    })
  }

  function verifyOtp(payload: VerifyOtpPayload) {
    return $api<any>('/auth/verify-otp', {
      method: 'post',
      body: payload,
    })
  }

  return {
    login,
    register,
    verifyOtp
  }
}