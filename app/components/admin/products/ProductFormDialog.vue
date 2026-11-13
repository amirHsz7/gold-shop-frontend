<template>
  <BaseDialog
    v-model="open"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    position="center"
  >
    <div dir="rtl" class="flex h-full min-h-0 flex-col overflow-y-auto">
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
            :disable="isSaving"
            @click="cancel"
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

          <span class="text-xl font-semibold">
            {{ isEdit ? 'ویرایش محصول' : 'افزودن محصول' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <BaseBtn
            outline
            color="gray"
            class="!bg-white"
            text-color="black"
            :disable="isSaving"
            @click="cancel"
          >
            بازگشت
          </BaseBtn>

          <BaseBtn
            color="black"
            :loading="isSaving"
            :disable="isLoading"
            @click="submit"
          >
            {{ saveLabel }}
          </BaseBtn>
        </div>
      </div>

      <!-- Tabs + Form -->
      <div class="mx-auto w-full flex-1 p-5">
        <p v-if="isLoading" class="py-20 text-center text-sm text-gray-500">
          در حال دریافت اطلاعات...
        </p>

        <BaseTabs v-else v-model="activeTab" :tabs="tabs">
          <BaseForm
            class="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5"
            @submit.prevent="submit"
          >
            <!-- اطلاعات اصلی (بعد از ذخیره قفل می‌شود) -->
            <section
              v-show="activeTab === 'info'"
              class="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <BaseInput
                v-model="name"
                dense
                label="نام محصول"
                maxlength="150"
                :disabled="locked"
                :error="!!fieldErrors.name"
                :error-message="fieldErrors.name"
              />

              <BaseInput
                v-model="slugModel"
                dense
                dir="ltr"
                label="اسلاگ (بخشی از آدرس)"
                maxlength="120"
                :disabled="locked"
                :hint="slugChanged ? 'با تغییر اسلاگ، لینک‌های قبلی این محصول از کار می‌افتند.' : undefined"
                :error="!!fieldErrors.slug"
                :error-message="fieldErrors.slug"
              />

              <BaseSelect
                v-model="categoryId"
                label="دسته‌بندی"
                placeholder="انتخاب دسته‌بندی"
                :options="categoryOptions"
                emit-value
                searchable
                dense
                :dialog="isMobile"
                dialog-title="انتخاب دسته‌بندی"
                :disabled="locked"
                :error="!!fieldErrors.categoryId"
                :error-message="fieldErrors.categoryId"
              />

              <BaseSelect
                v-model="collectionId"
                label="کالکشن (اختیاری)"
                placeholder="بدون کالکشن"
                :options="collectionOptions"
                emit-value
                clearable
                dense
                :dialog="isMobile"
                dialog-title="انتخاب کالکشن"
                :disabled="locked"
                :error="!!fieldErrors.collectionId"
                :error-message="fieldErrors.collectionId"
              />

              <BaseInput
                v-model="discountPercent"
                dense
                type="number"
                label="درصد تخفیف"
                min="0"
                max="100"
                step="0.01"
                :disabled="locked"
                :error="!!fieldErrors.discountPercent"
                :error-message="fieldErrors.discountPercent"
              />

              <div class="flex flex-wrap items-center gap-6 md:pt-2">
                <label class="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    v-model="isFeatured"
                    type="checkbox"
                    class="h-4 w-4 rounded"
                    :disabled="locked"
                  />
                  <span>محصول ویژه</span>
                </label>

                <label class="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    v-model="isActive"
                    type="checkbox"
                    class="h-4 w-4 rounded"
                    :disabled="locked"
                  />
                  <span>فعال</span>
                </label>
              </div>

              <BaseInput
                v-model="description"
                class="md:col-span-2"
                dense
                type="textarea"
                label="توضیحات (اختیاری)"
                :rows="4"
                maxlength="5000"
                counter
                :disabled="locked"
                :error="!!fieldErrors.description"
                :error-message="fieldErrors.description"
              />
            </section>

            <!-- وزن‌ها و موجودی -->
            <section v-show="activeTab === 'variants'" class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs text-gray-500">
                  هر ردیف یک وزن مشخص با تعداد موجودی همان وزن است. مجموع موجودی:
                  {{ toFaNumber(totalStock) }}
                </p>

                <BaseBtn
                  outline
                  color="gray"
                  text-color="black"
                  class="!bg-white"
                  size="sm"
                  :disable="locked || variants.length >= MAX_VARIANTS"
                  @click="addVariant"
                >
                  + افزودن وزن
                </BaseBtn>
              </div>

              <p
                v-if="!hasActiveVariant"
                class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"
              >
                هیچ وزن فعالی وجود ندارد؛ محصول در سایت نمایش داده نمی‌شود.
              </p>

              <div
                v-for="(variant, index) in variants"
                :key="variant.key"
                class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">
                    وزن شماره {{ toFaNumber(index + 1) }}
                  </span>

                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        v-model="variant.isActive"
                        type="checkbox"
                        class="h-4 w-4 rounded"
                        :disabled="locked"
                      />
                      <span>فعال</span>
                    </label>

                    <BaseBtn
                      flat
                      size="sm"
                      color="gray"
                      class="!text-red-600"
                      :disable="locked || variants.length === 1"
                      @click="removeVariant(index)"
                    >
                      حذف
                    </BaseBtn>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <BaseInput
                    v-model="variant.weight"
                    dense
                    type="number"
                    label="وزن (گرم)"
                    min="0"
                    step="0.001"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.weight"
                    :error-message="variantErrors[index]?.weight"
                  />

                  <BaseInput
                    v-model="variant.fee"
                    dense
                    type="number"
                    label="درصد اجرت"
                    min="0"
                    max="100"
                    step="0.001"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.fee"
                    :error-message="variantErrors[index]?.fee"
                  />

                  <BaseInput
                    v-model="variant.feeAmount"
                    dense
                    financial
                    label="اجرت ریالی"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.feeAmount"
                    :error-message="variantErrors[index]?.feeAmount"
                  />

                  <BaseInput
                    v-model="variant.stock"
                    dense
                    type="number"
                    label="موجودی"
                    min="0"
                    step="1"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.stock"
                    :error-message="variantErrors[index]?.stock"
                  />

                  <BaseInput
                    v-model="variant.label"
                    dense
                    label="عنوان (اختیاری، مثلاً سایز ۱۲)"
                    maxlength="50"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.label"
                    :error-message="variantErrors[index]?.label"
                  />

                  <BaseInput
                    v-model="variant.sku"
                    dense
                    dir="ltr"
                    label="کد کالا (SKU، اختیاری)"
                    maxlength="50"
                    :disabled="locked"
                    :error="!!variantErrors[index]?.sku"
                    :error-message="variantErrors[index]?.sku"
                  />
                </div>
              </div>
            </section>

            <!-- تصاویر -->
            <section v-show="activeTab === 'images'" class="flex flex-col gap-4">
              <p class="text-xs text-gray-500">
                اولین تصویر، تصویر اصلی محصول است. حداکثر
                {{ toFaNumber(MAX_IMAGES) }} تصویر (هر کدام تا ۵ مگابایت).
              </p>

              <!-- تصاویر فعلی (فقط ویرایش) -->
              <div v-if="keptImages.length > 0" class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-700">تصاویر فعلی</span>

                <ul class="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4 md:grid-cols-5">
                  <li
                    v-for="image in keptImages"
                    :key="image.id"
                    class="relative"
                  >
                    <BaseImg
                      :src="assetUrl(image.url)"
                      :alt="image.alt ?? name"
                      ratio="1"
                      fit="cover"
                      no-spinner
                      class="w-full rounded-lg border border-gray-200 bg-gray-100"
                    />

                    <button
                      type="button"
                      class="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-base leading-none text-white hover:bg-black disabled:opacity-50"
                      aria-label="حذف تصویر"
                      :disabled="locked"
                      @click="removeExistingImage(image.id)"
                    >
                      ×
                    </button>
                  </li>
                </ul>
              </div>

              <p
                v-if="removedImageIds.length > 0"
                class="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"
              >
                <span>
                  {{ toFaNumber(removedImageIds.length) }} تصویر با ذخیره حذف می‌شود.
                </span>
                <button
                  type="button"
                  class="underline disabled:opacity-50"
                  :disabled="locked"
                  @click="restoreRemovedImages"
                >
                  بازگردانی
                </button>
              </p>

              <BaseImageUploader
                v-model="imageFiles"
                multiple
                :title="isEdit ? 'افزودن تصاویر جدید' : 'گالری تصاویر (اختیاری)'"
                accept="image/jpeg,image/png,image/webp"
                @error="toast.error($event)"
              />
            </section>

            <!-- برای ارسال فرم با Enter -->
            <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
          </BaseForm>
        </BaseTabs>
      </div>

      <!-- Footer -->
      <div class="mx-auto flex w-full justify-start gap-2 border-t border-gray-200 px-5 py-3">
        <BaseBtn
          color="black"
          :loading="isSaving"
          :disable="isLoading"
          @click="submit"
        >
          {{ saveLabel }}
        </BaseBtn>
        <BaseBtn
          color="gray"
          outline
          text-color="black"
          :disable="isSaving"
          @click="cancel"
        >
          {{ detailsSaved ? 'بستن' : 'انصراف' }}
        </BaseBtn>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import BaseTabs from '@/components/base/tabs/BaseTabs.vue' // مسیر واقعی BaseTabs خودت
import { toFaNumber } from '@/utils/formatNumber.ts'

const { isMobile } = useMobile()
const toast = useFormToast()
const { request } = useApiRequest()
const config = useRuntimeConfig()

const MAX_IMAGES = 10
const MAX_VARIANTS = 50

// ───── تایپ‌ها ─────
type ProductFieldKey =
  | 'name'
  | 'slug'
  | 'description'
  | 'categoryId'
  | 'collectionId'
  | 'discountPercent'

const PRODUCT_FIELD_KEYS: readonly string[] = [
  'name',
  'slug',
  'description',
  'categoryId',
  'collectionId',
  'discountPercent',
]

type VariantField = 'label' | 'sku' | 'weight' | 'fee' | 'feeAmount' | 'stock'

// BaseInput از نوع number مقدار را به‌صورت رشته برمی‌گرداند
type VariantForm = {
  key: number
  id?: string // فقط وزن‌هایی که از قبل در بکند هستند
  label: string
  sku: string
  weight: string | number
  fee: string | number
  feeAmount: string | number
  stock: string | number
  isActive: boolean
}

type VariantErrors = Record<number, Partial<Record<VariantField, string>>>

type CategoryNode = {
  id: string
  name: string
  isActive: boolean
  children: { id: string; name: string; isActive: boolean }[]
}

type CollectionRow = { id: string; name: string; isActive: boolean }

type ExistingImage = { id: string; alt: string | null; url: string }

type ProductDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  collectionId: string | null
  discountPercent: number
  isFeatured: boolean
  isActive: boolean
  category: { id: string; name: string }
  collection: { id: string; name: string } | null
  variants: {
    id: string
    label: string | null
    sku: string | null
    weight: number
    fee: number
    feeAmount: number
    stock: number
    isActive: boolean
  }[]
  images: ExistingImage[]
}

type ApiErrorData = {
  message?: string
  errors?: { field: string; message: string }[]
}

type TabId = 'info' | 'variants' | 'images'

const TAB_LABELS: Record<TabId, string> = {
  info: 'اطلاعات اصلی',
  variants: 'وزن‌ها و موجودی',
  images: 'تصاویر',
}

// ───── ورودی و خروجی ─────
const props = defineProps<{
  // خالی یعنی حالت ساخت، پر یعنی ویرایش همان محصول
  productId?: string | null
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: [payload: { mode: 'create' | 'edit'; warning?: string }]
}>()

const isEdit = computed(() => !!props.productId)

// ───── گزینه‌های دسته‌بندی و کالکشن ─────
const categoryNodes = ref<CategoryNode[]>([])
const collectionRows = ref<CollectionRow[]>([])
// دسته و کالکشن فعلی محصول (ممکن است غیرفعال شده باشند)
const currentCategory = ref<{ id: string; name: string } | null>(null)
const currentCollection = ref<{ id: string; name: string } | null>(null)

// بکند فقط دسته‌ی فعال را برای محصول قبول می‌کند
const categoryOptions = computed(() => {
  const options = categoryNodes.value
    .filter(root => root.isActive)
    .flatMap(root => [
      { value: root.id, label: root.name },
      ...root.children
        .filter(child => child.isActive)
        .map(child => ({
          value: child.id,
          label: `${root.name} › ${child.name}`,
        })),
    ])

  const current = currentCategory.value

  if (current && !options.some(option => option.value === current.id)) {
    options.push({ value: current.id, label: `${current.name} (غیرفعال)` })
  }

  return options
})

const collectionOptions = computed(() => {
  const options = collectionRows.value
    .filter(collection => collection.isActive)
    .map(collection => ({ value: collection.id, label: collection.name }))

  const current = currentCollection.value

  if (current && !options.some(option => option.value === current.id)) {
    options.push({ value: current.id, label: `${current.name} (غیرفعال)` })
  }

  return options
})

// ───── وضعیت فرم ─────
const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const description = ref('')
const categoryId = ref<string | null>(null)
const collectionId = ref<string | null>(null)
const discountPercent = ref<string | number>(0)
const isFeatured = ref(false)
const isActive = ref(true)

let variantKey = 0

const createEmptyVariant = (): VariantForm => ({
  key: ++variantKey,
  label: '',
  sku: '',
  weight: '',
  fee: '0',
  feeAmount: '0',
  stock: '1',
  isActive: true,
})

const variants = ref<VariantForm[]>([createEmptyVariant()])
const variantErrors = ref<VariantErrors>({})
const fieldErrors = reactive<Partial<Record<ProductFieldKey, string>>>({})

// تصاویر
const existingImages = ref<ExistingImage[]>([])
const removedImageIds = ref<string[]>([])
const imageFiles = ref<(File | string)[]>([])
// کارهای تصویری که در تلاش‌های قبلی انجام شده و تکرار نمی‌شوند
const uploadedImages = new Set<File>()
const deletedImageIds = new Set<string>()

const keptImages = computed(() =>
  existingImages.value.filter(image => !removedImageIds.value.includes(image.id)),
)

const allowedNewImages = computed(() =>
  Math.max(0, MAX_IMAGES - keptImages.value.length),
)

const activeTab = ref<TabId>('info')

// وضعیت بارگذاری و ذخیره
const isLoading = ref(true)
let loadToken = 0

// بعد از ذخیره‌ی موفق اطلاعات، فقط مرحله‌ی عکس قابل تکرار است
const detailsSaved = ref(false)
const savedId = ref<string | null>(null)
const isSaving = ref(false)

const locked = computed(() => detailsSaved.value || isSaving.value)

const saveLabel = computed(() => {
  if (isSaving.value) return 'در حال ذخیره...'
  if (detailsSaved.value) return 'تلاش دوباره برای ثبت تصاویر'

  return isEdit.value ? 'ذخیره تغییرات' : 'ذخیره'
})

const totalStock = computed(() =>
  variants.value.reduce((sum, variant) => {
    const stock = Number(variant.stock)

    return sum + (Number.isFinite(stock) ? stock : 0)
  }, 0),
)

const hasActiveVariant = computed(() =>
  variants.value.some(variant => variant.isActive),
)

const slugChanged = ref(false)

// با تایپ دستی اسلاگ، ساخت خودکار از روی نام متوقف می‌شود
const slugModel = computed({
  get: () => slug.value,
  set: (value) => {
    slug.value = String(value ?? '')
    slugTouched.value = true
  },
})

const tabs = computed(() => [
  { id: 'info', label: TAB_LABELS.info },
  { id: 'variants', label: TAB_LABELS.variants, badge: variants.value.length },
  {
    id: 'images',
    label: TAB_LABELS.images,
    badge: keptImages.value.length + imageFiles.value.length || undefined,
  },
])

// ───── ابزارها ─────
// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string) => `${config.public.apiBaseUrl}${path}`

// حروف فارسی و انگلیسی، عدد و خط تیره (مطابق قانون اسلاگ در بکند)
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_\u200C]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const hasMaxDecimals = (value: number, decimals: number) => {
  const factor = 10 ** decimals

  return Math.abs(value * factor - Math.round(value * factor)) < 1e-6
}

