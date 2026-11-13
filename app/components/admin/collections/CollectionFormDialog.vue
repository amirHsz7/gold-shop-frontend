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
            {{ isEdit ? 'ویرایش کالکشن' : 'افزودن کالکشن' }}
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

          <BaseBtn color="black" :loading="isSaving" @click="submit">
            {{ saveLabel }}
          </BaseBtn>
        </div>
      </div>

      <!-- Form -->
      <BaseForm
        class="mx-auto flex w-full max-w-2xl flex-col gap-5 p-5"
        @submit.prevent="submit"
      >
        <!-- بعد از ذخیره‌ی اطلاعات، فیلدها قفل می‌شوند و فقط عکس قابل تغییر است -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseInput
            dense
            v-model="name"
            label="نام کالکشن"
            maxlength="100"
            :disabled="locked"
            :error="!!fieldErrors.name"
            :error-message="fieldErrors.name"
          />

          <BaseInput
            v-model="slugModel"
            label="اسلاگ (بخشی از آدرس)"
            maxlength="120"
            dir="ltr"
            dense
            :disabled="locked"
            :hint="slugChanged ? 'با تغییر اسلاگ، لینک‌های قبلی این کالکشن از کار می‌افتند.' : undefined"
            :error="!!fieldErrors.slug"
            :error-message="fieldErrors.slug"
          />

          <BaseInput
            v-model="description"
            class="md:col-span-2"
            type="textarea"
            label="توضیحات (اختیاری)"
            :rows="4"
            maxlength="2000"
            dense
            counter
            :disabled="locked"
            :error="!!fieldErrors.description"
            :error-message="fieldErrors.description"
          />

          <BaseInput
            v-model="sortOrder"
            type="number"
            label="ترتیب نمایش"
            min="0"
            step="1"
            dense
            :disabled="locked"
            :error="!!fieldErrors.sortOrder"
            :error-message="fieldErrors.sortOrder"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input
              v-model="isActive"
              type="checkbox"
              class="h-4 w-4 rounded"
              :disabled="locked"
            />
            <span>فعال</span>
          </label>
          <span v-if="!isActive" class="text-xs text-gray-500">
            کالکشن غیرفعال در سایت نمایش داده نمی‌شود، ولی محصولاتش سر جای خودشان می‌مانند.
          </span>
        </div>

        <BaseImageUploader
          v-model="imageFile"
          v-model:access-url="existingImageUrl"
          title="تصویر کالکشن (اختیاری)"
          accept="image/jpeg,image/png,image/webp"
          crop
          :crop-aspect-ratio="IMAGE_ASPECT_RATIO"
          @error="toast.error($event)"
        />

        <!-- برای ارسال فرم با Enter -->
        <button type="submit" class="hidden" tabindex="-1" aria-hidden="true" />
      </BaseForm>

      <!-- Footer -->
      <div class="mx-auto flex w-full max-w-2xl justify-start gap-2 border-t border-gray-200 px-5 py-3">
        <BaseBtn color="black" :loading="isSaving" @click="submit">
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

const { isMobile } = useMobile()
const toast = useFormToast()

type CollectionItem = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  imageUrl: string | null
  productCount: number
}

type FieldKey = 'name' | 'slug' | 'description' | 'sortOrder'

const FIELD_KEYS: readonly string[] = ['name', 'slug', 'description', 'sortOrder']

// نسبت ابعاد برش عکس (۴ به ۳)؛ هر نسبتی که طرح سایت می‌خواهد بگذار
const IMAGE_ASPECT_RATIO = 4 / 3

const props = defineProps<{
  // خالی یعنی حالت ساخت، پر یعنی ویرایش همان کالکشن
  collection?: CollectionItem | null
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: [payload: { mode: 'create' | 'edit'; warning?: string }]
}>()

const { request } = useApiRequest()
const config = useRuntimeConfig()

// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string | null) =>
  path ? `${config.public.apiBaseUrl}${path}` : ''

const isEdit = computed(() => !!props.collection)

const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const description = ref('')
// BaseInput از نوع number مقدار را به‌صورت رشته برمی‌گرداند
const sortOrder = ref<string | number>(0)
const isActive = ref(true)

const imageFile = ref<File | null>(null)
const existingImageUrl = ref('')
const hadImage = ref(false)

// بعد از ذخیره‌ی موفق اطلاعات، فقط مرحله‌ی عکس قابل تکرار است
const detailsSaved = ref(false)
const savedId = ref<string | null>(null)

const isSaving = ref(false)
const fieldErrors = reactive<Partial<Record<FieldKey, string>>>({})

const locked = computed(() => detailsSaved.value || isSaving.value)

const saveLabel = computed(() => {
  if (isSaving.value) return 'در حال ذخیره...'
  if (detailsSaved.value) return 'تلاش دوباره برای ثبت عکس'
  return isEdit.value ? 'ذخیره تغییرات' : 'ذخیره'
})

const slugChanged = computed(
  () => isEdit.value && slug.value.trim() !== props.collection?.slug,
)

