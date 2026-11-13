<template>
  <main dir="rtl" class="mx-auto px-4 py-6">
    <!-- Header -->
    <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-gray-800">چیدمان صفحه‌ی اصلی</h1>
        <p class="mt-1 text-sm text-gray-500">
          ترتیب بخش‌ها را بکشید و رها کنید، سپس «ذخیره ترتیب» را بزنید.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <BaseBtn
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          :disable="!canAddProducts"
          @click="openCreate('PRODUCTS')"
        >
          + بخش محصولات
          <span class="text-xs text-gray-500">
            ({{ toFaNumber(limits.productSections.used) }}/{{ toFaNumber(limits.productSections.max) }})
          </span>
        </BaseBtn>

        <BaseBtn
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          :disable="!canAddBanners"
          @click="openCreate('BANNERS')"
        >
          + بخش بنر
          <span class="text-xs text-gray-500">
            ({{ toFaNumber(limits.bannerSections.used) }}/{{ toFaNumber(limits.bannerSections.max) }})
          </span>
        </BaseBtn>
      </div>
    </header>

    <!-- نوار ترتیب ذخیره‌نشده -->
    <div
      v-if="isDirty"
      class="sticky top-2 z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
      role="status"
    >
      <span class="text-sm text-amber-800">ترتیب جدید هنوز ذخیره نشده است.</span>

      <div class="flex items-center gap-2">
        <BaseBtn
          size="sm"
          color="black"
          :loading="isSavingOrder"
          @click="saveOrder"
        >
          ذخیره ترتیب
        </BaseBtn>
        <BaseBtn
          size="sm"
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          :disable="isSavingOrder"
          @click="resetOrder"
        >
          انصراف
        </BaseBtn>
      </div>
    </div>

    <p v-if="isLoading" class="py-10 text-center text-sm text-gray-500">
      در حال بارگذاری...
    </p>

    <div v-else-if="error && !data" class="py-10 text-center text-sm text-red-600">
      <p>دریافت چیدمان صفحه‌ی اصلی ناموفق بود.</p>
      <BaseBtn
        class="mt-3"
        outline
        color="gray"
        text-color="black"
        @click="refresh()"
      >
        تلاش دوباره
      </BaseBtn>
    </div>

    <p v-else-if="list.length === 0" class="py-10 text-center text-sm text-gray-500">
      هنوز بخشی وجود ندارد. اگر بخش‌های ثابت ساخته نشده‌اند، دستور
      <span dir="ltr" class="font-mono">npm run home:ensure</span> را اجرا کنید.
    </p>

    <!-- لیست بخش‌ها -->
    <VueDraggable
      v-else
      v-model="list"
      tag="ul"
      class="m-0 flex list-none flex-col gap-3 p-0"
      handle=".drag-handle"
      :animation="150"
      :disabled="isSavingOrder"
    >
      <li
        v-for="(section, index) in list"
        :key="section.id"
        class="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center"
        :class="section.isActive ? 'bg-white' : 'bg-gray-50'"
      >
        <!-- دستگیره و جابه‌جایی -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="drag-handle cursor-grab touch-none text-gray-400 hover:text-gray-700"
            aria-label="کشیدن برای جابه‌جایی"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="9" cy="6" r="1.6" />
              <circle cx="15" cy="6" r="1.6" />
              <circle cx="9" cy="12" r="1.6" />
              <circle cx="15" cy="12" r="1.6" />
              <circle cx="9" cy="18" r="1.6" />
              <circle cx="15" cy="18" r="1.6" />
            </svg>
          </button>

          <div class="flex flex-col">
            <button
              type="button"
              class="px-1 text-xs leading-none text-gray-400 hover:text-gray-800 disabled:opacity-30"
              aria-label="انتقال به بالا"
              :disabled="index === 0 || isSavingOrder"
              @click="moveSection(index, -1)"
            >
              ▲
            </button>
            <button
              type="button"
              class="px-1 text-xs leading-none text-gray-400 hover:text-gray-800 disabled:opacity-30"
              aria-label="انتقال به پایین"
              :disabled="index === list.length - 1 || isSavingOrder"
              @click="moveSection(index, 1)"
            >
              ▼
            </button>
          </div>
        </div>

        <!-- اطلاعات بخش -->
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium text-gray-800">{{ displayTitle(section) }}</span>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
              {{ HOME_TYPE_LABELS[section.type] }}
            </span>
            <span
              v-if="section.isSingleton"
              class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700"
            >
              ثابت
            </span>
          </div>

          <span class="text-xs text-gray-500">{{ summary(section) }}</span>

          <p
            class="flex items-center gap-1.5 text-xs"
            :class="section.visibility.visible ? 'text-green-700' : 'text-amber-700'"
          >
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="section.visibility.visible ? 'bg-green-500' : 'bg-amber-500'"
              aria-hidden="true"
            />
            {{ section.visibility.visible
              ? 'روی سایت نمایش داده می‌شود'
              : section.visibility.reason }}
          </p>
        </div>

        <!-- عملیات -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            role="switch"
            :aria-checked="section.isActive"
            :aria-label="section.isActive ? 'خاموش کردن بخش' : 'روشن کردن بخش'"
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50"
            :class="section.isActive ? 'bg-green-500' : 'bg-gray-300'"
            :disabled="busyIds.includes(section.id)"
            @click="toggleSection(section)"
          >
            <span
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              :class="section.isActive ? 'end-0.5' : 'start-0.5'"
            />
          </button>

          <BaseBtn
            v-if="section.type === 'SLIDER' || section.type === 'BANNERS'"
            size="sm"
            outline
            color="gray"
            text-color="black"
            class="!bg-white"
            @click="openItems(section)"
          >
            {{ section.type === 'SLIDER' ? 'اسلایدها' : 'بنرها' }}
          </BaseBtn>

          <BaseBtn
            v-if="section.type === 'TESTIMONIALS'"
            size="sm"
            outline
            color="gray"
            text-color="black"
            class="!bg-white"
            to="/admin/comments"
          >
            انتخاب نظرها
          </BaseBtn>

          <BaseBtn
            v-if="section.type === 'MAP'"
            size="sm"
            outline
            color="gray"
            text-color="black"
            class="!bg-white"
            to="/admin/shop-info"
          >
            اطلاعات فروشگاه
          </BaseBtn>

          <BaseBtn
            size="sm"
            outline
            color="gray"
            text-color="black"
            class="!bg-white"
            @click="openEdit(section)"
          >
            ویرایش
          </BaseBtn>

          <BaseBtn
            v-if="!section.isSingleton"
            size="sm"
            outline
            color="gray"
            class="!bg-white !text-red-600"
            @click="askDelete(section)"
          >
            حذف
          </BaseBtn>
        </div>
      </li>
    </VueDraggable>

    <!-- دیالوگ‌ها -->
    <AdminHomeSectionFormDialog
      v-model="formOpen"
      :section="editing"
      :initial-type="creatingType"
      @saved="onSaved"
    />

    <AdminHomeSectionDeleteDialog
      v-model="deleteOpen"
      :section="deleting"
      @deleted="onDeleted"
    />

    <AdminHomeItemsDialog
      v-model="itemsOpen"
      :section="itemsSection"
      @changed="refresh()"
    />
  </main>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import { toFaNumber } from '@/utils/formatNumber.ts'