const isFilled = (value: string | number) => String(value).trim() !== ''

const getErrorMessage = (error: unknown) => {
  const data = (error as { data?: ApiErrorData } | null)?.data

  if (!data?.message) return 'خطایی رخ داد؛ دوباره تلاش کنید'

  const details = data.errors?.map(item => item.message).join('، ')

  return details ? `${data.message}: ${details}` : data.message
}

const getStatus = (error: unknown) => {
  const value = error as { statusCode?: number; status?: number } | null

  return value?.statusCode ?? value?.status
}

// ───── واکنش به تغییر فیلدها ─────
watch(name, (value) => {
  fieldErrors.name = undefined

  if (!slugTouched.value) slug.value = slugify(value)
})

watch(slug, (value) => {
  fieldErrors.slug = undefined

  // فقط در ویرایش: آیا اسلاگ نسبت به مقدار ذخیره‌شده عوض شده است
  slugChanged.value = isEdit.value && value.trim() !== originalSlug
})

watch(categoryId, () => {
  fieldErrors.categoryId = undefined
})

// با ویرایش وزن‌ها، خطاهای قبلی پاک می‌شوند
watch(variants, () => {
  variantErrors.value = {}
}, { deep: true })

// بیشتر از حد مجاز عکس انتخاب شده باشد
watch(imageFiles, (files) => {
  if (files.length <= allowedNewImages.value) return

  imageFiles.value = files.slice(0, allowedNewImages.value)
  toast.error(`حداکثر ${toFaNumber(MAX_IMAGES)} تصویر برای هر محصول مجاز است`)
})

