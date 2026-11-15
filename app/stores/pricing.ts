import { defineStore } from 'pinia'
import {
  DEFAULT_PRICING_SETTINGS,
  getProductPrice,
  type PriceableProduct,
  type PricingSettings,
} from '@/utils/pricing'

// قیمت هر گرم طلای ۱۸ عیار (تومان) و تنظیمات محاسبه‌ی قیمت
// فعلاً قیمت طلا دستی (از تنظیمات) می‌آید و بعد از خرید TGN از بکند گرفته می‌شود
export const usePricingStore = defineStore('pricing', () => {
  const config = useRuntimeConfig()
  const manual = Number(config.public.manualGoldPrice)

  const goldPricePerGram = ref<number | null>(manual > 0 ? manual : null)
  const settings = ref<PricingSettings>({ ...DEFAULT_PRICING_SETTINGS })
  const updatedAt = ref<string | null>(null)

  const hasGoldPrice = computed(
    () => goldPricePerGram.value !== null && goldPricePerGram.value > 0,
  )

  // قیمت نمایشی یک محصول؛ داخل computed کامپوننت‌ها با تغییر قیمت طلا یا تنظیمات خودکار به‌روز می‌شود
  const priceOf = (product: PriceableProduct) =>
    getProductPrice(product, goldPricePerGram.value, settings.value)

  const setGoldPrice = (value: number) => {
    goldPricePerGram.value = value > 0 ? value : null
    updatedAt.value = new Date().toISOString()
  }

  const setSettings = (value: Partial<PricingSettings>) => {
    settings.value = { ...settings.value, ...value }
  }

  return {
    goldPricePerGram,
    settings,
    updatedAt,
    hasGoldPrice,
    priceOf,
    setGoldPrice,
    setSettings,
  }
})