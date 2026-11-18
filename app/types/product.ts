// قیمت نهایی محصول؛ بعد از ساخت ماژول قیمت از API می‌آید
export type ProductPrice = {
  final: number
  // قیمت قبل از تخفیف (اگر تخفیف دارد)
  original?: number | null
  // وزن‌های مختلف قیمت‌های متفاوت دارند و این کمترین آن‌هاست
  isFrom?: boolean
}

export type PublicVariant = {
  id: string
  label: string | null
  sku: string | null
  weight: string
  fee: string
  feeAmount: string
  stock: number
}

export type PublicProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  metaTitle: string | null
  metaDescription: string | null
  // فیلدهای اعشاری در API عمومی رشته هستند
  minWeight: string
  maxWeight: string
  discountPercent: string
  isFeatured: boolean
  createdAt: string
  totalStock: number
  inStock: boolean
  rating: { average: number; count: number }
  category: {
    id: string
    name: string
    slug: string
    parent: { id: string; name: string; slug: string } | null
  }
  collection: { id: string; name: string; slug: string } | null
  images: { id: string; alt: string | null; url: string }[]
  variants: PublicVariant[]
  // اگر API قیمت نهایی را بدهد، به‌جای محاسبه‌ی فرانت استفاده می‌شود
  price?: ProductPrice
}