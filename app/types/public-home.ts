import type { PublicProduct } from '~/types/product'
import type { PublicCategory, PublicCollection } from '~/types/site'

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

export type PublicHomeBannersSection = {
  id: string
  type: 'BANNERS'
  title: string | null
  subtitle: string | null
  // تعداد ستون بنرها (۱ تا ۴)
  columns: number
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

export type PublicHomeCategoriesSection = {
  id: string
  type: 'CATEGORIES'
  title: string | null
  subtitle: string | null
  items: PublicCategory[]
}

export type PublicHomeCollectionsSection = {
  id: string
  type: 'COLLECTIONS'
  title: string | null
  subtitle: string | null
  items: PublicCollection[]
}

export type PublicTestimonial = {
  id: string
  body: string
  // نظر بدون امتیاز هم ممکن است
  rating: number | null
  createdAt: string
  // فقط اسم کوچک نویسنده
  author: { name: string }
  product: { id: string; name: string; slug: string }
}

export type PublicHomeTestimonialsSection = {
  id: string
  type: 'TESTIMONIALS'
  title: string | null
  subtitle: string | null
  items: PublicTestimonial[]
}

export type PublicHomeMapSection = {
  id: string
  type: 'MAP'
  title: string | null
  subtitle: string | null
  location: { latitude: number; longitude: number }
  address: string | null
  phones: string[]
  workingHours: string | null
}

export type PublicHomeSection =
  | PublicHomeSliderSection
  | PublicHomeBannersSection
  | PublicHomeProductsSection
  | PublicHomeCategoriesSection
  | PublicHomeCollectionsSection
  | PublicHomeTestimonialsSection
  | PublicHomeMapSection