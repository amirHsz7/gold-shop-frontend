<template>
  <BaseListPage
    v-model:page="page"
    v-model:rows-per-page="rowsPerPage"
    v-model:search="search"
    title="محصولات"
    entity-name="محصول"
    add-btn-text="افزودن محصول"
    search-placeholder="جستجو در نام، اسلاگ یا کد کالا..."
    :show-back-btn="false"
    :columns="columns"
    :rows="rows"
    server-side-pagination
    server-side-search
    :total-elements="totalElements"
    :total-pages="totalPages"
    :firstloading="isFirstLoading"
    :loading="isRefreshing"
    :error="!!error"
    @add="openCreate"
    @row-click="openEdit"
  >
    <!-- فیلترها -->
    <template #filters>
      <div class="flex flex-wrap items-center gap-2">
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="وضعیت"
          general-class="!w-36"
          emit-value
          clearable
          dense
          hide-bottom-space
        />

        <BaseSelect
          v-model="stockFilter"
          :options="stockOptions"
          placeholder="موجودی"
          general-class="!w-36"
          emit-value
          clearable
          dense
          hide-bottom-space
        />

        <BaseSelect
          v-model="categoryFilter"
          :options="categoryOptions"
          placeholder="دسته‌بندی"
          general-class="!w-52"
          emit-value
          clearable
          searchable
          dense
          hide-bottom-space
        />
      </div>
    </template>

    <!-- تصویر -->
    <template #body-cell(image)="props">
      <BaseImg
        v-if="props.row.imageUrl"
        :src="assetUrl(props.row.imageUrl)"
        :alt="props.row.name"
        width="40px"
        height="40px"
        fit="cover"
        no-spinner
        class="shrink-0 rounded-md border border-gray-200 bg-gray-100"
      >
        <template #error>
          <span class="text-gray-300" aria-hidden="true">—</span>
        </template>
      </BaseImg>

      <span
        v-else
        class="flex shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400"
        style="width: 40px; height: 40px"
        aria-hidden="true"
      >
        —
      </span>
    </template>

    <!-- نام و اسلاگ -->
    <template #body-cell(name)="props">
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="flex items-center gap-1.5 font-medium text-gray-800">
          {{ props.row.name }}
          <span
            v-if="props.row.isFeatured"
            class="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-normal text-amber-700"
          >
            ویژه
          </span>
        </span>
        <span dir="ltr" class="text-start text-xs text-gray-400">
          {{ props.row.slug }}
        </span>
      </div>
    </template>

    <!-- دسته‌بندی -->
    <template #body-cell(category)="props">
      <span>{{ props.row.category.name }}</span>
    </template>

    <!-- کالکشن -->
    <template #body-cell(collection)="props">
      <span v-if="props.row.collection">{{ props.row.collection.name }}</span>
      <span v-else class="text-gray-400">—</span>
    </template>

    <!-- وزن -->
    <template #body-cell(weight)="props">
      <span v-if="props.row.activeVariantCount > 0" class="whitespace-nowrap">
        {{ weightText(props.row) }} گرم
      </span>
      <span v-else class="text-gray-400">—</span>
    </template>

    <!-- موجودی -->
    <template #body-cell(stock)="props">
      <div class="flex flex-col gap-0.5">
        <span :class="props.row.inStock ? 'text-gray-800' : 'text-red-600'">
          {{ props.row.inStock ? toFaNumber(props.row.totalStock) : 'ناموجود' }}
        </span>
        <span class="text-xs text-gray-400">
          {{ toFaNumber(props.row.activeVariantCount) }} وزن فعال
        </span>
      </div>
    </template>

    <!-- تخفیف -->
    <template #body-cell(discount)="props">
      <span
        v-if="props.row.discountPercent > 0"
        class="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-700"
      >
        {{ toFaNumber(props.row.discountPercent) }}٪
      </span>
      <span v-else class="text-gray-400">—</span>
    </template>

    <!-- وضعیت -->
    <template #body-cell(isActive)="props">
      <span
        class="rounded-full px-2.5 py-0.5 text-xs"
        :class="props.row.isActive
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'"
      >
        {{ props.row.isActive ? 'فعال' : 'غیرفعال' }}
      </span>
    </template>

    <!-- عملیات -->
    <template #body-cell(actions)="props">
      <div class="flex items-center gap-1.5">
        <BaseBtn
          size="sm"
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          @click.stop="openEdit(props.row)"
        >
          ویرایش
        </BaseBtn>
        <BaseBtn
          size="sm"
          outline
          color="gray"
          class="!bg-white !text-red-600"
          @click.stop="askDelete(props.row)"
        >
          حذف
        </BaseBtn>
      </div>
    </template>

    <template #dialogs>
      <ProductFormDialog
        v-model="formOpen"
        :product-id="editingId"
        @saved="onSaved"
      />
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import BaseListPage from '@/components/base/list-page/BaseListPage.vue' // مسیر واقعی BaseListPage خودت
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { Column } from '@/components/base/table/types'
import { toFaNumber } from '@/utils/formatNumber.ts'
import ProductFormDialog from '~/components/admin/products/ProductFormDialog.vue'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

