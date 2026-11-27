<script setup lang="ts">
import AddressFields from '~/components/address/AddressFields.vue'
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseDialog from '~/components/base/dialog/BaseDialog.vue'
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import BaseList from '~/components/base/list/BaseList.vue'
import BaseItem from '~/components/base/item/BaseItem.vue'
import BaseItemSection from '~/components/base/item/BaseItemSection.vue'
import BaseItemLabel from '~/components/base/item/BaseItemLabel.vue'
import { toLatinDigits } from '~/utils/site'

definePageMeta({ middleware: 'auth' })
usePageSeo({ title: 'آدرس‌های من', noindex: true })

type AddressBody = {
  title: string
  province: string
  city: string
  address: string
  postalCode: string
}
type SavedAddress = AddressBody & { id: string }

const { $api } = useNuxtApp()
const toast = useFormToast()
const { getMessage, getFieldErrors } = useApiError()
const { data, status, error, refresh } = useApiFetch<{ data: SavedAddress[] }>(
  '/addresses',
  { server: false },
)

const emptyForm = (): AddressBody => ({
  title: '',
  province: '',
  city: '',
  address: '',
  postalCode: '',
})

const form = ref<AddressBody>(emptyForm())
const editingId = ref<string | null>(null)
const editorOpen = ref(false)
const deleteTarget = ref<SavedAddress | null>(null)
const busy = ref(false)
const formError = ref('')
const deleteError = ref('')
const fieldErrors = ref<Record<string, string>>({})

function openEditor(item?: SavedAddress) {
  editingId.value = item?.id ?? null
  form.value = item
    ? {
        title: item.title,
        province: item.province,
        city: item.city,
        address: item.address,
        postalCode: item.postalCode,
      }
    : emptyForm()
  fieldErrors.value = {}
  formError.value = ''
  editorOpen.value = true
}

function askDelete(item: SavedAddress) {
  deleteError.value = ''
  deleteTarget.value = item
}

async function saveAddress() {
  if (busy.value) return

  const body: AddressBody = {
    ...form.value,
    title: form.value.title.trim(),
    address: form.value.address.trim(),
    postalCode: toLatinDigits(form.value.postalCode.trim()),
  }

  const errors: Record<string, string> = {}
  if (!body.title) errors.title = 'عنوان آدرس را وارد کنید.'
  if (!body.province) errors.province = 'استان را انتخاب کنید.'
  if (!body.city) errors.city = 'شهر را انتخاب کنید.'
  if (body.address.length < 10) errors.address = 'آدرس کامل باید حداقل ۱۰ کاراکتر باشد.'
  if (!/^[1-9]\d{9}$/.test(body.postalCode)) errors.postalCode = 'کد پستی معتبر ۱۰ رقمی وارد کنید.'

  formError.value = ''
  fieldErrors.value = errors
  if (Object.keys(errors).length) return

  busy.value = true
  const id = editingId.value

  try {
    const result = await $api<{ data: SavedAddress }>(
      id ? `/addresses/${encodeURIComponent(id)}` : '/addresses',
      { method: id ? 'PATCH' : 'POST', body, retry: 0 },
    )

    const saved = result.data
    data.value = {
      data: [saved, ...(data.value?.data ?? []).filter(item => item.id !== saved.id)],
    }
    editorOpen.value = false
    toast.success(id ? 'تغییرات آدرس ذخیره شد.' : 'آدرس جدید اضافه شد.')
  }
  catch (cause) {
    fieldErrors.value = Object.fromEntries(
      getFieldErrors(cause).map(issue => [issue.field, issue.message]),
    )
    formError.value = getMessage(cause, 'ذخیره آدرس انجام نشد.')
  }
  finally {
    busy.value = false
  }
}

