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

          <span class="text-xl font-semibold">{{ dialogTitle }}</span>
        </div>

        <div class="flex items-center gap-2">
          <BaseBtn
            outline
            color="gray"
            class="!bg-white"
            text-color="black"
            :disable="isSaving"
            @click="open = false"
          >
            بازگشت
          </BaseBtn>

          <BaseBtn color="black" :loading="isSaving" @click="submit">
            {{ isEdit ? 'ذخیره تغییرات' : 'افزودن' }}
          </BaseBtn>
        </div>
      </div>

      <!-- Form -->
      <BaseForm
        class="mx-auto flex w-full max-w-3xl flex-col gap-8 p-5"
        @submit.prevent="submit"
      >
        <!-- تصاویر -->
        <section class="flex flex-col gap-4">
          <h2 class="text-base font-semibold text-gray-800">تصاویر</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-1">
              <BaseImageUploader
                v-model="desktopFile"
                v-model:access-url="existingDesktopUrl"
                title="تصویر اصلی (دسکتاپ) *"
                accept="image/jpeg,image/png,image/webp"
                crop
                :crop-aspect-ratio="desktopRatio"
                :crop-width="desktopWidth"
                @error="toast.error($event)"
              />
              <p v-if="errors.image" class="text-xs text-red-600">
                {{ errors.image }}
              </p>
            </div>

            <BaseImageUploader
              v-model="mobileFile"
              v-model:access-url="existingMobileUrl"
              title="تصویر موبایل (اختیاری)"
              accept="image/jpeg,image/png,image/webp"
              crop
              :crop-aspect-ratio="mobileRatio"
              :crop-width="mobileWidth"
              @error="toast.error($event)"
            />
          </div>

          <p class="text-xs text-gray-500">
            اگر عکس موبایل نگذارید، در موبایل همان عکس دسکتاپ نمایش داده می‌شود.
          </p>
        </section>

        <!-- متن‌ها -->
        <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseInput
            v-model="title"
            dense
            label="عنوان (اختیاری)"
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

          <BaseInput
            v-model="buttonText"
            dense
            label="متن دکمه (اختیاری)"
            maxlength="40"
            :disabled="isSaving"
            :error="!!errors.buttonText"
            :error-message="errors.buttonText"
          />

          <BaseInput
            v-model="alt"
            dense
            label="متن جایگزین تصویر (برای سئو و دسترس‌پذیری)"
            maxlength="200"
            :disabled="isSaving"
            :error="!!errors.alt"
            :error-message="errors.alt"
          />
        </section>

        <!-- لینک -->
        <section class="flex flex-col gap-4">
          <h2 class="text-base font-semibold text-gray-800">لینک</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BaseInput
              v-model="linkUrl"
              dense
              dir="ltr"
              label="آدرس لینک (اختیاری)"
              maxlength="500"
              placeholder="/products?collection=spring"
              :disabled="isSaving"
              :error="!!errors.linkUrl"
              :error-message="errors.linkUrl"
            />

            <BaseSelect
              v-model="quickLink"
              label="لینک سریع"
              placeholder="انتخاب از لیست"
              :options="quickLinkOptions"
              emit-value
              clearable
              searchable
              dense
              :dialog="isMobile"
              dialog-title="لینک سریع"
              :loading="isLoadingOptions"
              :disabled="isSaving"
            />
          </div>

          <p class="text-xs text-gray-500">
            مسیر داخلی سایت (مثل <span dir="ltr">/products</span>) یا آدرس کامل با
            <span dir="ltr">https://</span> وارد کنید.
          </p>
        </section>

        <!-- زمان‌بندی و وضعیت -->
        <section class="flex flex-col gap-4">
          <h2 class="text-base font-semibold text-gray-800">زمان‌بندی و وضعیت</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-1">
              <BaseDatePicker
                v-model="startsAt"
                label="شروع نمایش (اختیاری)"
                placeholder="انتخاب تاریخ"
                calendar-type="jalali"
                emit-iso-string
                open-in-dialog
              />
              <button
                v-if="startsAt"
                type="button"
                class="self-start text-xs text-red-600 underline disabled:opacity-50"
                :disabled="isSaving"
                @click="startsAt = null"
              >
                پاک کردن تاریخ
              </button>
              <p v-if="errors.startsAt" class="text-xs text-red-600">
                {{ errors.startsAt }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <BaseDatePicker
                v-model="endsAt"
                label="پایان نمایش (اختیاری)"
                placeholder="انتخاب تاریخ"
                calendar-type="jalali"
                emit-iso-string
                open-in-dialog
              />
              <button
                v-if="endsAt"
                type="button"
                class="self-start text-xs text-red-600 underline disabled:opacity-50"
                :disabled="isSaving"
                @click="endsAt = null"
              >
                پاک کردن تاریخ
              </button>
              <p v-if="errors.endsAt" class="text-xs text-red-600">
                {{ errors.endsAt }}
              </p>
            </div>
          </div>

          <p class="text-xs text-gray-500">
            نمایش از ابتدای روز شروع تا پایان روز پایان ادامه دارد. اگر تاریخی نگذارید،
            بدون محدودیت زمانی نمایش داده می‌شود.
          </p>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input
              v-model="isActive"
              type="checkbox"
              class="h-4 w-4 rounded"
              :disabled="isSaving"
            />
            <span>فعال (نمایش در سایت)</span>
          </label>
        </section>

        <!-- برای ارسال فرم با Enter -->
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </BaseForm>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import type { HomeItem } from '~/types/home'

const { isMobile } = useMobile()
const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage, getFieldErrors } = useApiError()
const config = useRuntimeConfig()