// ───── وزن‌ها ─────
const addVariant = () => {
  if (variants.value.length >= MAX_VARIANTS) return

  variants.value.push(createEmptyVariant())
}

const removeVariant = (index: number) => {
  if (variants.value.length === 1) return

  variants.value.splice(index, 1)
}

// ───── تصاویر فعلی ─────
const removeExistingImage = (id: string) => {
  if (!removedImageIds.value.includes(id)) removedImageIds.value.push(id)
}

const restoreRemovedImages = () => {
  const total
    = keptImages.value.length
    + removedImageIds.value.length
    + imageFiles.value.length

  if (total > MAX_IMAGES) {
    toast.error(
      `با بازگردانی، تعداد تصاویر از ${toFaNumber(MAX_IMAGES)} بیشتر می‌شود؛ ابتدا چند تصویر جدید را حذف کنید`,
    )
    return
  }

  removedImageIds.value = []
}

// ───── اعتبارسنجی سمت فرم (مطابق قوانین بکند) ─────
const clearErrors = () => {
  for (const key of PRODUCT_FIELD_KEYS) {
    fieldErrors[key as ProductFieldKey] = undefined
  }

  variantErrors.value = {}
}

const validate = () => {
  let valid = true

  if (name.value.trim().length < 2) {
    fieldErrors.name = 'نام محصول باید حداقل ۲ کاراکتر باشد'
    valid = false
  }

  if (slug.value.trim().length < 2) {
    fieldErrors.slug = 'اسلاگ باید حداقل ۲ کاراکتر باشد'
    valid = false
  }

  if (!categoryId.value) {
    fieldErrors.categoryId = 'دسته‌بندی را انتخاب کنید'
    valid = false
  }

  const discount = Number(discountPercent.value)

  if (
    !isFilled(discountPercent.value)
    || !Number.isFinite(discount)
    || discount < 0
    || discount > 100
    || !hasMaxDecimals(discount, 2)
  ) {
    fieldErrors.discountPercent
      = 'تخفیف باید عددی بین ۰ تا ۱۰۰ (حداکثر ۲ رقم اعشار) باشد'
    valid = false
  }

  const errors: VariantErrors = {}
  const seenWeights = new Set<string>()
  const seenSkus = new Set<string>()

  variants.value.forEach((variant, index) => {
    const rowErrors: Partial<Record<VariantField, string>> = {}

    const weight = Number(variant.weight)

    if (!isFilled(variant.weight) || !Number.isFinite(weight) || weight <= 0) {
      rowErrors.weight = 'وزن باید بیشتر از صفر باشد'
    }
    else if (!hasMaxDecimals(weight, 3)) {
      rowErrors.weight = 'وزن حداکثر ۳ رقم اعشار دارد'
    }
    else {
      const weightKey = weight.toFixed(3)

      if (seenWeights.has(weightKey)) {
        rowErrors.weight = 'وزن تکراری است؛ موجودی همان وزن را زیاد کنید'
      }

      seenWeights.add(weightKey)
    }

    const fee = Number(variant.fee)

    if (
      !isFilled(variant.fee)
      || !Number.isFinite(fee)
      || fee < 0
      || fee > 100
      || !hasMaxDecimals(fee, 3)
    ) {
      rowErrors.fee = 'درصد اجرت باید بین ۰ تا ۱۰۰ باشد'
    }

    const feeAmount = Number(variant.feeAmount)

    if (
      !isFilled(variant.feeAmount)
      || !Number.isInteger(feeAmount)
      || feeAmount < 0
    ) {
      rowErrors.feeAmount = 'اجرت ریالی باید عدد صحیح و نامنفی باشد'
    }

    const stock = Number(variant.stock)

    if (
      !isFilled(variant.stock)
      || !Number.isInteger(stock)
      || stock < 0
      || stock > 100000
    ) {
      rowErrors.stock = 'موجودی باید عدد صحیح و نامنفی باشد'
    }

    const sku = variant.sku.trim()

    if (sku) {
      if (seenSkus.has(sku)) rowErrors.sku = 'کد کالا تکراری است'

      seenSkus.add(sku)
    }

    if (Object.keys(rowErrors).length > 0) errors[index] = rowErrors
  })

  variantErrors.value = errors

  return valid && Object.keys(errors).length === 0
}

