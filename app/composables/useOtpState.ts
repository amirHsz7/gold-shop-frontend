export type OtpState = {
  mobile: string
  purpose: 'LOGIN' | 'REGISTER'
}

export function useOtpState() {
  return useState<OtpState | null>('otp-state', () => null)
}