type ProductRow = {
  id: string
  name: string
  slug: string
  isActive: boolean
  isFeatured: boolean
  discountPercent: number
  minWeight: number
  maxWeight: number
  category: { id: string; name: string }
  collection: { id: string; name: string } | null
  variantCount: number
  activeVariantCount: number
  totalStock: number
  inStock: boolean
  imageUrl: string | null
}

type ProductsResponse = {
  status: string
  data: {
    items: ProductRow[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

type CategoryNode = {
  id: string
  name: string
  children: { id: string; name: string }[]
}

const config = useRuntimeConfig()
const toast = useFormToast()
const route = useRoute()
const router = useRouter()

// ───── هم‌گام‌سازی وضعیت جدول با آدرس صفحه ─────
const DEFAULT_LIMIT = 10
const LIMIT_OPTIONS = [10, 20, 50]
const URL_KEYS = ['page', 'limit', 'search', 'status', 'stock', 'category']

// اولین مقدار رشته‌ای پارامتر آدرس (یا undefined)
const first = (value: unknown): string | undefined => {
  const item = Array.isArray(value) ? value[0] : value

  return typeof item === 'string' && item.trim() ? item.trim() : undefined
}

// آدرس را به وضعیت جدول تبدیل می‌کند؛ مقدارهای نامعتبر نادیده گرفته می‌شوند
const parseState = (urlQuery: typeof route.query) => {
  const pageNumber = Number.parseInt(first(urlQuery.page) ?? '', 10)
  const limitNumber = Number.parseInt(first(urlQuery.limit) ?? '', 10)
  const status = first(urlQuery.status)
  const stock = first(urlQuery.stock)

  return {
    // آدرس یک‌مبناست و BaseListPage صفرمبنا
    page: Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber - 1 : 0,
    rowsPerPage: LIMIT_OPTIONS.includes(limitNumber) ? limitNumber : DEFAULT_LIMIT,
    search: (first(urlQuery.search) ?? '').slice(0, 100),
    status: status === 'active' || status === 'inactive' ? status : null,
    stock: stock === 'in' || stock === 'out' ? stock : null,
    category: first(urlQuery.category) ?? null,
  }
}

// وضعیت اولیه از آدرس خوانده می‌شود، پس اولین درخواست هم با همین مقدارهاست
const initial = parseState(route.query)

const page = ref(initial.page) // BaseListPage صفرمبناست
const rowsPerPage = ref(initial.rowsPerPage)
const search = ref(initial.search)
const statusFilter = ref<'active' | 'inactive' | null>(initial.status)
const stockFilter = ref<'in' | 'out' | null>(initial.stock)
const categoryFilter = ref<string | null>(initial.category)

// آدرسی که از وضعیت فعلی ساخته می‌شود (پیش‌فرض‌ها در آدرس نمی‌آیند)
const buildUrlQuery = () => {
  const next: Partial<Record<string, string>> = {}

  if (page.value > 0) next.page = String(page.value + 1)
  if (rowsPerPage.value !== DEFAULT_LIMIT) next.limit = String(rowsPerPage.value)

  const text = search.value.trim()

  if (text) next.search = text
  if (statusFilter.value) next.status = statusFilter.value
  if (stockFilter.value) next.stock = stockFilter.value
  if (categoryFilter.value) next.category = categoryFilter.value

  return next
}

// پارامترهایی که مال این صفحه نیستند دست‌نخورده می‌مانند
const otherUrlQuery = () =>
  Object.fromEntries(
    Object.entries(route.query).filter(([key]) => !URL_KEYS.includes(key)),
  )

const isSameAsUrl = (next: Partial<Record<string, string>>) =>
  URL_KEYS.every(key => first(route.query[key]) === next[key])

// وضعیت ← آدرس
watch(
  [page, rowsPerPage, search, statusFilter, stockFilter, categoryFilter],
  () => {
    const next = buildUrlQuery()

    if (isSameAsUrl(next)) return

    router.replace({ query: { ...otherUrlQuery(), ...next } })
  },
)

// جلوگیری از برگشت به صفحه‌ی اول وقتی تغییر فیلتر از آدرس آمده (دکمه‌ی برگشت مرورگر)
let applyingUrl = false

// با تغییر فیلتر توسط کاربر، به صفحه‌ی اول برمی‌گردیم
watch([statusFilter, stockFilter, categoryFilter], () => {
  if (applyingUrl) return

  page.value = 0
})

// آدرس ← وضعیت (برگشت و جلوی مرورگر، یا باز کردن لینک)
watch(
  () => route.query,
  (urlQuery) => {
    const state = parseState(urlQuery)

    applyingUrl = true

    page.value = state.page
    rowsPerPage.value = state.rowsPerPage
    search.value = state.search
    statusFilter.value = state.status
    stockFilter.value = state.stock
    categoryFilter.value = state.category

    nextTick(() => {
      applyingUrl = false
    })
  },
)

// ───── دریافت داده ─────
const query = computed(() => ({
  page: page.value + 1, // بکند یک‌مبناست
  limit: rowsPerPage.value,
  search: search.value.trim().slice(0, 100) || undefined,
  status: statusFilter.value ?? undefined,
  stock: stockFilter.value ?? undefined,
  categoryId: categoryFilter.value ?? undefined,
}))

// با تغییر query، درخواست خودکار دوباره زده می‌شود
const { data, status: fetchStatus, error, refresh } = useApiFetch<ProductsResponse>(
  '/admin/products',
  {
    key: 'admin-products',
    server: false, // ادمین نیاز به SSR ندارد
    lazy: true,
    query,
  },
)

const rows = computed(() => data.value?.data.items ?? [])
const totalElements = computed(() => data.value?.data.pagination.total ?? 0)
const totalPages = computed(() => data.value?.data.pagination.totalPages ?? 0)

// اگر صفحه‌ی آدرس از تعداد صفحات بیشتر باشد، به آخرین صفحه برمی‌گردد
watch(totalPages, (total) => {
  if (total > 0 && page.value >= total) page.value = total - 1
})

// فقط بارگذاری اول؛ در تغییر صفحه و فیلتر جدول از بین نمی‌رود
const isFirstLoading = computed(
  () => !data.value && (fetchStatus.value === 'idle' || fetchStatus.value === 'pending'),
)
const isRefreshing = computed(
  () => !!data.value && fetchStatus.value === 'pending',
)

watch(error, (value) => {
  if (!value) return

  const message = (value.data as { message?: string } | undefined)?.message

  toast.error(message ?? 'دریافت لیست محصولات ناموفق بود')
})

// ───── گزینه‌های فیلتر ─────
const statusOptions = [
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غیرفعال' },
]

const stockOptions = [
  { value: 'in', label: 'موجود' },
  { value: 'out', label: 'ناموجود' },
]

// همان درخت دسته‌بندی‌ها (با کلید مشترک با صفحه‌ی دسته‌بندی‌ها)
const { data: categoryData } = useApiFetch<{ data: CategoryNode[] }>(
  '/admin/categories',
  { key: 'admin-categories', server: false, lazy: true },
)

// انتخاب دسته‌ی والد، محصولات زیردسته‌هایش را هم می‌آورد
const categoryOptions = computed(() =>
  (categoryData.value?.data ?? []).flatMap(root => [
    { value: root.id, label: root.name },
    ...root.children.map(child => ({
      value: child.id,
      label: `${root.name} › ${child.name}`,
    })),
  ]),
)

// ───── ستون‌ها ─────
const columns: Column[] = [
  { name: 'image', label: 'تصویر', field: 'imageUrl' },
  { name: 'name', label: 'نام محصول', field: 'name' },
  { name: 'category', label: 'دسته‌بندی', field: 'category' },
  { name: 'collection', label: 'کالکشن', field: 'collection' },
  { name: 'weight', label: 'وزن', field: 'minWeight' },
  { name: 'stock', label: 'موجودی', field: 'totalStock' },
  { name: 'discount', label: 'تخفیف', field: 'discountPercent' },
  { name: 'isActive', label: 'وضعیت', field: 'isActive' },
  { name: 'actions', label: 'عملیات', field: 'id' },
]

// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string) => `${config.public.apiBaseUrl}${path}`

// اگر همه‌ی وزن‌ها یکی باشد یک عدد، وگرنه بازه
const weightText = (row: ProductRow) =>
  row.minWeight === row.maxWeight
    ? toFaNumber(row.minWeight)
    : `${toFaNumber(row.minWeight)} تا ${toFaNumber(row.maxWeight)}`

// ───── فرم ساخت و ویرایش ─────
const formOpen = ref(false)
const editingId = ref<string | null>(null)

const openCreate = () => {
  editingId.value = null
  formOpen.value = true
}

const openEdit = (row: ProductRow) => {
  editingId.value = row.id
  formOpen.value = true
}

const onSaved = async (
  payload: { mode: 'create' | 'edit'; warning?: string },
) => {
  formOpen.value = false

  if (payload.warning) {
    toast.warning(payload.warning)
  }
  else {
    toast.success(
      payload.mode === 'create'
        ? 'محصول با موفقیت ساخته شد'
        : 'تغییرات محصول ذخیره شد',
    )
  }

  // محصول جدید در صفحه‌ی اول است
  if (payload.mode === 'create' && page.value !== 0) page.value = 0
  else await refresh()
}

const askDelete = (row: ProductRow) => {
  console.log('delete product', row.id)
}
</script>