// اولین تبی که خطا دارد
const firstErrorTab = (): TabId | null => {
  if (PRODUCT_FIELD_KEYS.some(key => fieldErrors[key as ProductFieldKey])) {
    return 'info'
  }

  if (Object.keys(variantErrors.value).length > 0) return 'variants'

  return null
}

// به تب دارای خطا می‌رود و آن را برمی‌گرداند
const goToErrorTab = () => {
  const tab = firstErrorTab()

  if (tab) activeTab.value = tab

  return tab
}

// ───── خطاهای بکند ─────
// خطای هر فیلد را زیر خودش و پیام کلی را به‌صورت toast نشان می‌دهد
const applyApiError = (error: unknown) => {
  const data = (error as { data?: ApiErrorData } | null)?.data
  let mapped = false

  for (const item of data?.errors ?? []) {
    const variantMatch = /^variants\.(\d+)\.(\w+)$/.exec(item.field)

    if (variantMatch) {
      const index = Number(variantMatch[1])
      const field = variantMatch[2] as VariantField

      variantErrors.value[index] = {
        ...variantErrors.value[index],
        [field]: item.message,
      }
      mapped = true
    }
    else if (PRODUCT_FIELD_KEYS.includes(item.field)) {
      fieldErrors[item.field as ProductFieldKey] = item.message
      mapped = true
    }
  }

  // خطای ۴۰۹ اسلاگ تکراری فیلد مشخص ندارد
  if (!mapped && data?.message?.includes('اسلاگ')) {
    fieldErrors.slug = data.message
  }

  const tab = goToErrorTab()

  // خطای SKU یا وزن بدون فیلد مشخص
  if (!tab && /SKU|وزن/.test(data?.message ?? '')) {
    activeTab.value = 'variants'
  }

  toast.error(mapped && data?.message ? data.message : getErrorMessage(error))
}

