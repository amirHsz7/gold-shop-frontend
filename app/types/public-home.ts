import type { PublicProduct } from '~/types/product'

export type PublicHomeImageItem = {
  id: string
  alt: string | null
  title: string | null
  subtitle: string | null
  buttonText: string | null
  linkUrl: string | null
  imageUrl: string
  mobileImageUrl: string | null
}

export type PublicHomeSliderSection = {
  id: string
  type: 'SLIDER'
  title: string | null
  subtitle: string | null
  // ۰ یعنی بدون پخش خودکار
  autoplayMs: number
  items: PublicHomeImageItem[]
}

export type PublicHomeProductsSection = {
  id: string
  type: 'PRODUCTS'
  title: string | null
  subtitle: string | null
  source: 'featured' | 'newest' | 'discount'
  // پارامترهای لینک «مشاهده همه» به صفحه‌ی محصولات
  viewAll: Record<string, string>
  items: PublicProduct[]
}

// بخش‌های دیگر (بنر، دسته‌ها و...) در مرحله‌های بعد تایپ دقیق می‌گیرند
export type PublicHomeOtherSection = {
  id: string
  type: 'BANNERS' | 'CATEGORIES' | 'COLLECTIONS' | 'TESTIMONIALS' | 'MAP'
  title: string | null
  subtitle: string | null
}

export type PublicHomeSection =
  | PublicHomeSliderSection
  | PublicHomeProductsSection
  | PublicHomeOtherSection