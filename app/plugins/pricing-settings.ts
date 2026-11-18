// درصد سود و مالیات را از بکند می‌گیرد؛ اگر نشد، همان پیش‌فرض‌های فرانت می‌ماند
export default defineNuxtPlugin(async (nuxtApp) => {
  const pricing = usePricingStore()

  // بعد از SSR مقدار از payload آمده و دوباره گرفتن لازم نیست
  if (pricing.settingsLoaded) return

  try {
    const res = await nuxtApp.$api<{
      data: { sellerProfitPercent: number, vatPercent: number }
    }>('/pricing-settings')

    pricing.setSettings({
      sellerProfitPercent: res.data.sellerProfitPercent,
      vatPercent: res.data.vatPercent,
    })
    pricing.settingsLoaded = true
  }
  catch {
    // خطا در دریافت تنظیمات نباید کل سایت را از کار بیندازد
  }
})