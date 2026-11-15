import type { ProductPrice, PublicVariant } from '~/types/product'

export type PricingSettings = {
  // درصد سود فروشنده، روی (طلای خام + اجرت)
  sellerProfitPercent: number
  // درصد مالیات بر ارزش افزوده، روی (اجرت + سود)
  vatPercent: number
  // تخفیف روی چه چیزی اعمال شود: 'total' کل قیمت یا 'fee' فقط اجرت
  discountBase: 'total' | 'fee'
  // اجرت ریالی (feeAmount) به ریال ثبت شده؟ اگر به تومان است false بماند
  feeAmountInRial: boolean
  // قیمت نهایی به نزدیک‌ترین مضرب این عدد (تومان) گرد می‌شود
  roundTo: number
}

// مقدارهای پیش‌فرض؛ باید با کارفرما و حسابدار تأیید شوند
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  sellerProfitPercent: 7,
  vatPercent: 10,
  discountBase: 'total',
  feeAmountInRial: false,
  roundTo: 1000,
}

type PriceVariant = Pick<PublicVariant, 'weight' | 'fee' | 'feeAmount'> & {
  stock?: number
}

export type PriceableProduct = {
  discountPercent: string | number
  variants: PriceVariant[]
}

const toNumber = (value: number | string | null | undefined) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

// قیمت یک وزن مشخص؛ همه‌ی مبالغ به تومان
export const calcVariantPrice = (
  variant: PriceVariant,
  goldPricePerGram: number,
  discountPercent = 0,
  settings: PricingSettings = DEFAULT_PRICING_SETTINGS,
) => {
  const weight = toNumber(variant.weight)
  const feePercent = toNumber(variant.fee)

  const feeAmount = settings.feeAmountInRial
    ? toNumber(variant.feeAmount) / 10
    : toNumber(variant.feeAmount)

  const roundPrice = (value: number) =>
    Math.round(value / settings.roundTo) * settings.roundTo

  // ارزش طلای خام
  const raw = weight * goldPricePerGram

  // feeFactor کسری از اجرت است که اعمال می‌شود (برای تخفیفِ روی اجرت)
  const build = (feeFactor: number) => {
    const fee = ((raw * feePercent) / 100 + feeAmount) * feeFactor
    const profit = ((raw + fee) * settings.sellerProfitPercent) / 100
    const vat = ((fee + profit) * settings.vatPercent) / 100

    return raw + fee + profit + vat
  }

  const original = build(1)
  const rate = Math.min(Math.max(discountPercent, 0), 100) / 100

  const discounted
    = settings.discountBase === 'fee' ? build(1 - rate) : original * (1 - rate)

  return { final: roundPrice(discounted), original: roundPrice(original) }
}

// قیمت نمایشی محصول (کمترین قیمت بین وزن‌ها)؛ بدون قیمت طلا یا بدون وزن null است
export const getProductPrice = (
  product: PriceableProduct,
  goldPricePerGram: number | null,
  settings: PricingSettings = DEFAULT_PRICING_SETTINGS,
): ProductPrice | null => {
  if (!goldPricePerGram || goldPricePerGram <= 0) return null

  // وزن‌های موجود اولویت دارند؛ اگر هیچ‌کدام موجود نبود، همه حساب می‌شوند
  const available = product.variants.filter(variant => (variant.stock ?? 1) > 0)
  const candidates = available.length > 0 ? available : product.variants

  if (candidates.length === 0) return null

  const discount = toNumber(product.discountPercent)

  const prices = candidates.map(variant =>
    calcVariantPrice(variant, goldPricePerGram, discount, settings),
  )

  const cheapest = prices.reduce((min, price) =>
    price.final < min.final ? price : min,
  )

  const highest = Math.max(...prices.map(price => price.final))

  return {
    final: cheapest.final,
    original: cheapest.original > cheapest.final ? cheapest.original : null,
    isFrom: highest > cheapest.final,
  }
}