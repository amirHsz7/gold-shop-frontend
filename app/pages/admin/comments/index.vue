<template>
  <BaseListPage
    v-model:page="page"
    v-model:rows-per-page="rowsPerPage"
    v-model:search="search"
    title="نظرات مشتریان"
    entity-name="نظر"
    search-placeholder="جستجو در متن نظر، نام یا موبایل..."
    :show-back-btn="false"
    :show-add-btn="false"
    :columns="columns"
    :rows="rows"
    server-side-pagination
    server-side-search
    :total-elements="totalElements"
    :total-pages="totalPages"
    :firstloading="isFirstLoading"
    :loading="isRefreshing"
    :error="!!error"
  >
    <!-- فیلترها -->
    <template #filters>
      <div class="flex flex-wrap items-center gap-2">
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="وضعیت"
          general-class="!w-48"
          emit-value
          clearable
          dense
          hide-bottom-space
        />

        <BaseSelect
          v-model="typeFilter"
          :options="typeOptions"
          placeholder="نوع"
          general-class="!w-36"
          emit-value
          clearable
          dense
          hide-bottom-space
        />

        <BaseSelect
          v-model="homeFilter"
          :options="homeOptions"
          placeholder="صفحه‌ی اصلی"
          general-class="!w-40"
          emit-value
          clearable
          dense
          hide-bottom-space
        />
      </div>
    </template>

    <!-- شمارنده‌ی نظرهای منتخب صفحه‌ی اصلی -->
    <template #actions>
      <p
        v-if="homeInfo"
        class="m-0 rounded-full px-3 py-1 text-xs"
        :class="homeInfo.selected >= homeInfo.max
          ? 'bg-amber-50 text-amber-800'
          : 'bg-gray-100 text-gray-600'"
      >
        منتخب صفحه‌ی اصلی:
        {{ toFaNumber(homeInfo.selected) }} از {{ toFaNumber(homeInfo.max) }}
      </p>
    </template>

    <!-- نویسنده -->
    <template #body-cell(author)="props">
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="flex items-center gap-1.5 font-medium text-gray-800">
          {{ props.row.user.fullName }}
          <span
            v-if="props.row.user.role === 'ADMIN'"
            class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-normal text-blue-700"
          >
            ادمین
          </span>
        </span>
        <span dir="ltr" class="text-start text-xs text-gray-400">
          {{ props.row.user.mobile }}
        </span>
      </div>
    </template>

    <!-- متن نظر و محصول -->
    <template #body-cell(body)="props">
      <div class="flex max-w-md min-w-0 flex-col gap-1">
        <span v-if="props.row.isReply" class="text-xs text-gray-400">
          پاسخ به: «{{ props.row.parent?.excerpt }}»
        </span>

        <p class="m-0 line-clamp-3 text-sm leading-6 text-gray-800">
          {{ props.row.body }}
        </p>

        <NuxtLink
          :to="`/products/${props.row.product.slug}`"
          target="_blank"
          class="truncate text-xs text-blue-600 hover:underline"
        >
          {{ props.row.product.name }}
        </NuxtLink>
      </div>
    </template>

    <!-- امتیاز -->
    <template #body-cell(rating)="props">
      <span
        v-if="props.row.rating"
        class="inline-flex items-center gap-1 whitespace-nowrap text-sm text-amber-600"
      >
        <Icon name="lucide:star" size="15px" />
        {{ toFaNumber(props.row.rating) }}
      </span>
      <span v-else class="text-gray-400">—</span>
    </template>

    <!-- وضعیت -->
    <template #body-cell(status)="props">
      <span
        class="rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap"
        :class="STATUS_META[props.row.status as CommentStatus].class"
      >
        {{ STATUS_META[props.row.status as CommentStatus].label }}
      </span>
    </template>

    <!-- نمایش در صفحه‌ی اصلی -->
    <template #body-cell(showOnHome)="props">
      <button
        type="button"
        role="switch"
        :aria-checked="props.row.showOnHome"
        :aria-label="props.row.showOnHome ? 'حذف از صفحه‌ی اصلی' : 'نمایش در صفحه‌ی اصلی'"
        :title="homeToggleHint(props.row)"
        class="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="props.row.showOnHome ? 'bg-green-500' : 'bg-gray-300'"
        :disabled="!canShowOnHome(props.row) || busyIds.includes(props.row.id)"
        @click.stop="toggleHome(props.row)"
      >
        <span
          class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          :class="props.row.showOnHome ? 'end-0.5' : 'start-0.5'"
        />
      </button>
    </template>

    <!-- تاریخ -->
    <template #body-cell(createdAt)="props">
      <span class="text-xs whitespace-nowrap text-gray-500">
        {{ dateFormatter.format(new Date(props.row.createdAt)) }}
      </span>
    </template>

    <!-- عملیات -->
    <template #body-cell(actions)="props">
      <div class="flex flex-wrap items-center gap-1.5">
        <BaseBtn
          v-if="props.row.status !== 'APPROVED'"
          size="sm"
          outline
          color="gray"
          class="!bg-white !text-green-700"
          :disable="busyIds.includes(props.row.id)"
          @click.stop="setStatus(props.row, 'APPROVED')"
        >
          تأیید
        </BaseBtn>

        <BaseBtn
          v-if="props.row.status !== 'REJECTED'"
          size="sm"
          outline
          color="gray"
          class="!bg-white !text-amber-700"
          :disable="busyIds.includes(props.row.id)"
          @click.stop="setStatus(props.row, 'REJECTED')"
        >
          رد
        </BaseBtn>

        <BaseBtn
          v-if="!props.row.isReply && props.row.status === 'APPROVED'"
          size="sm"
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          @click.stop="openReply(props.row)"
        >
          پاسخ
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

    <!-- دیالوگ‌ها -->
    <template #dialogs>
      <!-- پاسخ ادمین -->
      <BaseDialog v-model="replyOpen" persistent position="center">
        <div dir="rtl" class="flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 class="text-base font-semibold text-gray-800">پاسخ به نظر</h2>
            <button
              type="button"
              class="text-2xl leading-none text-gray-500 hover:text-gray-800 disabled:opacity-50"
              aria-label="بستن"
              :disabled="isReplying"
              @click="replyOpen = false"
            >
              ×
            </button>
          </div>

          <div class="flex flex-col gap-4 p-5">
            <blockquote class="m-0 rounded-lg bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-600">
              {{ replyTarget?.body }}
            </blockquote>

            <BaseInput
              v-model="replyBody"
              type="textarea"
              label="متن پاسخ"
              :rows="4"
              maxlength="1000"
              counter
              :disabled="isReplying"
              :error="!!replyError"
              :error-message="replyError"
            />
          </div>

          <div class="flex justify-start gap-2 border-t border-gray-200 px-5 py-3">
            <BaseBtn color="black" :loading="isReplying" @click="submitReply">
              ثبت پاسخ
            </BaseBtn>
            <BaseBtn
              color="gray"
              outline
              text-color="black"
              :disable="isReplying"
              @click="replyOpen = false"
            >
              انصراف
            </BaseBtn>
          </div>
        </div>
      </BaseDialog>

      <!-- حذف -->
      <BaseDialog v-model="deleteOpen" :persistent="isDeleting" position="center">
        <div dir="rtl" class="flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 class="text-base font-semibold text-gray-800">حذف نظر</h2>
            <button
              type="button"
              class="text-2xl leading-none text-gray-500 hover:text-gray-800 disabled:opacity-50"
              aria-label="بستن"
              :disabled="isDeleting"
              @click="deleteOpen = false"
            >
              ×
            </button>
          </div>

          <div class="flex flex-col gap-3 p-5 text-sm text-gray-700">
            <p class="m-0">
              آیا از حذف این نظر مطمئن هستید؟ این کار قابل بازگشت نیست.
            </p>

            <p
              v-if="deleteTarget && deleteTarget.replyCount > 0"
              class="m-0 rounded-lg bg-amber-50 px-3 py-2 text-amber-800"
            >
              {{ toFaNumber(deleteTarget.replyCount) }} پاسخ این نظر هم حذف می‌شود.
            </p>

            <p class="m-0 text-xs text-gray-500">
              اگر فقط می‌خواهید از سایت پنهان شود، به‌جای حذف، «رد» را بزنید.
            </p>
          </div>

          <div class="flex justify-start gap-2 border-t border-gray-200 px-5 py-3">
            <BaseBtn color="red" text-color="white" :loading="isDeleting" @click="confirmDelete">
              بله، حذف شود
            </BaseBtn>
            <BaseBtn
              color="gray"
              outline
              text-color="black"
              :disable="isDeleting"
              @click="deleteOpen = false"
            >
              انصراف
            </BaseBtn>
          </div>
        </div>
      </BaseDialog>
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import BaseListPage from '@/components/base/list-page/BaseListPage.vue'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseInput from '@/components/base/inputs/base-input/BaseInput.vue'
import type { Column } from '@/components/base/table/types'
import { toFaNumber } from '@/utils/formatNumber.ts'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type CommentRow = {
  id: string
  body: string
  rating: number | null
  status: CommentStatus
  showOnHome: boolean
  parentId: string | null
  createdAt: string
  isReply: boolean
  replyCount: number
  user: {
    id: string
    fullName: string
    mobile: string
    role: 'CUSTOMER' | 'ADMIN'
  }
  product: { id: string; name: string; slug: string }
  parent: { id: string; excerpt: string } | null
}

