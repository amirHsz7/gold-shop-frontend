// درصد سود، مالیات و قیمت طلا را از بکند می‌گیرد؛ اگر نشد، پیش‌فرض‌های فرانت می‌ماند
export default defineNuxtPlugin(async (nuxtApp) => {
  const pricing = usePricingStore()

  // بعد از SSR مقدار از payload آمده و دوباره گرفتن لازم نیست
  if (pricing.settingsLoaded) return

  try {
    const res = await nuxtApp.$api<{
      data: {
        sellerProfitPercent: number
        vatPercent: number
        goldPricePerGram: number | null
      }
    }>('/pricing-settings')

    pricing.setSettings({
      sellerProfitPercent: res.data.sellerProfitPercent,
      vatPercent: res.data.vatPercent,
    })

    if (res.data.goldPricePerGram) {
      pricing.setGoldPrice(res.data.goldPricePerGram)
    }

    pricing.settingsLoaded = true
  }
  catch {
    // خطا در دریافت تنظیمات نباید کل سایت را از کار بیندازد
  }
})