<template>
  <BaseDialog
    v-model="open"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    position="center"
  >
    <div v-if="section" dir="rtl" class="flex h-full min-h-0 flex-col overflow-y-auto">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-4">
        <div class="flex items-center gap-2">
          <BaseBtn
            color="gray"
            :size="isMobile ? 'sm' : 'md'"
            class="!bg-transparent"
            text-color="gray"
            unelevated
            round
            @click="open = false"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </BaseBtn>

          <div class="flex flex-col">
            <span class="text-xl font-semibold">{{ pageTitle }}</span>
            <span class="text-xs text-gray-500">
              {{ toFaNumber(list.length) }} از {{ toFaNumber(itemLimit) }} {{ noun }}
            </span>
          </div>
        </div>

        <BaseBtn color="black" :disable="!canAdd" @click="openCreate">
          + افزودن {{ noun }}
        </BaseBtn>
      </div>

      <div class="mx-auto flex w-full max-w-4xl flex-col gap-4 p-5">
        <!-- نوار ترتیب ذخیره‌نشده -->
        <div
          v-if="isDirty"
          class="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
          role="status"
        >
          <span class="text-sm text-amber-800">ترتیب جدید هنوز ذخیره نشده است.</span>

          <div class="flex items-center gap-2">
            <BaseBtn size="sm" color="black" :loading="isSavingOrder" @click="saveOrder">
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

        <p v-if="list.length === 0" class="py-10 text-center text-sm text-gray-500">
          هنوز {{ noun }}ی ثبت نشده است. با «افزودن {{ noun }}» شروع کنید؛ تا آن موقع
          این بخش در سایت نمایش داده نمی‌شود.
        </p>

        <!-- لیست آیتم‌ها -->
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
            v-for="(item, index) in list"
            :key="item.id"
            class="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center"
            :class="item.isActive ? 'bg-white' : 'bg-gray-50'"
          >
            <!-- دستگیره و جابه‌جایی -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="drag-handle cursor-grab touch-none text-gray-400 hover:text-gray-700"
                aria-label="کشیدن برای جابه‌جایی"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                  @click="moveItem(index, -1)"
                >
                  ▲
                </button>
                <button
                  type="button"
                  class="px-1 text-xs leading-none text-gray-400 hover:text-gray-800 disabled:opacity-30"
                  aria-label="انتقال به پایین"
                  :disabled="index === list.length - 1 || isSavingOrder"
                  @click="moveItem(index, 1)"
                >
                  ▼
                </button>
              </div>
            </div>

            <!-- پیش‌نمایش عکس‌ها -->
            <div class="flex shrink-0 items-center gap-2" :class="{ 'opacity-60': !item.isActive }">
              <BaseImg
                :src="assetUrl(item.imageUrl)"
                :alt="item.alt ?? item.title ?? ''"
                width="136px"
                height="68px"
                fit="cover"
                no-spinner
                class="shrink-0 rounded-lg border border-gray-200 bg-gray-100"
              />

              <BaseImg
                v-if="item.mobileImageUrl"
                :src="assetUrl(item.mobileImageUrl)"
                alt=""
                width="54px"
                height="68px"
                fit="cover"
                no-spinner
                class="shrink-0 rounded-lg border border-gray-200 bg-gray-100"
              />
            </div>

            <!-- اطلاعات -->
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-800">
                  {{ item.title || '(بدون عنوان)' }}
                </span>

                <span
                  class="rounded-full px-2 py-0.5 text-[11px]"
                  :class="statusClass(item)"
                >
                  {{ statusText(item) }}
                </span>
              </div>

              <span v-if="item.subtitle" class="truncate text-xs text-gray-500">
                {{ item.subtitle }}
              </span>

              <span
                v-if="item.linkUrl"
                dir="ltr"
                class="truncate text-start text-xs text-blue-600"
              >
                {{ item.linkUrl }}
              </span>
              <span v-else class="text-xs text-gray-400">بدون لینک</span>

              <span v-if="item.startsAt || item.endsAt" class="text-xs text-gray-500">
                {{ scheduleText(item) }}
              </span>
            </div>

            <!-- عملیات -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                role="switch"
                :aria-checked="item.isActive"
                :aria-label="item.isActive ? 'خاموش کردن' : 'روشن کردن'"
                class="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50"
                :class="item.isActive ? 'bg-green-500' : 'bg-gray-300'"
                :disabled="busyIds.includes(item.id)"
                @click="toggleItem(item)"
              >
                <span
                  class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                  :class="item.isActive ? 'end-0.5' : 'start-0.5'"
                />
              </button>

              <BaseBtn
                size="sm"
                outline
                color="gray"
                text-color="black"
                class="!bg-white"
                @click="openEdit(item)"
              >
                ویرایش
              </BaseBtn>

              <BaseBtn
                size="sm"
                outline
                color="gray"
                class="!bg-white !text-red-600"
                @click="askDelete(item)"
              >
                حذف
              </BaseBtn>
            </div>
          </li>
        </VueDraggable>
      </div>

      <!-- فرم آیتم (داخل همین دیالوگ، تا روی آن باز شود) -->
      <AdminHomeItemFormDialog
        v-model="formOpen"
        :section-id="section.id"
        :section-type="sectionType"
        :columns="columns"
        :item="editing"
        @saved="onSaved"
      />

      <!-- تأیید حذف -->
      <BaseDialog v-model="deleteOpen" :persistent="isDeleting" position="center">
        <div dir="rtl" class="flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 class="text-base font-semibold text-gray-800">حذف {{ noun }}</h2>
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

          <div class="p-5 text-sm text-gray-700">
            <p>
              آیا از حذف این {{ noun }} مطمئن هستید؟ عکس‌های آن هم پاک می‌شوند و این
              کار قابل بازگشت نیست. اگر فقط می‌خواهید از سایت پنهان شود، آن را خاموش کنید.
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
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import { toFaNumber } from '@/utils/formatNumber.ts'
import type { HomeItem, HomeSection } from '~/types/home'

