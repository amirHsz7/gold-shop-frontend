<template>
  <BaseDialog v-model="open" persistent position="center">
    <div dir="rtl" class="flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 class="text-base font-semibold text-gray-800">{{ dialogTitle }}</h2>
        <button
          type="button"
          class="text-2xl leading-none text-gray-500 hover:text-gray-800 disabled:opacity-50"
          aria-label="بستن"
          :disabled="isSaving"
          @click="open = false"
        >
          ×
        </button>
      </div>

      <!-- Form -->
      <BaseForm class="flex flex-col gap-4 p-5" @submit.prevent="submit">
        <p class="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-6 text-gray-600">
          {{ typeHint }}
        </p>

        <BaseInput
          v-model="title"
          dense
          label="عنوان بخش (اختیاری)"
          maxlength="120"
          :disabled="isSaving"
          :error="!!errors.title"
          :error-message="errors.title"
        />

        <BaseInput
          v-model="subtitle"
          dense
          label="زیرعنوان (اختیاری)"
          maxlength="200"
          :disabled="isSaving"
          :error="!!errors.subtitle"
          :error-message="errors.subtitle"
        />

        <!-- تنظیمات بخش محصولات -->
        <template v-if="type === 'PRODUCTS'">
          <BaseSelect
            v-model="source"
            label="کدام محصولات"
            :options="HOME_SOURCE_OPTIONS"
            emit-value
            dense
            :dialog="isMobile"
            dialog-title="انتخاب نوع محصولات"
            :disabled="isSaving"
            :error="!!errors.source"
            :error-message="errors.source"
          />

          <BaseSelect
            v-model="categorySlug"
            label="فقط از دسته‌بندی (اختیاری)"
            placeholder="همه‌ی دسته‌ها"
            :options="categoryOptions"
            emit-value
            clearable
            searchable
            dense
            :dialog="isMobile"
            dialog-title="انتخاب دسته‌بندی"
            :loading="isLoadingOptions"
            :disabled="isSaving"
          />

          <BaseSelect
            v-model="collectionSlug"
            label="فقط از کالکشن (اختیاری)"
            placeholder="همه‌ی کالکشن‌ها"
            :options="collectionOptions"
            emit-value
            clearable
            dense
            :dialog="isMobile"
            dialog-title="انتخاب کالکشن"
            :loading="isLoadingOptions"
            :disabled="isSaving"
          />
        </template>

        <!-- تعداد نمایش: محصولات، دسته‌ها و کالکشن‌ها -->
        <BaseInput
          v-if="hasLimit"
          v-model="limit"
          dense
          type="number"
          :label="type === 'PRODUCTS' ? 'تعداد محصول (۱ تا ۲۴)' : 'حداکثر تعداد نمایش (۱ تا ۲۴)'"
          min="1"
          max="24"
          step="1"
          :disabled="isSaving"
          :error="!!errors.limit"
          :error-message="errors.limit"
        />

        <!-- ستون‌های بنر -->
        <BaseInput
          v-if="type === 'BANNERS'"
          v-model="columns"
          dense
          type="number"
          label="تعداد ستون بنرها (۱ تا ۴)"
          min="1"
          max="4"
          step="1"
          :disabled="isSaving"
          :error="!!errors.columns"
          :error-message="errors.columns"
        />

        <!-- پخش خودکار اسلایدر -->
        <BaseInput
          v-if="type === 'SLIDER'"
          v-model="autoplaySec"
          dense
          type="number"
          label="فاصله‌ی پخش خودکار (ثانیه، ۰ یعنی خاموش)"
          min="0"
          max="30"
          step="0.5"
          :disabled="isSaving"
          :error="!!errors.autoplay"
          :error-message="errors.autoplay"
        />

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input
            v-model="isActive"
            type="checkbox"
            class="h-4 w-4 rounded"
            :disabled="isSaving"
          />
          <span>فعال (نمایش در سایت)</span>
        </label>

        <!-- برای ارسال فرم با Enter -->
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </BaseForm>

      <!-- Footer -->
      <div class="flex justify-start gap-2 border-t border-gray-200 px-5 py-3">
        <BaseBtn color="black" :loading="isSaving" @click="submit">
          {{ isEdit ? 'ذخیره تغییرات' : 'ساخت بخش' }}
        </BaseBtn>
        <BaseBtn
          color="gray"
          outline
          text-color="black"
          :disable="isSaving"
          @click="open = false"
        >
          انصراف
        </BaseBtn>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import { useApiError } from '~/composables/useApiError';
import {
  HOME_SOURCE_OPTIONS,
  HOME_TYPE_LABELS,
  type HomeSection,
  type HomeSectionType,
} from '~/types/home'

