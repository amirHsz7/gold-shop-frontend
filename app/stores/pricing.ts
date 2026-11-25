
import { defineStore } from 'pinia'
import {
  DEFAULT_PRICING_SETTINGS,
  getProductPrice,
  type PriceableProduct,
  type PricingSettings,
} from '@/utils/pricing'

export type GoldPriceStatus = 'AVAILABLE' | 'UNAVAILABLE'

export const usePricingStore = defineStore('pricing', () => {
  const settingsLoaded = ref(false)

  // قیمت فقط از Backend دریافت می‌شود؛ نه از manualGoldPrice فرانت
  const goldPricePerGram = ref<number | null>(null)

  // تا زمانی که Backend سلامت قیمت را تأیید نکرده، وضعیت unavailable است
  const goldPriceStatus = ref<GoldPriceStatus>('UNAVAILABLE')

  const settings = ref<PricingSettings>({ ...DEFAULT_PRICING_SETTINGS })
  const updatedAt = ref<string | null>(null)

  const hasGoldPrice = computed(
    () => goldPricePerGram.value !== null && goldPricePerGram.value > 0,
  )

  // وجود قیمت به‌تنهایی به معنی امکان خرید نیست
  const canCheckout = computed(
    () => goldPriceStatus.value === 'AVAILABLE' && hasGoldPrice.value,
  )

  const priceOf = (product: PriceableProduct) =>
    getProductPrice(product, goldPricePerGram.value, settings.value)

  const setGoldPrice = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return

    goldPricePerGram.value = value
    updatedAt.value = new Date().toISOString()
  }

  const setGoldPriceStatus = (value: GoldPriceStatus) => {
    goldPriceStatus.value = value
  }

  const setSettings = (value: Partial<PricingSettings>) => {
    settings.value = { ...settings.value, ...value }
  }

  return {
    goldPricePerGram,
    goldPriceStatus,
    settings,
    updatedAt,
    settingsLoaded,
    hasGoldPrice,
    canCheckout,
    priceOf,
    setGoldPrice,
    setGoldPriceStatus,
    setSettings,
  }
})
