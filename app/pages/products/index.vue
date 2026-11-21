<template>
  <div dir="rtl" class="mx-auto w-full  px-4 pb-14 pt-5 lg:px-8 lg:pt-6">
    <!-- مسیر صفحه -->
    <nav aria-label="مسیر صفحه" class="text-xs text-dark-gray lg:text-[13px]">
      <ol class="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
        <li>
          <NuxtLink to="/" class="hover:text-burgundy">خانه</NuxtLink>
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <NuxtLink
            v-if="selectedCategory || selectedCollection"
            to="/products"
            class="hover:text-burgundy"
          >
            محصولات
          </NuxtLink>
          <span v-else aria-current="page" class="text-dark-brown">محصولات</span>
        </li>

        <template v-if="selectedCategory?.parent">
          <li aria-hidden="true">›</li>
          <li>
            <NuxtLink
              :to="locationFor({ category: selectedCategory.parent.slug })"
              class="hover:text-burgundy"
            >
              {{ selectedCategory.parent.name }}
            </NuxtLink>
          </li>
        </template>

        <template v-if="selectedCategory || selectedCollection">
          <li aria-hidden="true">›</li>
          <li aria-current="page" class="text-dark-brown">
            {{ selectedCategory?.name ?? selectedCollection?.name }}
          </li>
        </template>
      </ol>
    </nav>

    <header class="mb-4 mt-3 lg:mb-7 lg:mt-5">
      <h1 class="m-0 text-[22px] font-bold text-burgundy lg:text-[32px]">
        {{ heading }}
      </h1>

      <p
        v-if="selectedCollection?.description"
        class="mt-2 max-w-3xl text-sm leading-7 text-dark-gray"
      >
        {{ selectedCollection.description }}
      </p>
    </header>

    <div class="flex flex-col lg:flex-row lg:items-start lg:gap-8">
      <!-- ستون فیلتر دسکتاپ -->
      <aside
        class="sticky top-24 hidden h-[calc(100dvh-7rem)] w-[280px] shrink-0 overflow-hidden rounded-2xl border border-nude/20 bg-white/50 lg:block"
        aria-label="فیلتر محصولات"
      >
        <BaseScrollArea>
          <div class="p-5">
            <ProductsFilters
              :filters="filters"
              :categories="categories"
              :collections="collections"
              :filter-count="filterCount"
              :weight-range="weightRange"
              :price-range="priceRange"
              :location-for="locationFor"
              @update="update"
              @reset="resetFilters"
            />
          </div>
        </BaseScrollArea>
      </aside>

      <section aria-label="لیست محصولات" class="min-w-0 lg:flex-1">
        <!-- نوار بالا: دکمه‌ی فیلتر (فقط موبایل)، تعداد (دسکتاپ)، مرتب‌سازی (همیشه) -->
        <div class="mb-3 flex items-center gap-2 lg:mb-3.5 lg:gap-4">
          <!-- فقط زیر ۱۰۲۴ پیکسل دیده می‌شود -->
          <div class="shrink-0 lg:hidden">
            <BaseBtn
              outline
              rounded
              no-caps
              color="gray"
              text-color="black"
              size="md"
              @click="drawerOpen = true"
            >
              <template #icon>
                <Icon name="lucide:sliders-horizontal" size="18px" />
              </template>
              فیلتر
              <span
                v-if="filterCount > 0"
                class="ms-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-xs text-cream"
              >
                {{ toFaNumber(filterCount) }}
              </span>
            </BaseBtn>
          </div>

          <p class="m-0 hidden text-sm text-dark-gray lg:block" aria-live="polite">
            <template v-if="data">
              {{ toFaNumber(total) }} محصول
            </template>
          </p>

          <!-- مرتب‌سازی در موبایل و دسکتاپ هر دو هست -->
          <div class="min-w-0 flex-1 lg:ms-auto lg:flex-none">
            <BaseSelect
              :model-value="filters.sort"
              :options="sortOptions"
              emit-value
              dense
              hide-bottom-space
              general-class="lg:!w-52"
              @update:model-value="update({ sort: $event })"
            />
          </div>
        </div>

        <!-- فیلترهای فعال: در موبایل اسکرول افقی -->
        <div
          v-if="chips.length > 0"
          class="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1 lg:mb-5 lg:flex-wrap lg:overflow-visible"
          aria-label="فیلترهای فعال"
        >
          <BaseBtn
            v-for="chip in chips"
            :key="chip.key"
            class="shrink-0"
            outline
            rounded
            no-caps
            size="sm"
            color="gray"
            text-color="black"
            :aria-label="`حذف فیلتر ${chip.label}`"
            @click="update(chip.clear)"
          >
            <span class="whitespace-nowrap">{{ chip.label }}</span>
            <Icon name="lucide:x" size="14px" class="ms-1.5" />
          </BaseBtn>
        </div>

        <!-- تعداد نتایج (موبایل) -->
        <p class="mb-3 text-[13px] text-dark-gray lg:hidden" aria-live="polite">
          <template v-if="data">
            {{ toFaNumber(total) }} محصول
          </template>
        </p>

        <!-- خطا -->
        <div
          v-if="error && !data"
          class="flex flex-col items-center gap-3 roundeded-2xl border border-nude/20 bg-white/50 px-4 py-12 text-center"
          role="alert"
        >
          <Icon name="lucide:wifi-off" size="36px" class="text-nude" />
          <p class="m-0 text-dark-gray">دریافت محصولات با مشکل روبه‌رو شد.</p>
          <BaseBtn color="black" no-caps label="تلاش دوباره" @click="refresh()" />
        </div>

        <!-- بارگذاری اولیه -->
        <ul
          v-else-if="!data"
          class="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 xl:grid-cols-4 lg:gap-5"
          aria-hidden="true"
        >
          <li v-for="n in 8" :key="n" class="animate-pulse">
            <div class="aspect-square roundeded-2xl bg-nude/10" />
            <div class="mx-auto mt-3 h-3 w-2/3 roundeded bg-nude/10" />
          </li>
        </ul>

        <!-- بدون نتیجه -->
        <div
          v-else-if="items.length === 0"
          class="flex flex-col items-center gap-3 roundeded-2xl border border-nude/20 bg-white/50 px-4 py-14 text-center"
        >
          <Icon name="lucide:search-x" size="40px" class="text-nude" />
          <p class="m-0 text-base font-medium text-dark-brown">
            محصولی با این مشخصات پیدا نشد.
          </p>
          <p class="m-0 text-sm text-dark-gray">
            فیلترها را کم کنید یا عبارت دیگری را جستجو کنید.
          </p>
          <BaseBtn
            color="black"
            no-caps
            :label="filters.page > 1 ? 'بازگشت به صفحه‌ی اول' : 'پاک کردن فیلترها'"
            @click="filters.page > 1 ? update({ page: 1 }) : resetAll()"
          />
        </div>

        <!-- نتیجه: ۲ ستون موبایل، ۳ ستون تبلت و دسکتاپ کوچک، ۴ ستون دسکتاپ -->
        <template v-else>
          <ul
            class="m-0 grid list-none grid-cols-2 gap-3 p-0 transition-opacity md:grid-cols-3 xl:grid-cols-5 lg:gap-5"
            :class="{ 'opacity-60': pending }"
            :aria-busy="pending"
          >
            <li v-for="(product, index) in items" :key="product.id" class="min-w-0">
              <SiteProductCard :product="product" :priority="index < 4" />
            </li>
          </ul>

          <div v-if="totalPages > 1" class="mt-6 flex justify-center lg:mt-9">
            <BasePagination
              :model-value="filters.page - 1"
              :max="totalPages"
              :max-pages="5"
              :loading="pending"
              dir="rtl"
              locale="fa-IR"
              @update:model-value="update({ page: Number($event) + 1 })"
            />
          </div>
        </template>
      </section>
    </div>

    <!-- کشوی فیلتر موبایل (از سمت راست) -->
    <BaseDialog
      v-model="drawerOpen"
      position="right"
      full-height
      transition-show="slide-right"
      transition-hide="slide-left"
      custom-class="!max-w-[22rem] !roundeded-none"
    >
      <div class="flex h-full flex-col" dir="rtl">
        <div class="flex h-14 shrink-0 items-center justify-between border-b border-nude/20 px-4">
          <h2 class="m-0 text-base font-bold text-burgundy">فیلتر محصولات</h2>

          <BaseBtn
            flat
            rounded
            size="md"
            color="dark-brown"
            aria-label="بستن"
            @click="drawerOpen = false"
          >
            <template #icon>
              <Icon name="lucide:x" size="22px" />
            </template>
          </BaseBtn>
        </div>

        <div class="min-h-0 flex-1">
          <BaseScrollArea>
            <div class="p-4">
              <ProductsFilters
                touch
                hide-clear
                :filters="filters"
                :categories="categories"
                :collections="collections"
                :filter-count="filterCount"
                :weight-range="weightRange"
                :price-range="priceRange"
                :location-for="locationFor"
                @update="update"
                @reset="resetFilters"
                @navigate="drawerOpen = false"
              />
            </div>
          </BaseScrollArea>
        </div>

        <div class="flex shrink-0 gap-2 border-t border-nude/20 bg-white p-3">
          <BaseBtn
            v-if="filterCount > 0"
            class="shrink-0"
            outline
            no-caps
            size="lg"
            color="gray"
            text-color="black"
            label="پاک کردن"
            @click="resetFilters"
          />

          <BaseBtn
            class="flex-1"
            color="black"
            no-caps
            size="lg"
            :label="data ? `نمایش ${toFaNumber(total)} محصول` : 'نمایش محصولات'"
            @click="drawerOpen = false"
          />
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseDialog from '~/components/base/dialog/BaseDialog.vue'
import BasePagination from '~/components/base/pagination/BasePagination.vue'
import BaseSelect from '~/components/base/select/BaseSelect.vue'
import type { ProductFilters } from '~/composables/useProductsQuery'
import type { PublicProduct } from '~/types/product'
import type { PublicCategory, PublicCollection } from '~/types/site'