import {
  HOME_SOURCE_OPTIONS,
  HOME_TYPE_LABELS,
  type HomeSection,
  type HomeSectionsResponse,
} from '~/types/home'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage, getStatus } = useApiError()

// ───── دریافت بخش‌ها ─────
const { data, status, error, refresh } = useApiFetch<HomeSectionsResponse>(
  '/admin/home/sections',
  {
    key: 'admin-home-sections',
    server: false, // ادمین نیاز به SSR ندارد
    lazy: true,
  },
)

const serverSections = computed(() => data.value?.data.sections ?? [])

const limits = computed(
  () =>
    data.value?.data.limits ?? {
      productSections: { used: 0, max: 10 },
      bannerSections: { used: 0, max: 6 },
    },
)

const canAddProducts = computed(
  () => limits.value.productSections.used < limits.value.productSections.max,
)
const canAddBanners = computed(
  () => limits.value.bannerSections.used < limits.value.bannerSections.max,
)

const isLoading = computed(
  () => !data.value && (status.value === 'idle' || status.value === 'pending'),
)

watch(error, (value) => {
  if (value) toast.error(getMessage(value, 'دریافت چیدمان صفحه‌ی اصلی ناموفق بود'))
})

// ───── ترتیب ─────
// لیست محلی که کشیده و جابه‌جا می‌شود
const list = ref<HomeSection[]>([])

// با رسیدن داده‌ی تازه، ترتیب ذخیره‌نشده‌ی کاربر حفظ می‌شود
watch(
  serverSections,
  (fresh) => {
    const byId = new Map(fresh.map(section => [section.id, section]))

    const kept = list.value
      .filter(section => byId.has(section.id))
      .map(section => byId.get(section.id)!)

    const keptIds = new Set(kept.map(section => section.id))

    list.value = [
      ...kept,
      ...fresh.filter(section => !keptIds.has(section.id)),
    ]
  },
  { immediate: true },
)

const isDirty = computed(
  () =>
    list.value.map(section => section.id).join('|')
    !== serverSections.value.map(section => section.id).join('|'),
)

const isSavingOrder = ref(false)

const moveSection = (index: number, delta: -1 | 1) => {
  const target = index + delta

  if (target < 0 || target >= list.value.length) return

  const next = [...list.value]
  const [moved] = next.splice(index, 1)

  if (!moved) return

  next.splice(target, 0, moved)
  list.value = next
}