const { isMobile } = useMobile()
const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage, getFieldErrors } = useApiError()

type Option = { value: string; label: string }
type FieldKey = 'title' | 'subtitle' | 'source' | 'limit' | 'columns' | 'autoplay'

type CategoryNode = {
  slug: string
  name: string
  isActive: boolean
  children: { slug: string; name: string; isActive: boolean }[]
}

type CollectionRow = { slug: string; name: string; isActive: boolean }

const props = defineProps<{
  // خالی یعنی ساخت بخش جدید، پر یعنی ویرایش همان بخش
  section?: HomeSection | null
  // نوع بخش جدید (فقط در حالت ساخت)
  initialType?: 'PRODUCTS' | 'BANNERS'
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: [payload: { mode: 'create' | 'edit' }]
}>()

const isEdit = computed(() => !!props.section)

const type = computed<HomeSectionType>(
  () => props.section?.type ?? props.initialType ?? 'PRODUCTS',
)

const hasLimit = computed(() =>
  ['PRODUCTS', 'CATEGORIES', 'COLLECTIONS'].includes(type.value),
)

const dialogTitle = computed(() =>
  isEdit.value
    ? `ویرایش بخش «${HOME_TYPE_LABELS[type.value]}»`
    : `افزودن بخش ${HOME_TYPE_LABELS[type.value]}`,
)

const TYPE_HINTS: Record<HomeSectionType, string> = {
  SLIDER: 'اسلایدر اصلی صفحه. خود اسلایدها (عکس و لینک) از «مدیریت اسلایدها» ساخته می‌شوند.',
  BANNERS: 'مجموعه‌ای از بنرهای تصویری. خود بنرها از «مدیریت بنرها» ساخته می‌شوند.',
  PRODUCTS: 'لیست خودکار محصولات؛ بر اساس نوع، دسته‌بندی و کالکشن انتخاب‌شده.',
  CATEGORIES: 'دسته‌بندی‌های اصلی فعال فروشگاه، به‌صورت خودکار.',
  COLLECTIONS: 'کالکشن‌های فعال فروشگاه، به‌صورت خودکار.',
  TESTIMONIALS: 'نظرهایی که در صفحه‌ی «نظرات» برای صفحه‌ی اصلی انتخاب شده‌اند.',
  MAP: 'مختصات و آدرس از صفحه‌ی «اطلاعات فروشگاه» خوانده می‌شود.',
}

const typeHint = computed(() => TYPE_HINTS[type.value])

// ───── وضعیت فرم ─────
const title = ref('')
const subtitle = ref('')
const isActive = ref(true)

const source = ref('newest')
const categorySlug = ref<string | null>(null)
const collectionSlug = ref<string | null>(null)
// BaseInput از نوع number مقدار را به‌صورت رشته برمی‌گرداند
const limit = ref<string | number>(8)
const columns = ref<string | number>(2)
const autoplaySec = ref<string | number>(5)

const errors = reactive<Partial<Record<FieldKey, string>>>({})
const isSaving = ref(false)

// ───── گزینه‌های دسته‌بندی و کالکشن ─────
const categories = ref<CategoryNode[]>([])
const collections = ref<CollectionRow[]>([])
const isLoadingOptions = ref(false)

const withCurrent = (options: Option[], current: string | null) =>
  current && !options.some(option => option.value === current)
    ? [...options, { value: current, label: `${current} (یافت نشد)` }]
    : options

const categoryOptions = computed(() =>
  withCurrent(
    categories.value.flatMap(root => [
      { value: root.slug, label: root.isActive ? root.name : `${root.name} (غیرفعال)` },
      ...root.children.map(child => ({
        value: child.slug,
        label: `${root.name} › ${child.name}${child.isActive ? '' : ' (غیرفعال)'}`,
      })),
    ]),
    categorySlug.value,
  ),
)

const collectionOptions = computed(() =>
  withCurrent(
    collections.value.map(collection => ({
      value: collection.slug,
      label: collection.isActive ? collection.name : `${collection.name} (غیرفعال)`,
    })),
    collectionSlug.value,
  ),
)

const loadOptions = async () => {
  isLoadingOptions.value = true

  try {
    const [categoryResponse, collectionResponse] = await Promise.all([
      request<{ data: CategoryNode[] }>('/admin/categories'),
      request<{ data: CollectionRow[] }>('/admin/collections'),
    ])

    categories.value = categoryResponse.data
    collections.value = collectionResponse.data
  }
  catch (error) {
    toast.error(getMessage(error, 'دریافت دسته‌بندی‌ها و کالکشن‌ها ناموفق بود'))
  }
  finally {
    isLoadingOptions.value = false
  }
}

