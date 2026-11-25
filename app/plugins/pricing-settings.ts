
import type { GoldPriceStatus } from '~/stores/pricing'

export default defineNuxtPlugin(async (nuxtApp) => {
  const pricing = usePricingStore()

  if (pricing.settingsLoaded) return

  try {
    const res = await nuxtApp.$api<{
      data: {
        sellerProfitPercent: number
        vatPercent: number
        goldPricePerGram: number | null
        goldPriceStatus: GoldPriceStatus
      }
    }>('/pricing-settings')

    const data = res.data

    if (
      data.goldPriceStatus !== 'AVAILABLE' &&
      data.goldPriceStatus !== 'UNAVAILABLE'
    ) {
      throw new Error('Invalid gold price status')
    }

    pricing.setSettings({
      sellerProfitPercent: data.sellerProfitPercent,
      vatPercent: data.vatPercent,
    })

    const hasValidGoldPrice =
      typeof data.goldPricePerGram === 'number' &&
      Number.isFinite(data.goldPricePerGram) &&
      data.goldPricePerGram > 0

    // قیمت قبلی را در صورت دریافت null یا مقدار نامعتبر پاک نمی‌کنیم
    if (hasValidGoldPrice) {
      pricing.setGoldPrice(data.goldPricePerGram!)
    }

    // AVAILABLE فقط با وجود قیمت معتبر پذیرفته می‌شود
    pricing.setGoldPriceStatus(
      data.goldPriceStatus === 'AVAILABLE' && hasValidGoldPrice
        ? 'AVAILABLE'
        : 'UNAVAILABLE',
    )

    pricing.settingsLoaded = true
  }
  catch {
    // در صورت خطا، خرید مجاز نیست؛ قیمت قبلی نیز حذف نمی‌شود
    pricing.setGoldPriceStatus('UNAVAILABLE')
  }
})