// ───── باز و بسته شدن فرم ─────
let originalSlug = ''

const resetForm = () => {
  name.value = ''
  slug.value = ''
  slugTouched.value = false
  slugChanged.value = false
  originalSlug = ''
  description.value = ''
  categoryId.value = null
  collectionId.value = null
  discountPercent.value = 0
  isFeatured.value = false
  isActive.value = true

  variants.value = [createEmptyVariant()]
  existingImages.value = []
  removedImageIds.value = []
  imageFiles.value = []
  uploadedImages.clear()
  deletedImageIds.clear()

  currentCategory.value = null
  currentCollection.value = null

  activeTab.value = 'info'
  detailsSaved.value = false
  savedId.value = null
  clearErrors()
}

// پر کردن فرم با اطلاعات محصول موجود (ویرایش)
const fillForm = (product: ProductDetail) => {
  name.value = product.name
  slug.value = product.slug
  originalSlug = product.slug
  // در ویرایش، اسلاگ با تغییر نام عوض نمی‌شود
  slugTouched.value = true
  description.value = product.description ?? ''
  categoryId.value = product.categoryId
  collectionId.value = product.collectionId
  discountPercent.value = product.discountPercent
  isFeatured.value = product.isFeatured
  isActive.value = product.isActive

  currentCategory.value = product.category
  currentCollection.value = product.collection

  variants.value = product.variants.map(variant => ({
    key: ++variantKey,
    id: variant.id,
    label: variant.label ?? '',
    sku: variant.sku ?? '',
    weight: variant.weight,
    fee: variant.fee,
    feeAmount: variant.feeAmount,
    stock: variant.stock,
    isActive: variant.isActive,
  }))

  existingImages.value = product.images
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    // دفعه‌ی بعد دوباره با حالت «در حال دریافت» شروع می‌شود
    isLoading.value = true
    return
  }

  const token = ++loadToken

  resetForm()
  isLoading.value = true

  try {
    const [categories, collections, product] = await Promise.all([
      request<{ data: CategoryNode[] }>('/admin/categories'),
      request<{ data: CollectionRow[] }>('/admin/collections'),
      props.productId
        ? request<{ data: ProductDetail }>(`/admin/products/${props.productId}`)
        : Promise.resolve(null),
    ])

    // اگر در این فاصله فرم بسته یا دوباره باز شده، نتیجه‌ی قدیمی نادیده گرفته می‌شود
    if (token !== loadToken) return

    categoryNodes.value = categories.data
    collectionRows.value = collections.data

    if (product) fillForm(product.data)

    isLoading.value = false
  }
  catch (error) {
    if (token !== loadToken) return

    toast.error(getErrorMessage(error))
    open.value = false
  }
})

