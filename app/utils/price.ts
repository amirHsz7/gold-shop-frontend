import type { ProductPrice, PublicProduct } from '~/types/product'

// مبلغ را با ارقام فارسی و جداکننده‌ی هزارگان نشان می‌دهد (مثل ۲۸,۵۰۰,۰۰۰)
export const formatToman = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value).replace(/٬/g, ',')

// وزن را با حداکثر ۳ رقم اعشار نشان می‌دهد (مثل ۲٫۵۶)
export const formatWeight = (value: number) =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 3 }).format(value)

// قیمت نمایشی از روی ستون‌های بکند؛ اگر بکند قیمتی نداده باشد null است
export const getApiPrice = (
  product: Pick<PublicProduct, 'minPrice' | 'maxPrice' | 'variants'>,
): ProductPrice | null => {
  const min = product.minPrice

  if (min === null || min === undefined) return null

  const cheapest = product.variants.find(variant => variant.price === min)
  const original = cheapest?.originalPrice ?? null

  return {
    final: min,
    original: original !== null && original > min ? original : null,
    isFrom: (product.maxPrice ?? min) > min,
  }
}