type Option = { value: string; label: string }
type FieldKey =
  | 'image'
  | 'title'
  | 'subtitle'
  | 'buttonText'
  | 'alt'
  | 'linkUrl'
  | 'startsAt'
  | 'endsAt'

type CategoryNode = {
  slug: string
  name: string
  children: { slug: string; name: string }[]
}

type CollectionRow = { slug: string; name: string }

const props = defineProps<{
  sectionId: string
  sectionType: 'SLIDER' | 'BANNERS'
  // تعداد ستون بخش بنر (برای نسبت و اندازه‌ی برش)
  columns: number
  // خالی یعنی ساخت، پر یعنی ویرایش همان آیتم
  item?: HomeItem | null
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: [payload: { mode: 'create' | 'edit' }]
}>()

const isEdit = computed(() => !!props.item)

const dialogTitle = computed(() => {
  const noun = props.sectionType === 'SLIDER' ? 'اسلاید' : 'بنر'

  return isEdit.value ? `ویرایش ${noun}` : `افزودن ${noun}`
})

// ───── نسبت و اندازه‌ی برش عکس (مطابق طرح سایت تنظیم کن) ─────
const BANNER_RATIOS: Record<number, number> = { 1: 4, 2: 2, 3: 1.5, 4: 1 }
const BANNER_WIDTHS: Record<number, number> = { 1: 1920, 2: 1000, 3: 700, 4: 500 }

const desktopRatio = computed(() =>
  props.sectionType === 'SLIDER' ? 16 / 7 : (BANNER_RATIOS[props.columns] ?? 2),
)

const desktopWidth = computed(() =>
  props.sectionType === 'SLIDER' ? 1920 : (BANNER_WIDTHS[props.columns] ?? 1000),
)

const mobileRatio = computed(() =>
  props.sectionType === 'SLIDER' ? 4 / 5 : desktopRatio.value,
)

const mobileWidth = computed(() =>
  props.sectionType === 'SLIDER' ? 1000 : Math.min(desktopWidth.value, 1000),
)

// ───── وضعیت فرم ─────
const title = ref('')
const subtitle = ref('')
const buttonText = ref('')
const alt = ref('')
const linkUrl = ref('')
const isActive = ref(true)
// مقدار datetime-local به‌صورت YYYY-MM-DDTHH:mm و به وقت محلی مرورگر
const startsAt = ref<string | null>(null)
const endsAt = ref<string | null>(null)

const desktopFile = ref<File | null>(null)
const mobileFile = ref<File | null>(null)
const existingDesktopUrl = ref('')
const existingMobileUrl = ref('')
const hadMobile = ref(false)

const errors = reactive<Partial<Record<FieldKey, string>>>({})
const isSaving = ref(false)

// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string | null) =>
  path ? `${config.public.apiBaseUrl}${path}` : ''

// عکس موبایل قبلی حذف شده و عکس جدیدی هم جایش انتخاب نشده
const mobileRemoved = computed(
  () => hadMobile.value && !existingMobileUrl.value && !mobileFile.value,
)

// ───── لینک سریع ─────
const categories = ref<CategoryNode[]>([])
const collections = ref<CollectionRow[]>([])
const isLoadingOptions = ref(false)
const quickLink = ref<string | null>(null)

const quickLinkOptions = computed<Option[]>(() => [
  { value: '/products', label: 'همه‌ی محصولات' },
  { value: '/products?hasDiscount=true', label: 'محصولات تخفیف‌دار' },
  ...categories.value.flatMap(root => [
    {
      value: `/products?category=${encodeURIComponent(root.slug)}`,
      label: `دسته: ${root.name}`,
    },
    ...root.children.map(child => ({
      value: `/products?category=${encodeURIComponent(child.slug)}`,
      label: `دسته: ${root.name} › ${child.name}`,
    })),
  ]),
  ...collections.value.map(collection => ({
    value: `/products?collection=${encodeURIComponent(collection.slug)}`,
    label: `کالکشن: ${collection.name}`,
  })),
])

