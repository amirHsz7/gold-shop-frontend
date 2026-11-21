import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { toEnNumber } from '~/utils/formatNumber'

export const PRODUCT_SORTS = [
  'newest',
  'price_asc',
  'price_desc',
  'weight_asc',
  'weight_desc',
  'discount',
] as const

export type ProductSort = (typeof PRODUCT_SORTS)[number]

export const DEFAULT_PRODUCT_SORT: ProductSort = 'newest'
export const PRODUCTS_PER_PAGE = 12

export type ProductFilters = {
  // یک‌مبنا (مثل بکند)
  page: number
  search: string
  category: string | null
  collection: string | null
  sort: ProductSort
  minPrice: number | null
  maxPrice: number | null
  minWeight: number | null
  maxWeight: number | null
  inStock: boolean
  hasDiscount: boolean
  featured: boolean
}

const URL_KEYS = [
  'page',
  'search',
  'category',
  'collection',
  'sort',
  'minPrice',
  'maxPrice',
  'minWeight',
  'maxWeight',
  'inStock',
  'hasDiscount',
  'featured',
]

// همه‌ی فیلترها خاموش می‌شوند (جستجو و مرتب‌سازی دست‌نخورده می‌مانند)
export const CLEAR_FILTERS_PATCH: Partial<ProductFilters> = {
  category: null,
  collection: null,
  minPrice: null,
  maxPrice: null,
  minWeight: null,
  maxWeight: null,
  inStock: false,
  hasDiscount: false,
  featured: false,
}

const first = (value: LocationQuery[string] | undefined): string | null =>
  (Array.isArray(value) ? value[0] : value) ?? null

const toInt = (value: string | null, max: number) => {
  if (value === null) return null

  const number = Number.parseInt(toEnNumber(value), 10)

  return Number.isInteger(number) && number >= 0 ? Math.min(number, max) : null
}

const toDecimal = (value: string | null, max: number) => {
  if (value === null) return null

  const number = Number(toEnNumber(value).replace('٫', '.'))

  return Number.isFinite(number) && number >= 0 ? Math.min(number, max) : null
}

// آدرس را به فیلتر تبدیل می‌کند؛ مقدارهای نامعتبر نادیده گرفته می‌شوند
export const parseProductFilters = (query: LocationQuery): ProductFilters => {
  const page = toInt(first(query.page), 100000)
  const sort = first(query.sort)

  let minPrice = toInt(first(query.minPrice), 1_000_000_000)
  let maxPrice = toInt(first(query.maxPrice), 1_000_000_000)
  let minWeight = toDecimal(first(query.minWeight), 100000)
  let maxWeight = toDecimal(first(query.maxWeight), 100000)

  // اگر کاربر بازه را برعکس وارد کرده باشد، جابه‌جا می‌شود
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice]
  }

  if (minWeight !== null && maxWeight !== null && minWeight > maxWeight) {
    [minWeight, maxWeight] = [maxWeight, minWeight]
  }

  return {
    page: page && page >= 1 ? page : 1,
    search: (first(query.search) ?? '').trim().slice(0, 100),
    category: first(query.category) || null,
    collection: first(query.collection) || null,
    sort: PRODUCT_SORTS.includes(sort as ProductSort)
      ? (sort as ProductSort)
      : DEFAULT_PRODUCT_SORT,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    inStock: first(query.inStock) === 'true',
    hasDiscount: first(query.hasDiscount) === 'true',
    featured: first(query.featured) === 'true',
  }
}

// پیش‌فرض‌ها در آدرس نمی‌آیند
const toUrlQuery = (filters: ProductFilters) => {
  const next: Record<string, string> = {}

  if (filters.page > 1) next.page = String(filters.page)
  if (filters.search) next.search = filters.search
  if (filters.category) next.category = filters.category
  if (filters.collection) next.collection = filters.collection
  if (filters.sort !== DEFAULT_PRODUCT_SORT) next.sort = filters.sort
  if (filters.minPrice !== null) next.minPrice = String(filters.minPrice)
  if (filters.maxPrice !== null) next.maxPrice = String(filters.maxPrice)
  if (filters.minWeight !== null) next.minWeight = String(filters.minWeight)
  if (filters.maxWeight !== null) next.maxWeight = String(filters.maxWeight)
  if (filters.inStock) next.inStock = 'true'
  if (filters.hasDiscount) next.hasDiscount = 'true'
  if (filters.featured) next.featured = 'true'

  return next
}

export const useProductsQuery = () => {
  const route = useRoute()
  const router = useRouter()

  const filters = computed(() => parseProductFilters(route.query))

  // پارامترهای درخواست به بکند
  const apiQuery = computed(() => {
    const f = filters.value

    return {
      page: f.page,
      limit: PRODUCTS_PER_PAGE,
      search: f.search || undefined,
      category: f.category ?? undefined,
      collection: f.collection ?? undefined,
      sort: f.sort,
      minPrice: f.minPrice ?? undefined,
      maxPrice: f.maxPrice ?? undefined,
      minWeight: f.minWeight ?? undefined,
      maxWeight: f.maxWeight ?? undefined,
      inStock: f.inStock ? 'true' : undefined,
      hasDiscount: f.hasDiscount ? 'true' : undefined,
      featured: f.featured ? 'true' : undefined,
    }
  })

  // آدرس صفحه با تغییر مشخص؛ با هر تغییر فیلتر، صفحه به ۱ برمی‌گردد
  const locationFor = (patch: Partial<ProductFilters> = {}): RouteLocationRaw => {
    const next = { ...filters.value, ...patch }

    if (!('page' in patch)) next.page = 1

    // پارامترهایی که مال این صفحه نیستند (مثل utm) دست‌نخورده می‌مانند
    const others = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => !URL_KEYS.includes(key)),
    )

    return { path: '/products', query: { ...others, ...toUrlQuery(next) } }
  }

  const update = (patch: Partial<ProductFilters>) => router.push(locationFor(patch))

  // تعداد فیلترهای فعال (جستجو و مرتب‌سازی حساب نمی‌شوند)
  const filterCount = computed(() => {
    const f = filters.value

    return [
      f.category,
      f.collection,
      f.minPrice !== null || f.maxPrice !== null,
      f.minWeight !== null || f.maxWeight !== null,
      f.inStock,
      f.hasDiscount,
      f.featured,
    ].filter(Boolean).length
  })

  return { filters, apiQuery, locationFor, update, filterCount }
}