type ProductsResponse = {
  status: string
  data: {
    items: PublicProduct[]
    pagination: { page: number, limit: number, total: number, totalPages: number }
  }
}

const router = useRouter()
const assetUrl = useAssetUrl()

const { filters, apiQuery, locationFor, update, filterCount } = useProductsQuery()

// ───── داده‌ها (با SSR) ─────
const { data: categoriesData } = await useApiFetch<{ status: string, data: PublicCategory[] }>(
  '/categories',
  { key: 'site-categories' },
)

const { data: collectionsData } = await useApiFetch<{ status: string, data: PublicCollection[] }>(
  '/collections',
  { key: 'site-collections' },
)

const { data: filterOptionsData } = await useApiFetch<{
  status: string
  data: {
    weight: { min: number, max: number } | null
    price: { min: number, max: number } | null
  }
}>('/products/filters', { key: 'products-filter-options' })

const weightRange = computed(() => filterOptionsData.value?.data.weight ?? null)
const priceRange = computed(() => filterOptionsData.value?.data.price ?? null)

const categories = computed(() => categoriesData.value?.data ?? [])
const collections = computed(() => collectionsData.value?.data ?? [])

const { data, status, error, refresh } = await useApiFetch<ProductsResponse>('/products', {
  key: 'products-list',
  query: apiQuery,
})

