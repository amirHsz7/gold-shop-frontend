<template>
  <main dir="rtl" class="px-4 py-6">
    <header class="mb-4 flex items-center gap-4 lg:mb-6">
      <h1 class="text-xl font-semibold text-gray-800">تنظیمات</h1>
    </header>

    <section class="max-w-xl rounded-xl border border-gray-200 bg-white p-5">
      <h2 class="text-base font-semibold text-gray-800">قیمت‌گذاری محصولات</h2>
      <p class="mt-1 mb-4 text-sm leading-6 text-gray-500">
        قیمت طلا و این دو درصد در محاسبه‌ی قیمت همه‌ی محصولات استفاده می‌شود.
        سود روی «طلای خام + اجرت» و مالیات روی «اجرت + سود» حساب می‌شود.
        با هر ذخیره، قیمت همه‌ی محصولات دوباره محاسبه می‌شود.
      </p>

      <p v-if="isLoading" class="py-6 text-center text-zinc-500">
        در حال بارگذاری...
      </p>

      <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <div>
          <BaseInput
            v-model="gold"
            type="number"
            label="قیمت هر گرم طلای ۱۸ عیار (تومان)"
            :hint="goldHint"
            :disabled="isSaving"
            :error="!!goldError"
            :error-message="goldError"
          />

          <p v-if="goldPriceUpdatedAt" class="mt-1 text-xs text-gray-400">
            آخرین به‌روزرسانی قیمت طلا:
            {{ dateFormatter.format(new Date(goldPriceUpdatedAt)) }}
          </p>
        </div>

        <BaseInput
          v-model="profit"
          type="number"
          label="درصد سود فروشنده"
          hint="مثلاً ۷"
          :disabled="isSaving"
          :error="!!profitError"
          :error-message="profitError"
        />

        <BaseInput
          v-model="vat"
          type="number"
          label="درصد مالیات بر ارزش افزوده"
          hint="مثلاً ۱۰"
          :disabled="isSaving"
          :error="!!vatError"
          :error-message="vatError"
        />

        <div class="flex items-center gap-3">
          <BaseBtn color="black" :loading="isSaving" @click="save">
            ذخیره
          </BaseBtn>

          <span v-if="updatedAt" class="text-xs text-gray-400">
            آخرین تغییر: {{ dateFormatter.format(new Date(updatedAt)) }}
          </span>
        </div>
      </form>
    </section>

    <OrderSmsSettings v-if="userStore.isSuperAdmin" />
  </main>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import OrderSmsSettings from '~/components/admin/OrderSmsSettings.vue'
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

type PricingSettingsResponse = {
  data: {
    sellerProfitPercent: number
    vatPercent: number
    goldPricePerGram: number | null
    goldPriceUpdatedAt: string | null
    updatedAt: string | null
  }
}

const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage } = useApiError()
const pricing = usePricingStore()
const userStore = useUserStore()
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const { data, status } = useApiFetch<PricingSettingsResponse>(
  '/admin/pricing-settings',
  { key: 'admin-pricing-settings', server: false, lazy: true },
)

const isLoading = computed(() => !data.value && status.value === 'pending')

const gold = ref<string | number | null>('')
const profit = ref<string | number | null>('')
const vat = ref<string | number | null>('')
const updatedAt = ref<string | null>(null)
const goldPriceUpdatedAt = ref<string | null>(null)

const goldError = ref<string | undefined>()
const profitError = ref<string | undefined>()
const vatError = ref<string | undefined>()
const isSaving = ref(false)

// نمایش خوانای قیمت زیر فیلد، مثلاً «۳٬۵۰۰٬۰۰۰ تومان»
const goldHint = computed(() => {
  const number = Number(gold.value)

  return gold.value !== '' && Number.isFinite(number) && number > 0
    ? `${number.toLocaleString('fa-IR')} تومان`
    : 'مثلاً ۳۵۰۰۰۰۰'
})

// مقدار فرم را از بکند پر می‌کند
watch(
  data,
  (value) => {
    if (!value) return

    gold.value = value.data.goldPricePerGram ?? ''
    profit.value = value.data.sellerProfitPercent
    vat.value = value.data.vatPercent
    updatedAt.value = value.data.updatedAt
    goldPriceUpdatedAt.value = value.data.goldPriceUpdatedAt
  },
  { immediate: true },
)

// عدد بین ۰ و ۱۰۰ با حداکثر دو رقم اعشار؛ خطا را برمی‌گرداند
const validate = (value: string | number | null, label: string) => {
  if (value === '' || value === null) return `${label} را وارد کنید`

  const number = Number(value)

  if (!Number.isFinite(number)) return `${label} باید عدد باشد`
  if (number < 0 || number > 100) return `${label} باید بین ۰ تا ۱۰۰ باشد`
  if (Math.round(number * 100) / 100 !== number) return `${label} حداکثر دو رقم اعشار دارد`

  return undefined
}

// قیمت طلا باید عدد صحیح مثبت (تومان) باشد
const validateGold = (value: string | number | null) => {
  if (value === '' || value === null) return 'قیمت طلا را وارد کنید'

  const number = Number(value)

  if (!Number.isFinite(number)) return 'قیمت طلا باید عدد باشد'
  if (!Number.isInteger(number)) return 'قیمت طلا باید عدد صحیح باشد'
  if (number < 1) return 'قیمت طلا باید بیشتر از صفر باشد'
  if (number > 1_000_000_000) return 'قیمت طلا بیش از حد بزرگ است'

  return undefined
}

const save = async () => {
  if (isSaving.value) return

  goldError.value = validateGold(gold.value)
  profitError.value = validate(profit.value, 'درصد سود')
  vatError.value = validate(vat.value, 'درصد مالیات')

  if (goldError.value || profitError.value || vatError.value) return

  isSaving.value = true

  try {
    const res = await request<PricingSettingsResponse & { message: string }>(
      '/admin/pricing-settings',
      {
        method: 'PUT',
        body: {
          goldPricePerGram: Number(gold.value),
          sellerProfitPercent: Number(profit.value),
          vatPercent: Number(vat.value),
        },
      },
    )

    updatedAt.value = res.data.updatedAt
    goldPriceUpdatedAt.value = res.data.goldPriceUpdatedAt

    // قیمت‌های نمایشی همین مرورگر هم بلافاصله به‌روز شوند
    pricing.setSettings({
      sellerProfitPercent: res.data.sellerProfitPercent,
      vatPercent: res.data.vatPercent,
    })

    if (res.data.goldPricePerGram) {
      pricing.setGoldPrice(res.data.goldPricePerGram)
    }

    toast.success(res.message)
  }
  catch (e) {
    toast.error(getMessage(e))
  }
  finally {
    isSaving.value = false
  }
}
</script>