// ───── ذخیره ─────
const saveDetails = async () => {
  const body = {
    name: name.value.trim(),
    slug: slug.value.trim(),
    description: description.value.trim() || null,
    categoryId: categoryId.value,
    collectionId: collectionId.value ?? null,
    discountPercent: Number(discountPercent.value) || 0,
    isFeatured: isFeatured.value,
    isActive: isActive.value,
    variants: variants.value.map(variant => ({
      // وزن دارای id ویرایش می‌شود و وزن بدون id ساخته می‌شود
      ...(variant.id ? { id: variant.id } : {}),
      label: variant.label.trim() || null,
      sku: variant.sku.trim() || null,
      weight: Number(variant.weight),
      fee: Number(variant.fee),
      feeAmount: Number(variant.feeAmount),
      stock: Number(variant.stock),
      isActive: variant.isActive,
    })),
  }

  if (props.productId) {
    await request(`/admin/products/${props.productId}`, {
      method: 'PUT',
      body,
    })

    return props.productId
  }

  const created = await request<{ data: { id: string } }>('/admin/products', {
    method: 'POST',
    body,
  })

  return created.data.id
}

// حذف تصاویر علامت‌خورده و آپلود تصاویر جدید؛ با اولین شکست متوقف می‌شود
const syncImages = async (productId: string) => {
  for (const imageId of removedImageIds.value) {
    if (deletedImageIds.has(imageId)) continue

    try {
      await request(`/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      // تصویری که قبلاً حذف شده، کار تمام‌شده حساب می‌شود
      if (getStatus(error) !== 404) return { message: getErrorMessage(error) }
    }

    deletedImageIds.add(imageId)
  }

  const pending = imageFiles.value.filter(
    (item): item is File => item instanceof File && !uploadedImages.has(item),
  )

  for (const file of pending) {
    const form = new FormData()
    form.append('image', file)
    form.append('alt', name.value.trim())

    try {
      await request(`/admin/products/${productId}/images`, {
        method: 'POST',
        body: form,
      })

      uploadedImages.add(file)
    }
    catch (error) {
      return { message: getErrorMessage(error) }
    }
  }

  return null
}

const submit = async () => {
  if (isSaving.value || isLoading.value) return

  if (!detailsSaved.value) {
    clearErrors()

    if (!validate()) {
      const tab = goToErrorTab()

      toast.error(
        tab
          ? `لطفاً خطاهای بخش «${TAB_LABELS[tab]}» را برطرف کنید`
          : 'لطفاً خطاهای فرم را برطرف کنید',
      )
      return
    }
  }

  isSaving.value = true

  try {
    // مرحله‌ی ۱: ساخت یا ویرایش محصول و وزن‌ها (فقط یک بار)
    if (!detailsSaved.value) {
      savedId.value = await saveDetails()
      detailsSaved.value = true
    }

    // مرحله‌ی ۲: تصاویر (در صورت شکست، دیالوگ باز می‌ماند)
    if (savedId.value) {
      const failure = await syncImages(savedId.value)

      if (failure) {
        activeTab.value = 'images'
        toast.error(
          `${isEdit.value ? 'تغییرات ذخیره شد' : 'محصول ساخته شد'} ولی ثبت تصاویر کامل نشد: ${failure.message}`,
        )
        return
      }
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

// اگر اطلاعات ذخیره شده ولی تصاویر کامل ثبت نشده‌اند، بستن هم لیست را به‌روز می‌کند
const cancel = () => {
  if (detailsSaved.value) {
    emit('saved', {
      mode: isEdit.value ? 'edit' : 'create',
      warning: 'اطلاعات محصول ذخیره شد ولی ثبت بعضی تصاویر کامل نشد',
    })
    return
  }

  open.value = false
}
</script>