const pending = computed(() => status.value === 'pending')
const items = computed(() => data.value?.data.items ?? [])
const total = computed(() => data.value?.data.pagination.total ?? 0)
const totalPages = computed(() => data.value?.data.pagination.totalPages ?? 0)

// ───── دسته و کالکشن انتخاب‌شده ─────
const selectedCategory = computed(() => {
  for (const root of categories.value) {
    if (root.slug === filters.value.category) {
      return { name: root.name, slug: root.slug, imageUrl: root.imageUrl, parent: null }
    }

    const child = root.children.find(item => item.slug === filters.value.category)

    if (child) {
      return {
        name: child.name,
        slug: child.slug,
        imageUrl: child.imageUrl,
        parent: { name: root.name, slug: root.slug },
      }
    }
  }

  return null
})

const selectedCollection = computed(
  () => collections.value.find(item => item.slug === filters.value.collection) ?? null,
)

// دسته یا کالکشنی که وجود ندارد، صفحه‌ی ۴۰۴ است (فقط وقتی لیست‌ها آمده باشند)
if (filters.value.category && categories.value.length > 0 && !selectedCategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی پیدا نشد', fatal: true })
}

if (filters.value.collection && collections.value.length > 0 && !selectedCollection.value) {
  throw createError({ statusCode: 404, statusMessage: 'کالکشن پیدا نشد', fatal: true })
}

const heading = computed(() => {
  if (filters.value.search) return `نتایج جستجوی «${filters.value.search}»`

  return selectedCategory.value?.name ?? selectedCollection.value?.name ?? 'همه‌ی محصولات'
})

// ───── مرتب‌سازی ─────
const sortOptions = [
  { label: 'جدیدترین', value: 'newest' },
  { label: 'ارزان‌ترین', value: 'price_asc' },
  { label: 'گران‌ترین', value: 'price_desc' },
  { label: 'سبک‌ترین', value: 'weight_asc' },
  { label: 'سنگین‌ترین', value: 'weight_desc' },
  { label: 'بیشترین تخفیف', value: 'discount' },
]

