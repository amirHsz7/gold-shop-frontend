<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'

definePageMeta({ middleware: 'auth' })
usePageSeo({ title: 'درگاه آزمایشی', noindex: true })

type Outcome =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'NEEDS_REVIEW'
  | 'ALREADY_PROCESSED'

type PaymentResult = {
  outcome: Outcome
  orderId: string
}

const messages: Record<Outcome, string> = {
  PAYMENT_SUCCESS: 'پرداخت موفق بود و سفارش در حال آماده‌سازی است.',
  PAYMENT_FAILED: 'پرداخت ناموفق بود. تا پایان مهلت سفارش می‌توانید دوباره پرداخت کنید.',
  NEEDS_REVIEW: 'پرداخت ثبت شد و سفارش در انتظار بررسی فروشگاه است.',
  ALREADY_PROCESSED: 'این پرداخت قبلاً پردازش شده است.',
}

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { getMessage } = useApiError()

const busy = ref(false)
const errorMessage = ref('')
const result = ref<PaymentResult | null>(null)
const submitted = ref<'success' | 'failed' | null>(null)

async function complete(outcome: 'success' | 'failed') {
  if (busy.value || result.value) return
  if (submitted.value && submitted.value !== outcome) return

  busy.value = true
  submitted.value = outcome
  errorMessage.value = ''

  try {
    const authority = encodeURIComponent(String(route.params.authority))

    const response = await $api<{ data: PaymentResult }>(
      `/payments/mock/${authority}/complete`,
      {
        method: 'POST',
        body: { outcome },
        retry: 0,
      },
    )

    result.value = response.data
  }
  catch (error) {
    errorMessage.value = getMessage(
      error,
      'نتیجه دریافت نشد. همان درخواست را دوباره ارسال کنید.',
    )
  }
  finally {
    busy.value = false
  }
}

async function retryPayment() {
  if (busy.value || result.value?.outcome !== 'PAYMENT_FAILED') return

  busy.value = true
  errorMessage.value = ''

  try {
    const response = await $api<{ data: { checkoutUrl: string } }>(
      '/payments',
      {
        method: 'POST',
        body: { orderId: result.value.orderId },
        retry: 0,
      },
    )

    await router.replace(response.data.checkoutUrl)
  }
  catch (error) {
    errorMessage.value = getMessage(error, 'ایجاد پرداخت جدید انجام نشد.')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="mx-auto my-10 grid max-w-lg gap-5 rounded-2xl border border-nude/30 p-6">
    <h1 class="text-xl font-bold text-burgundy">درگاه پرداخت آزمایشی</h1>

    <p v-if="errorMessage" role="alert">
      {{ errorMessage }}
    </p>

    <template v-if="result">
      <p role="status">{{ messages[result.outcome] }}</p>
      <NuxtLink
        v-if="result.outcome === 'PAYMENT_SUCCESS'"
        :to="`/orders/${encodeURIComponent(result.orderId)}/invoice`"
        class="rounded-lg border px-4 py-2 text-center font-semibold"
      >
        مشاهده و چاپ فاکتور
      </NuxtLink>
      
      <BaseBtn
        v-if="result.outcome === 'PAYMENT_FAILED'"
        :loading="busy"
        @click="retryPayment"
      >
        پرداخت مجدد همین سفارش
      </BaseBtn>

      <NuxtLink to="/" class="underline">
        بازگشت به فروشگاه
      </NuxtLink>
    </template>

    <template v-else>
      <p>نتیجه پرداخت آزمایشی را انتخاب کنید.</p>

      <BaseBtn
        :disable="busy || submitted === 'failed'"
        @click="complete('success')"
      >
        شبیه‌سازی پرداخت موفق
      </BaseBtn>

      <BaseBtn
        :disable="busy || submitted === 'success'"
        @click="complete('failed')"
      >
        شبیه‌سازی پرداخت ناموفق
      </BaseBtn>
    </template>
  </main>
</template>