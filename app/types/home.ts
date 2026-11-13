export type HomeSectionType =
  | 'SLIDER'
  | 'BANNERS'
  | 'PRODUCTS'
  | 'CATEGORIES'
  | 'COLLECTIONS'
  | 'TESTIMONIALS'
  | 'MAP'

export type HomeVisibility = { visible: boolean; reason: string | null }

export type HomeItem = {
  id: string
  imageUrl: string
  mobileImageUrl: string | null
  alt: string | null
  title: string | null
  subtitle: string | null
  buttonText: string | null
  linkUrl: string | null
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  sortOrder: number
  isLive: boolean
}

export type HomeSection = {
  id: string
  type: HomeSectionType
  title: string | null
  subtitle: string | null
  config: Record<string, unknown> | null
  isActive: boolean
  isSingleton: boolean
  sortOrder: number
  visibility: HomeVisibility
  // فقط برای اسلایدر و بنر
  itemLimit?: number
  items?: HomeItem[]
}

export type HomeSectionsResponse = {
  status: string
  data: {
    sections: HomeSection[]
    limits: {
      productSections: { used: number; max: number }
      bannerSections: { used: number; max: number }
    }
  }
}

export const HOME_TYPE_LABELS: Record<HomeSectionType, string> = {
  SLIDER: 'اسلایدر اصلی',
  BANNERS: 'بنر',
  PRODUCTS: 'محصولات',
  CATEGORIES: 'دسته‌بندی‌ها',
  COLLECTIONS: 'کالکشن‌ها',
  TESTIMONIALS: 'نظرات مشتریان',
  MAP: 'نقشه و آدرس',
}

export const HOME_SOURCE_OPTIONS = [
  { value: 'featured', label: 'محصولات ویژه' },
  { value: 'newest', label: 'جدیدترین‌ها' },
  { value: 'discount', label: 'تخفیف‌دار' },
]