watch(quickLink, (value) => {
  if (!value) return

  linkUrl.value = value
  errors.linkUrl = undefined
  quickLink.value = null
})

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
  catch {
    // لینک سریع اختیاری است؛ ادمین می‌تواند آدرس را دستی بنویسد
  }
  finally {
    isLoadingOptions.value = false
  }
}

// ───── تاریخ ─────
const pad = (value: number) => String(value).padStart(2, '0')

const toLocalInput = (iso: string | null) => {
  if (!iso) return ''

  const date = new Date(iso)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toIso = (local: string) =>
  local ? new Date(local).toISOString() : ''

// ───── باز شدن فرم ─────
const clearErrors = () => {
  errors.image = undefined
  errors.title = undefined
  errors.subtitle = undefined
  errors.buttonText = undefined
  errors.alt = undefined
  errors.linkUrl = undefined
  errors.startsAt = undefined
  errors.endsAt = undefined
}

watch(open, (isOpen) => {
  if (!isOpen) return

  const item = props.item

  title.value = item?.title ?? ''
  subtitle.value = item?.subtitle ?? ''
  buttonText.value = item?.buttonText ?? ''
  alt.value = item?.alt ?? ''
  linkUrl.value = item?.linkUrl ?? ''
  isActive.value = item?.isActive ?? true
  startsAt.value = toLocalInput(item?.startsAt ?? null)
  endsAt.value = toLocalInput(item?.endsAt ?? null)

  desktopFile.value = null
  mobileFile.value = null
  existingDesktopUrl.value = assetUrl(item?.imageUrl ?? null)
  existingMobileUrl.value = assetUrl(item?.mobileImageUrl ?? null)
  hadMobile.value = !!item?.mobileImageUrl

  quickLink.value = null
  clearErrors()

  void loadOptions()
})

// ───── اعتبارسنجی (مطابق قوانین بکند) ─────
const isValidLink = (value: string) =>
  value === '' || /^\/(?!\/)\S*$/.test(value) || /^https?:\/\/\S+$/i.test(value)

const validate = () => {
  clearErrors()

  if (!desktopFile.value && !existingDesktopUrl.value) {
    errors.image = 'تصویر اصلی الزامی است'
  }

  if (title.value.trim().length > 120) {
    errors.title = 'عنوان نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد'
  }

  if (subtitle.value.trim().length > 200) {
    errors.subtitle = 'زیرعنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'
  }

  if (buttonText.value.trim().length > 40) {
    errors.buttonText = 'متن دکمه نمی‌تواند بیشتر از ۴۰ کاراکتر باشد'
  }

  if (!isValidLink(linkUrl.value.trim())) {
    errors.linkUrl = 'لینک باید مسیر داخلی (مثل /products) یا آدرس کامل با http باشد'
  }

  if (startsAt.value && endsAt.value && new Date(endsAt.value) <= new Date(startsAt.value)) {
    errors.endsAt = 'پایان نمایش باید بعد از شروع باشد'
  }

  return !Object.values(errors).some(Boolean)
}

const applyApiError = (error: unknown) => {
  let mapped = false

  for (const item of getFieldErrors(error)) {
    if (item.field in errors || item.field === 'image') {
      errors[item.field as FieldKey] = item.message
      mapped = true
    }
  }

  toast.error(mapped ? 'لطفاً خطاهای فرم را برطرف کنید' : getMessage(error))
}

// ───── ذخیره ─────
const buildForm = () => {
  const form = new FormData()

  // فیلد خالی هم فرستاده می‌شود؛ ویرایش کامل است و فیلد ارسال‌نشده پاک می‌شود
  form.append('title', title.value.trim())
  form.append('subtitle', subtitle.value.trim())
  form.append('buttonText', buttonText.value.trim())
  form.append('alt', alt.value.trim())
  form.append('linkUrl', linkUrl.value.trim())
  form.append('isActive', String(isActive.value))
  form.append('startsAt', toIso(startsAt.value))
  form.append('endsAt', toIso(endsAt.value))

  if (desktopFile.value) form.append('image', desktopFile.value)

  if (mobileFile.value) form.append('mobileImage', mobileFile.value)
  else if (mobileRemoved.value) form.append('removeMobileImage', 'true')

  return form
}

const submit = async () => {
  if (isSaving.value) return

  if (!validate()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }

  isSaving.value = true

  try {
    if (props.item) {
      await request(
        `/admin/home/sections/${props.sectionId}/items/${props.item.id}`,
        { method: 'PUT', body: buildForm() },
      )
    }
    else {
      await request(`/admin/home/sections/${props.sectionId}/items`, {
        method: 'POST',
        body: buildForm(),
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