async function removeAddress() {
  const item = deleteTarget.value
  if (!item || busy.value) return

  busy.value = true
  deleteError.value = ''
  try {
    await $api(`/addresses/${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
      retry: 0,
    })
    data.value = { data: (data.value?.data ?? []).filter(row => row.id !== item.id) }
    deleteTarget.value = null
    toast.success('آدرس حذف شد.')
  }
  catch (cause) {
    deleteError.value = getMessage(cause, 'حذف آدرس انجام نشد.')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div :class="[SITE_GUTTER, 'pb-16 pt-6 lg:pb-20']">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/account" class="text-sm text-burgundy underline">
        حساب کاربری
      </NuxtLink>
        <div class="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-burgundy lg:text-3xl">آدرس‌های من</h1>

        <BaseBtn
            v-if="data && !error"
            label="افزودن آدرس"
            color="burgundy"
            no-caps
            unelevated
            :disable="busy || data.data.length >= 10"
            @click="openEditor()"
        />
        </div>

        <p v-if="data && data.data.length >= 10" class="mb-4 text-sm text-dark-gray">
        هر حساب می‌تواند حداکثر ۱۰ آدرس داشته باشد.
        </p>

      <div v-if="error" role="alert">
        <p class="mb-3">دریافت آدرس‌ها انجام نشد.</p>
        <BaseBtn label="تلاش دوباره" outline @click="refresh()" />
      </div>

      <p v-else-if="!data || status === 'pending'" role="status">
        در حال دریافت آدرس‌ها…
      </p>

      <p v-else-if="!data.data.length">
        هنوز آدرسی ذخیره نکردی.
      </p>

      <BaseList v-else class="rounded-2xl border border-nude/25 bg-white/60">
        <BaseItem
          v-for="item in data.data"
          :key="item.id"
          class="border-b border-nude/20 py-4! last:border-0"
        >
          <BaseItemSection>
            <BaseItemLabel class="font-semibold">{{ item.title }}</BaseItemLabel>

            <p class="mt-2 break-words">
              {{ item.province }}، {{ item.city }}، {{ item.address }}
            </p>

            <BaseItemLabel caption>
              کد پستی <bdi>{{ item.postalCode }}</bdi>
            </BaseItemLabel>

            <div class="mt-3 flex flex-wrap gap-2">
            <BaseBtn
                label="ویرایش"
                size="sm"
                outline
                color="burgundy"
                :disable="busy"
                @click="openEditor(item)"
            />
            <BaseBtn
                label="حذف"
                size="sm"
                flat
                color="burgundy"
                :disable="busy"
                @click="askDelete(item)"
            />
            </div>
          </BaseItemSection>
        </BaseItem>
      </BaseList>
    </div>
    <BaseDialog v-model="editorOpen" :persistent="busy">
    <form
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-editor-title"
        class="grid w-[min(90vw,32rem)] gap-4 rounded-2xl bg-white p-5 text-dark-brown"
        @submit.prevent="saveAddress"
    >
        <h2 id="address-editor-title" class="text-xl font-bold text-burgundy">
        {{ editingId ? 'ویرایش آدرس' : 'افزودن آدرس' }}
        </h2>

        <fieldset :disabled="busy" class="grid min-w-0 gap-4 border-0 p-0">
        <BaseInput
            v-model="form.title"
            label="عنوان آدرس"
            placeholder="مثلاً خانه یا محل کار"
            maxlength="50"
            :error="!!fieldErrors.title"
            :error-message="fieldErrors.title"
        />

        <AddressFields
            v-model:province="form.province"
            v-model:city="form.city"
            v-model:address="form.address"
            v-model:postal-code="form.postalCode"
            :errors="fieldErrors"
        />
        </fieldset>

        <p v-if="formError" role="alert" class="text-sm text-red-700">{{ formError }}</p>

        <div class="flex justify-end gap-2">
        <BaseBtn label="انصراف" flat :disable="busy" @click="editorOpen = false" />
        <BaseBtn type="submit" label="ذخیره آدرس" color="burgundy" :loading="busy" />
        </div>
    </form>
    </BaseDialog>

    <BaseDialog
    :model-value="deleteTarget !== null"
    :persistent="busy"
    @update:model-value="open => { if (!open && !busy) deleteTarget = null }"
    >
    <section
        v-if="deleteTarget"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-delete-title"
        class="grid w-[min(90vw,26rem)] gap-3 rounded-2xl bg-white p-5 text-dark-brown"
    >
        <h2 id="address-delete-title" class="font-bold">
        آدرس «{{ deleteTarget.title }}» حذف شود؟
        </h2>
        <p class="text-sm text-dark-gray">
        {{ deleteTarget.province }}، {{ deleteTarget.city }}، {{ deleteTarget.address }}
        </p>
        <p v-if="deleteError" role="alert" class="text-sm text-red-700">{{ deleteError }}</p>
        <div class="flex justify-end gap-2">
        <BaseBtn label="انصراف" flat :disable="busy" @click="deleteTarget = null" />
        <BaseBtn label="حذف آدرس" color="burgundy" :loading="busy" @click="removeAddress" />
        </div>
    </section>
    </BaseDialog>
  </div>
</template>