const resetOrder = () => {
  list.value = [...serverSections.value]
}

const saveOrder = async () => {
  if (isSavingOrder.value) return

  isSavingOrder.value = true

  try {
    await request('/admin/home/sections/order', {
      method: 'PUT',
      body: { ids: list.value.map(section => section.id) },
    })

    toast.success('ترتیب بخش‌ها ذخیره شد')
    await refresh()
  }
  catch (e) {
    toast.error(getMessage(e))

    // فهرست با دیتابیس نمی‌خواند (مثلاً ادمین دیگری بخشی ساخته یا حذف کرده)
    if (getStatus(e) === 409) await refresh()
  }
  finally {
    isSavingOrder.value = false
  }
}

// ───── روشن و خاموش ─────
const busyIds = ref<string[]>([])

const toggleSection = async (section: HomeSection) => {
  if (busyIds.value.includes(section.id)) return

  busyIds.value.push(section.id)

  try {
    await request(`/admin/home/sections/${section.id}`, {
      method: 'PATCH',
      body: { isActive: !section.isActive },
    })

    toast.success(section.isActive ? 'بخش خاموش شد' : 'بخش روشن شد')
    await refresh()
  }
  catch (e) {
    toast.error(getMessage(e))
  }
  finally {
    busyIds.value = busyIds.value.filter(id => id !== section.id)
  }
}

// ───── ساخت و ویرایش بخش ─────
const formOpen = ref(false)
const editing = ref<HomeSection | null>(null)
const creatingType = ref<'PRODUCTS' | 'BANNERS'>('PRODUCTS')

const openCreate = (type: 'PRODUCTS' | 'BANNERS') => {
  editing.value = null
  creatingType.value = type
  formOpen.value = true
}

const openEdit = (section: HomeSection) => {
  editing.value = section
  formOpen.value = true
}

const onSaved = async (payload: { mode: 'create' | 'edit' }) => {
  formOpen.value = false

  toast.success(
    payload.mode === 'create' ? 'بخش با موفقیت ساخته شد' : 'تغییرات بخش ذخیره شد',
  )

  await refresh()
}

// ───── مدیریت اسلایدها و بنرها ─────
const itemsOpen = ref(false)
const itemsSectionId = ref<string | null>(null)

// همیشه از داده‌ی تازه‌ی سرور خوانده می‌شود، تا بعد از هر تغییر به‌روز باشد
const itemsSection = computed(
  () => serverSections.value.find(section => section.id === itemsSectionId.value) ?? null,
)

const openItems = (section: HomeSection) => {
  itemsSectionId.value = section.id
  itemsOpen.value = true
}

// ───── حذف بخش ─────
const deleteOpen = ref(false)
const deleting = ref<HomeSection | null>(null)

const askDelete = (section: HomeSection) => {
  deleting.value = section
  deleteOpen.value = true
}

const onDeleted = async (name: string) => {
  deleteOpen.value = false
  toast.success(`بخش «${name}» حذف شد`)

  await refresh()
}

// ───── نمایش ─────
const displayTitle = (section: HomeSection) =>
  section.title || HOME_TYPE_LABELS[section.type]

const numberOf = (value: unknown, fallback: number) =>
  typeof value === 'number' ? value : fallback

const summary = (section: HomeSection) => {
  const config = (section.config ?? {}) as Record<string, unknown>
  const itemCount = section.items?.length ?? 0

  switch (section.type) {
    case 'SLIDER': {
      const ms = numberOf(config.autoplayMs, 5000)

      return `${toFaNumber(itemCount)} اسلاید · ${
        ms > 0 ? `پخش خودکار هر ${toFaNumber(ms / 1000)} ثانیه` : 'بدون پخش خودکار'
      }`
    }

    case 'BANNERS':
      return `${toFaNumber(itemCount)} بنر · ${toFaNumber(numberOf(config.columns, 2))} ستون`

    case 'PRODUCTS': {
      const source
        = HOME_SOURCE_OPTIONS.find(option => option.value === config.source)?.label
        ?? 'جدیدترین‌ها'

      const parts = [
        `${source} · ${toFaNumber(numberOf(config.limit, 8))} محصول`,
      ]

      if (typeof config.category === 'string' && config.category) {
        parts.push(`دسته: ${config.category}`)
      }

      if (typeof config.collection === 'string' && config.collection) {
        parts.push(`کالکشن: ${config.collection}`)
      }

      return parts.join(' · ')
    }

    case 'CATEGORIES':
    case 'COLLECTIONS':
      return `حداکثر ${toFaNumber(numberOf(config.limit, 12))} مورد`

    case 'TESTIMONIALS':
      return 'نظرهایی که ادمین برای صفحه‌ی اصلی انتخاب کرده'

    case 'MAP':
      return 'مختصات و آدرس از اطلاعات فروشگاه'

    default:
      return ''
  }
}
</script>