type CommentsResponse = {
  status: string
  data: {
    items: CommentRow[]
    counts: Record<CommentStatus, number>
    home: { selected: number; max: number }
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage } = useApiError()

const STATUS_META: Record<CommentStatus, { label: string; class: string }> = {
  PENDING: { label: 'در انتظار تأیید', class: 'bg-amber-50 text-amber-700' },
  APPROVED: { label: 'تأییدشده', class: 'bg-green-50 text-green-700' },
  REJECTED: { label: 'ردشده', class: 'bg-gray-100 text-gray-500' },
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

// ───── وضعیت جدول و فیلترها ─────
const route = useRoute()
const router = useRouter()

const DEFAULT_LIMIT = 10
const LIMIT_OPTIONS = [10, 20, 50]
const URL_KEYS = ['page', 'limit', 'search', 'status', 'type', 'home']

// اولین مقدار رشته‌ای پارامتر آدرس (یا undefined)
const first = (value: unknown): string | undefined => {
  const item = Array.isArray(value) ? value[0] : value

  return typeof item === 'string' && item.trim() ? item.trim() : undefined
}

const STATUS_VALUES: CommentStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

// آدرس را به وضعیت جدول تبدیل می‌کند؛ مقدارهای نامعتبر نادیده گرفته می‌شوند
const parseState = (urlQuery: typeof route.query) => {
  const pageNumber = Number.parseInt(first(urlQuery.page) ?? '', 10)
  const limitNumber = Number.parseInt(first(urlQuery.limit) ?? '', 10)
  const status = first(urlQuery.status) as CommentStatus | undefined
  const typeValue = first(urlQuery.type)
  const homeValue = first(urlQuery.home)

  const type: 'root' | 'reply' | null
    = typeValue === 'root' || typeValue === 'reply' ? typeValue : null
  const home: 'true' | 'false' | null
    = homeValue === 'true' || homeValue === 'false' ? homeValue : null

  return {
    // آدرس یک‌مبناست و BaseListPage صفرمبنا
    page: Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber - 1 : 0,
    rowsPerPage: LIMIT_OPTIONS.includes(limitNumber) ? limitNumber : DEFAULT_LIMIT,
    search: (first(urlQuery.search) ?? '').slice(0, 100),
    status: status && STATUS_VALUES.includes(status) ? status : null,
    type,
    home,
  }
}

// وضعیت اولیه از آدرس خوانده می‌شود، پس اولین درخواست هم با همین مقدارهاست
const initial = parseState(route.query)

const page = ref(initial.page) // BaseListPage صفرمبناست
const rowsPerPage = ref(initial.rowsPerPage)
const search = ref(initial.search)
const statusFilter = ref<CommentStatus | null>(initial.status)
const typeFilter = ref<'root' | 'reply' | null>(initial.type)
const homeFilter = ref<'true' | 'false' | null>(initial.home)

// آدرسی که از وضعیت فعلی ساخته می‌شود (پیش‌فرض‌ها در آدرس نمی‌آیند)
const buildUrlQuery = () => {
  const next: Partial<Record<string, string>> = {}

  if (page.value > 0) next.page = String(page.value + 1)
  if (rowsPerPage.value !== DEFAULT_LIMIT) next.limit = String(rowsPerPage.value)

  const text = search.value.trim()

  if (text) next.search = text
  if (statusFilter.value) next.status = statusFilter.value
  if (typeFilter.value) next.type = typeFilter.value
  if (homeFilter.value) next.home = homeFilter.value

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
  [page, rowsPerPage, search, statusFilter, typeFilter, homeFilter],
  () => {
    const next = buildUrlQuery()

    if (isSameAsUrl(next)) return

    router.replace({ query: { ...otherUrlQuery(), ...next } })
  },
)

// جلوگیری از برگشت به صفحه‌ی اول وقتی تغییر فیلتر از آدرس آمده (دکمه‌ی برگشت مرورگر)
let applyingUrl = false

// با تغییر فیلتر توسط کاربر، به صفحه‌ی اول برمی‌گردیم
watch([statusFilter, typeFilter, homeFilter], () => {
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
    typeFilter.value = state.type
    homeFilter.value = state.home

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
  type: typeFilter.value ?? undefined,
  showOnHome: homeFilter.value ?? undefined,
}))

const { data, status: fetchStatus, error, refresh } = useApiFetch<CommentsResponse>(
  '/admin/comments',
  {
    key: 'admin-comments',
    server: false, // ادمین نیاز به SSR ندارد
    lazy: true,
    query,
  },
)

const rows = computed(() => data.value?.data.items ?? [])
const totalElements = computed(() => data.value?.data.pagination.total ?? 0)
const totalPages = computed(() => data.value?.data.pagination.totalPages ?? 0)
const homeInfo = computed(() => data.value?.data.home ?? null)

// اگر صفحه‌ی فعلی بعد از حذف یا تغییر وضعیت دیگر وجود ندارد، به آخرین صفحه برمی‌گردد
watch(totalPages, (total) => {
  if (total > 0 && page.value >= total) page.value = total - 1
})

const isFirstLoading = computed(
  () => !data.value && (fetchStatus.value === 'idle' || fetchStatus.value === 'pending'),
)
const isRefreshing = computed(
  () => !!data.value && fetchStatus.value === 'pending',
)

watch(error, (value) => {
  if (value) toast.error(getMessage(value, 'دریافت لیست نظرات ناموفق بود'))
})

// ───── گزینه‌های فیلتر ─────
const statusOptions = computed(() => {
  const counts = data.value?.data.counts

  const withCount = (label: string, status: CommentStatus) =>
    counts ? `${label} (${toFaNumber(counts[status])})` : label

  return [
    { value: 'PENDING', label: withCount('در انتظار تأیید', 'PENDING') },
    { value: 'APPROVED', label: withCount('تأییدشده', 'APPROVED') },
    { value: 'REJECTED', label: withCount('ردشده', 'REJECTED') },
  ]
})

const typeOptions = [
  { value: 'root', label: 'نظر اصلی' },
  { value: 'reply', label: 'پاسخ' },
]

const homeOptions = [
  { value: 'true', label: 'منتخب' },
  { value: 'false', label: 'غیرمنتخب' },
]

// ───── ستون‌ها ─────
const columns: Column[] = [
  { name: 'author', label: 'نویسنده', field: 'user' },
  { name: 'body', label: 'نظر', field: 'body' },
  { name: 'rating', label: 'امتیاز', field: 'rating' },
  { name: 'status', label: 'وضعیت', field: 'status' },
  { name: 'showOnHome', label: 'صفحه‌ی اصلی', field: 'showOnHome' },
  { name: 'createdAt', label: 'تاریخ', field: 'createdAt' },
  { name: 'actions', label: 'عملیات', field: 'id' },
]

// ───── تأیید، رد و نمایش در صفحه‌ی اصلی ─────
const busyIds = ref<string[]>([])

const patchComment = async (
  row: CommentRow,
  body: { status?: CommentStatus; showOnHome?: boolean },
  successMessage: string,
) => {
  if (busyIds.value.includes(row.id)) return

  busyIds.value.push(row.id)

  try {
    await request(`/admin/comments/${row.id}`, { method: 'PATCH', body })

    toast.success(successMessage)
    await refresh()
  }
  catch (e) {
    // مثلاً: حداکثر ۱۲ نظر برای صفحه‌ی اصلی انتخاب شده است
    toast.error(getMessage(e))
  }
  finally {
    busyIds.value = busyIds.value.filter(id => id !== row.id)
  }
}

const setStatus = (row: CommentRow, status: CommentStatus) =>
  patchComment(
    row,
    { status },
    status === 'APPROVED' ? 'نظر تأیید شد' : 'نظر رد شد',
  )

// فقط نظر اصلیِ تأییدشده می‌تواند در صفحه‌ی اصلی نمایش داده شود
const canShowOnHome = (row: CommentRow) =>
  !row.isReply && row.status === 'APPROVED'

const homeToggleHint = (row: CommentRow) => {
  if (row.isReply) return 'پاسخ در صفحه‌ی اصلی نمایش داده نمی‌شود'
  if (row.status !== 'APPROVED') return 'ابتدا نظر را تأیید کنید'

  return row.showOnHome ? 'حذف از صفحه‌ی اصلی' : 'نمایش در صفحه‌ی اصلی'
}

const toggleHome = (row: CommentRow) => {
  if (!canShowOnHome(row)) return

  return patchComment(
    row,
    { showOnHome: !row.showOnHome },
    row.showOnHome ? 'از صفحه‌ی اصلی حذف شد' : 'در صفحه‌ی اصلی نمایش داده می‌شود',
  )
}

// ───── پاسخ ─────
const replyOpen = ref(false)
const replyTarget = ref<CommentRow | null>(null)
const replyBody = ref('')
const replyError = ref<string | undefined>()
const isReplying = ref(false)

const openReply = (row: CommentRow) => {
  replyTarget.value = row
  replyBody.value = ''
  replyError.value = undefined
  replyOpen.value = true
}

const submitReply = async () => {
  if (!replyTarget.value || isReplying.value) return

  const body = replyBody.value.trim()

  if (body.length < 3) {
    replyError.value = 'متن پاسخ باید حداقل ۳ کاراکتر باشد'
    return
  }

  replyError.value = undefined
  isReplying.value = true

  try {
    await request(`/admin/comments/${replyTarget.value.id}/reply`, {
      method: 'POST',
      body: { body },
    })

    replyOpen.value = false
    toast.success('پاسخ ثبت شد و در سایت نمایش داده می‌شود')
    await refresh()
  }
  catch (e) {
    toast.error(getMessage(e))
  }
  finally {
    isReplying.value = false
  }
}

// ───── حذف ─────
const deleteOpen = ref(false)
const deleteTarget = ref<CommentRow | null>(null)
const isDeleting = ref(false)

const askDelete = (row: CommentRow) => {
  deleteTarget.value = row
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value || isDeleting.value) return

  isDeleting.value = true

  try {
    await request(`/admin/comments/${deleteTarget.value.id}`, { method: 'DELETE' })

    deleteOpen.value = false
    toast.success('نظر حذف شد')
    await refresh()
  }
  catch (e) {
    toast.error(getMessage(e))
  }
  finally {
    isDeleting.value = false
  }
}
</script>