const { isMobile } = useMobile()
const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage, getStatus } = useApiError()
const config = useRuntimeConfig()

const props = defineProps<{ section: HomeSection | null }>()

const open = defineModel<boolean>({ required: true })

// بعد از هر تغییر، صفحه‌ی والد داده‌ی تازه می‌گیرد
const emit = defineEmits<{ changed: [] }>()

const sectionType = computed<'SLIDER' | 'BANNERS'>(() =>
  props.section?.type === 'SLIDER' ? 'SLIDER' : 'BANNERS',
)

const noun = computed(() => (sectionType.value === 'SLIDER' ? 'اسلاید' : 'بنر'))

const pageTitle = computed(() =>
  sectionType.value === 'SLIDER'
    ? 'مدیریت اسلایدها'
    : `مدیریت بنرها${props.section?.title ? ` — ${props.section.title}` : ''}`,
)

const itemLimit = computed(() => props.section?.itemLimit ?? 0)

const columns = computed(() => {
  const value = (props.section?.config ?? {}).columns

  return typeof value === 'number' ? value : 2
})

// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string) => `${config.public.apiBaseUrl}${path}`

// ───── لیست و ترتیب ─────
const serverItems = computed(() => props.section?.items ?? [])
const list = ref<HomeItem[]>([])

// با رسیدن داده‌ی تازه، ترتیب ذخیره‌نشده‌ی کاربر حفظ می‌شود
watch(
  serverItems,
  (fresh) => {
    const byId = new Map(fresh.map(item => [item.id, item]))

    const kept = list.value
      .filter(item => byId.has(item.id))
      .map(item => byId.get(item.id)!)

    const keptIds = new Set(kept.map(item => item.id))

    list.value = [...kept, ...fresh.filter(item => !keptIds.has(item.id))]
  },
  { immediate: true },
)

const isDirty = computed(
  () =>
    list.value.map(item => item.id).join('|')
    !== serverItems.value.map(item => item.id).join('|'),
)

const canAdd = computed(() => list.value.length < itemLimit.value)

const isSavingOrder = ref(false)

const moveItem = (index: number, delta: -1 | 1) => {
  const target = index + delta

  if (target < 0 || target >= list.value.length) return

  const next = [...list.value]
  const [moved] = next.splice(index, 1)

  if (!moved) return

  next.splice(target, 0, moved)
  list.value = next
}

const resetOrder = () => {
  list.value = [...serverItems.value]
}