// عکس فعلی حذف شده و عکس جدیدی هم جایش انتخاب نشده
const imageRemoved = computed(
  () => hadImage.value && !existingImageUrl.value && !imageFile.value,
)

// با تایپ دستی اسلاگ، ساخت خودکار از روی نام متوقف می‌شود
const slugModel = computed({
  get: () => slug.value,
  set: (value) => {
    slug.value = String(value ?? '')
    slugTouched.value = true
  },
})

// حروف فارسی و انگلیسی، عدد و خط تیره (مطابق قانون اسلاگ در بکند)
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_\u200C]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

watch(name, (value) => {
  fieldErrors.name = undefined

  if (!slugTouched.value) slug.value = slugify(value)
})

watch(slug, () => {
  fieldErrors.slug = undefined
})

const clearFieldErrors = () => {
  for (const key of FIELD_KEYS) fieldErrors[key as FieldKey] = undefined
}

type ApiErrorData = {
  message?: string
  errors?: { field: string; message: string }[]
}

const getErrorMessage = (error: unknown) => {
  const data = (error as { data?: ApiErrorData } | null)?.data

  if (!data?.message) return 'خطایی رخ داد؛ دوباره تلاش کنید'

  const details = data.errors?.map(item => item.message).join('، ')

  return details ? `${data.message}: ${details}` : data.message
}

// خطای فیلدها را زیر خود فیلد و پیام کلی خطا را به‌صورت toast نشان می‌دهد
const applyApiError = (error: unknown) => {
  const data = (error as { data?: ApiErrorData } | null)?.data
  let mapped = false

  for (const item of data?.errors ?? []) {
    if (FIELD_KEYS.includes(item.field)) {
      fieldErrors[item.field as FieldKey] = item.message
      mapped = true
    }
  }

  toast.error(
    mapped && data?.message ? data.message : getErrorMessage(error),
  )
}

// هر بار که دیالوگ باز می‌شود فرم را از نو پر می‌کند
watch(open, (isOpen) => {
  if (!isOpen) return

  const collection = props.collection

  name.value = collection?.name ?? ''
  slug.value = collection?.slug ?? ''
  // در ویرایش، اسلاگ با تغییر نام عوض نمی‌شود
  slugTouched.value = !!collection
  description.value = collection?.description ?? ''
  sortOrder.value = collection?.sortOrder ?? 0
  isActive.value = collection?.isActive ?? true

  imageFile.value = null
  existingImageUrl.value = assetUrl(collection?.imageUrl ?? null)
  hadImage.value = !!collection?.imageUrl

  detailsSaved.value = false
  savedId.value = null
  clearFieldErrors()
})

const applyImage = async (id: string) => {
  if (imageFile.value) {
    // آپلود جدید، عکس قبلی را در بکند جایگزین و فایلش را پاک می‌کند
    const form = new FormData()
    form.append('image', imageFile.value)

    await request(`/admin/collections/${id}/image`, {
      method: 'PUT',
      body: form,
    })
  }
  else if (imageRemoved.value) {
    await request(`/admin/collections/${id}/image`, { method: 'DELETE' })
  }
}

const submit = async () => {
  if (isSaving.value) return

  clearFieldErrors()

  if (!detailsSaved.value) {
    if (name.value.trim().length < 2) {
      fieldErrors.name = 'نام کالکشن باید حداقل ۲ کاراکتر باشد'
    }

    if (slug.value.trim().length < 2) {
      fieldErrors.slug = 'اسلاگ باید حداقل ۲ کاراکتر باشد'
    }

    if (fieldErrors.name || fieldErrors.slug) return
  }

  isSaving.value = true

  try {
    // مرحله‌ی ۱: ساخت یا ویرایش اطلاعات (فقط یک بار)
    if (!detailsSaved.value) {
      const body = {
        name: name.value.trim(),
        slug: slug.value.trim(),
        description: description.value.trim() || null,
        sortOrder: Number(sortOrder.value) || 0,
        isActive: isActive.value,
      }

      if (props.collection) {
        await request(`/admin/collections/${props.collection.id}`, {
          method: 'PUT',
          body,
        })
        savedId.value = props.collection.id
      }
      else {
        const created = await request<{ data: { id: string } }>(
          '/admin/collections',
          { method: 'POST', body },
        )
        savedId.value = created.data.id
      }

      detailsSaved.value = true
    }

    // مرحله‌ی ۲: عکس (در صورت شکست، دیالوگ باز می‌ماند)
    try {
      if (savedId.value) await applyImage(savedId.value)
    }
    catch (error) {
      toast.error(
        `اطلاعات ذخیره شد ولی ثبت عکس ناموفق بود: ${getErrorMessage(error)}`,
      )
      return
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

// اگر اطلاعات ذخیره شده ولی عکس ثبت نشده، بستن هم لیست را به‌روز می‌کند
const cancel = () => {
  if (detailsSaved.value) {
    emit('saved', {
      mode: isEdit.value ? 'edit' : 'create',
      warning: 'اطلاعات کالکشن ذخیره شد ولی عکس آن ثبت نشد',
    })
    return
  }

  open.value = false
}
</script>