// ───── پر کردن فرم ─────
const clearErrors = () => {
  errors.title = undefined
  errors.subtitle = undefined
  errors.source = undefined
  errors.limit = undefined
  errors.columns = undefined
  errors.autoplay = undefined
}

const numberOf = (value: unknown, fallback: number) =>
  typeof value === 'number' ? value : fallback

watch(open, async (isOpen) => {
  if (!isOpen) return

  const current = props.section
  const config = (current?.config ?? {}) as Record<string, unknown>

  title.value = current?.title ?? ''
  subtitle.value = current?.subtitle ?? ''
  isActive.value = current?.isActive ?? true

  source.value
    = typeof config.source === 'string' ? config.source : 'newest'
  categorySlug.value
    = typeof config.category === 'string' && config.category ? config.category : null
  collectionSlug.value
    = typeof config.collection === 'string' && config.collection ? config.collection : null

  limit.value = numberOf(config.limit, type.value === 'PRODUCTS' ? 8 : 12)
  columns.value = numberOf(config.columns, 2)
  autoplaySec.value = numberOf(config.autoplayMs, 5000) / 1000

  clearErrors()

  if (type.value === 'PRODUCTS') await loadOptions()
})

// ───── اعتبارسنجی و ذخیره ─────
const isFilled = (value: string | number) => String(value).trim() !== ''

const validate = () => {
  clearErrors()

  if (title.value.trim().length > 120) {
    errors.title = 'عنوان نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد'
  }

  if (subtitle.value.trim().length > 200) {
    errors.subtitle = 'زیرعنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'
  }

  if (hasLimit.value) {
    const value = Number(limit.value)

    if (!isFilled(limit.value) || !Number.isInteger(value) || value < 1 || value > 24) {
      errors.limit = 'تعداد باید عدد صحیح بین ۱ تا ۲۴ باشد'
    }
  }

  if (type.value === 'BANNERS') {
    const value = Number(columns.value)

    if (!isFilled(columns.value) || !Number.isInteger(value) || value < 1 || value > 4) {
      errors.columns = 'تعداد ستون باید عدد صحیح بین ۱ تا ۴ باشد'
    }
  }

  if (type.value === 'SLIDER') {
    const value = Number(autoplaySec.value)

    if (!isFilled(autoplaySec.value) || !Number.isFinite(value) || value < 0 || value > 30) {
      errors.autoplay = 'زمان باید عددی بین ۰ تا ۳۰ ثانیه باشد'
    }
  }

  return !Object.values(errors).some(Boolean)
}

const buildConfig = (): Record<string, unknown> | undefined => {
  switch (type.value) {
    case 'PRODUCTS':
      return {
        source: source.value,
        limit: Number(limit.value),
        ...(categorySlug.value ? { category: categorySlug.value } : {}),
        ...(collectionSlug.value ? { collection: collectionSlug.value } : {}),
      }

    case 'BANNERS':
      return { columns: Number(columns.value) }

    case 'SLIDER':
      return { autoplayMs: Math.round(Number(autoplaySec.value) * 1000) }

    case 'CATEGORIES':
    case 'COLLECTIONS':
      return { limit: Number(limit.value) }

    // نظرات و نقشه تنظیماتی ندارند
    default:
      return undefined
  }
}

const CONFIG_FIELD_MAP: Record<string, FieldKey> = {
  'config.source': 'source',
  'config.limit': 'limit',
  'config.columns': 'columns',
  'config.autoplayMs': 'autoplay',
  title: 'title',
  subtitle: 'subtitle',
}

const applyApiError = (error: unknown) => {
  let mapped = false

  for (const item of getFieldErrors(error)) {
    const key = CONFIG_FIELD_MAP[item.field]

    if (key) {
      errors[key] = item.message
      mapped = true
    }
  }

  toast.error(mapped ? 'لطفاً خطاهای فرم را برطرف کنید' : getMessage(error))
}

const submit = async () => {
  if (isSaving.value) return

  if (!validate()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }

  isSaving.value = true

  try {
    const body = {
      title: title.value.trim(),
      subtitle: subtitle.value.trim(),
      isActive: isActive.value,
      config: buildConfig(),
    }

    if (props.section) {
      await request(`/admin/home/sections/${props.section.id}`, {
        method: 'PUT',
        body,
      })
    }
    else {
      await request('/admin/home/sections', {
        method: 'POST',
        body: { type: type.value, ...body },
      })
    }

    emit('saved', { mode: isEdit.value ? 'edit' : 'create' })
  }
  catch (error) {
    applyApiError(error)
  }
  finally {
    isSaving.value = false
  }
}
</script>