const saveOrder = async () => {
  if (!props.section || isSavingOrder.value) return

  isSavingOrder.value = true

  try {
    await request(`/admin/home/sections/${props.section.id}/items/order`, {
      method: 'PUT',
      body: { ids: list.value.map(item => item.id) },
    })

    toast.success('ترتیب ذخیره شد')
    emit('changed')
  }
  catch (error) {
    toast.error(getMessage(error))

    // فهرست با دیتابیس نمی‌خواند
    if (getStatus(error) === 409) emit('changed')
  }
  finally {
    isSavingOrder.value = false
  }
}

// با بستن دیالوگ، ترتیب ذخیره‌نشده کنار گذاشته می‌شود
watch(open, (isOpen) => {
  if (isOpen) return

  if (isDirty.value) toast.warning('ترتیب ذخیره‌نشده نادیده گرفته شد')

  resetOrder()
})

// اگر بخش در این فاصله حذف شد، دیالوگ بسته می‌شود
watch(
  () => props.section,
  (value) => {
    if (!value && open.value) open.value = false
  },
)

// ───── روشن و خاموش ─────
const busyIds = ref<string[]>([])

const toggleItem = async (item: HomeItem) => {
  if (!props.section || busyIds.value.includes(item.id)) return

  busyIds.value.push(item.id)

  try {
    // ویرایش کامل است؛ پس همه‌ی فیلدهای فعلی دوباره فرستاده می‌شوند (بدون عکس)
    const form = new FormData()

    form.append('title', item.title ?? '')
    form.append('subtitle', item.subtitle ?? '')
    form.append('buttonText', item.buttonText ?? '')
    form.append('alt', item.alt ?? '')
    form.append('linkUrl', item.linkUrl ?? '')
    form.append('startsAt', item.startsAt ?? '')
    form.append('endsAt', item.endsAt ?? '')
    form.append('isActive', String(!item.isActive))

    await request(
      `/admin/home/sections/${props.section.id}/items/${item.id}`,
      { method: 'PUT', body: form },
    )

    toast.success(item.isActive ? `${noun.value} خاموش شد` : `${noun.value} روشن شد`)
    emit('changed')
  }
  catch (error) {
    toast.error(getMessage(error))
  }
  finally {
    busyIds.value = busyIds.value.filter(id => id !== item.id)
  }
}

// ───── ساخت و ویرایش ─────
const formOpen = ref(false)
const editing = ref<HomeItem | null>(null)

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (item: HomeItem) => {
  editing.value = item
  formOpen.value = true
}

const onSaved = (payload: { mode: 'create' | 'edit' }) => {
  formOpen.value = false

  toast.success(
    payload.mode === 'create'
      ? `${noun.value} اضافه شد`
      : `تغییرات ${noun.value} ذخیره شد`,
  )

  emit('changed')
}

// ───── حذف ─────
const deleteOpen = ref(false)
const deleting = ref<HomeItem | null>(null)
const isDeleting = ref(false)

const askDelete = (item: HomeItem) => {
  deleting.value = item
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!props.section || !deleting.value || isDeleting.value) return

  isDeleting.value = true

  try {
    await request(
      `/admin/home/sections/${props.section.id}/items/${deleting.value.id}`,
      { method: 'DELETE' },
    )

    deleteOpen.value = false
    toast.success(`${noun.value} حذف شد`)
    emit('changed')
  }
  catch (error) {
    toast.error(getMessage(error))
  }
  finally {
    isDeleting.value = false
  }
}

// ───── نمایش ─────
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const scheduleText = (item: HomeItem) => {
  const from = item.startsAt ? dateFormatter.format(new Date(item.startsAt)) : null
  const to = item.endsAt ? dateFormatter.format(new Date(item.endsAt)) : null

  if (from && to) return `از ${from} تا ${to}`
  if (from) return `از ${from}`

  return `تا ${to}`
}

const statusText = (item: HomeItem) => {
  if (!item.isActive) return 'غیرفعال'

  return item.isLive ? 'در حال نمایش' : 'خارج از بازه‌ی نمایش'
}

const statusClass = (item: HomeItem) => {
  if (!item.isActive) return 'bg-gray-100 text-gray-500'

  return item.isLive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
}
</script>