// ───── فیلترهای فعال به‌صورت چیپ ─────
const chips = computed(() => {
  const f = filters.value
  const list: { key: string, label: string, clear: Partial<ProductFilters> }[] = []

  if (f.search) list.push({ key: 'search', label: `جستجو: ${f.search}`, clear: { search: '' } })

  if (selectedCategory.value) {
    list.push({ key: 'category', label: selectedCategory.value.name, clear: { category: null } })
  }

  if (selectedCollection.value) {
    list.push({ key: 'collection', label: selectedCollection.value.name, clear: { collection: null } })
  }

  if (f.minPrice !== null || f.maxPrice !== null) {
    const from = f.minPrice !== null ? `از ${formatToman(f.minPrice)}` : ''
    const to = f.maxPrice !== null ? `تا ${formatToman(f.maxPrice)}` : ''

    list.push({
      key: 'price',
      label: `قیمت ${from} ${to} تومان`.replace(/\s+/g, ' '),
      clear: { minPrice: null, maxPrice: null },
    })
  }

  if (f.minWeight !== null || f.maxWeight !== null) {
    const from = f.minWeight !== null ? `از ${formatWeight(f.minWeight)}` : ''
    const to = f.maxWeight !== null ? `تا ${formatWeight(f.maxWeight)}` : ''

    list.push({
      key: 'weight',
      label: `وزن ${from} ${to} گرم`.replace(/\s+/g, ' '),
      clear: { minWeight: null, maxWeight: null },
    })
  }

  if (f.inStock) list.push({ key: 'inStock', label: 'فقط موجود', clear: { inStock: false } })
  if (f.hasDiscount) list.push({ key: 'hasDiscount', label: 'تخفیف‌دار', clear: { hasDiscount: false } })
  if (f.featured) list.push({ key: 'featured', label: 'محصولات ویژه', clear: { featured: false } })

  return list
})

const drawerOpen = ref(false)

const resetFilters = () => update(CLEAR_FILTERS_PATCH)

// فیلترها و جستجو هر دو پاک می‌شوند
const resetAll = () => update({ ...CLEAR_FILTERS_PATCH, search: '' })

// اگر صفحه از آخرین صفحه بیشتر باشد (مثلاً بعد از حذف محصول)، به آخرین صفحه می‌رود
watch(
  data,
  (value) => {
    const pagination = value?.data.pagination

    if (
      import.meta.client
      && pagination
      && pagination.total > 0
      && filters.value.page > pagination.totalPages
    ) {
      router.replace(locationFor({ page: pagination.totalPages }))
    }
  },
  { immediate: true },
)

// ───── سئو ─────
// فقط صفحه‌ی بدون فیلتر، یا فقط یک دسته، یا فقط یک کالکشن ایندکس می‌شود؛ ترکیب‌ها noindex هستند
const isIndexable = computed(() => {
  const f = filters.value

  const hasExtra
    = !!f.search
      || f.minPrice !== null || f.maxPrice !== null
      || f.minWeight !== null || f.maxWeight !== null
      || f.inStock || f.hasDiscount || f.featured
      || f.sort !== 'newest'
      || (!!f.category && !!f.collection)

  return !hasExtra
})

const canonicalQuery = computed(() => {
  const f = filters.value
  const query: Record<string, string> = {}

  if (f.category) query.category = f.category
  if (f.collection) query.collection = f.collection
  if (f.page > 1) query.page = String(f.page)

  return query
})

const seoTitle = computed(() => {
  const base = selectedCategory.value
    ? `خرید ${selectedCategory.value.name}`
    : selectedCollection.value
      ? `کالکشن ${selectedCollection.value.name}`
      : filters.value.search
        ? `جستجوی ${filters.value.search}`
        : 'خرید آنلاین طلا و جواهر'

  return filters.value.page > 1 ? `${base} - صفحه ${toFaNumber(filters.value.page)}` : base
})

const seoDescription = computed(() => {
  if (selectedCollection.value?.description) return selectedCollection.value.description

  const subject = selectedCategory.value?.name ?? selectedCollection.value?.name

  return subject
    ? `مشاهده و خرید آنلاین ${subject} با قیمت لحظه‌ای و ریز قیمت شفاف شامل طلا، اجرت، سود و مالیات.`
    : 'مشاهده و خرید آنلاین طلا و جواهر با قیمت لحظه‌ای و ریز قیمت شفاف شامل طلا، اجرت، سود و مالیات.'
})

usePageSeo({
  title: seoTitle,
  description: seoDescription,
  image: () => assetUrl(selectedCategory.value?.imageUrl ?? selectedCollection.value?.imageUrl),
  noindex: () => !isIndexable.value,
  canonicalQuery,
})
</script>