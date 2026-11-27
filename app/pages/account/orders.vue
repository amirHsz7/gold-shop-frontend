<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BasePagination from '~/components/base/pagination/BasePagination.vue'
import { orderStatusLabels } from '~/utils/order-status'

definePageMeta({ middleware: 'auth' })
usePageSeo({ title: 'سفارش‌های من', noindex: true })

type CustomerOrder = {
  id: string
  orderNumber: number
  status: keyof typeof orderStatusLabels
  totalAmount: string
  createdAt: string
  shippedAt: string | null
  trackingCode: string | null
  canViewInvoice: boolean
}

type OrdersResponse = {
  data: {
    items: CustomerOrder[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

const pageIndex = ref(0)
const { getMessage } = useApiError()

// BasePagination صفرمبناست و GET /orders از صفحهٔ ۱ شروع می‌کند.
const query = computed(() => ({
  page: pageIndex.value + 1,
  limit: 10,
}))

const { data, status, error, refresh } = useApiFetch<OrdersResponse>(
  '/orders',
  { query, server: false },
)

const orders = computed(() => data.value?.data.items ?? [])
const pagination = computed(() => data.value?.data.pagination)
const numbers = new Intl.NumberFormat('fa-IR')
const dates = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeZone: 'Asia/Tehran',
})
</script>

<template>
  <main dir="rtl" class="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
    <header class="mb-6 flex items-baseline justify-between gap-3">
      <h1 class="text-2xl font-bold text-burgundy">سفارش‌های من</h1>
      <span v-if="pagination && !error" class="text-sm text-dark-brown/70">
        {{ numbers.format(pagination.total) }} سفارش
      </span>
    </header>

    <div v-if="error" class="space-y-3" role="alert">
      <p>{{ getMessage(error, 'دریافت سفارش‌ها انجام نشد.') }}</p>
      <BaseBtn outline @click="refresh()">تلاش مجدد</BaseBtn>
    </div>

    <p v-else-if="status === 'idle' || status === 'pending'" role="status">
      در حال دریافت سفارش‌ها…
    </p>

    <div
      v-else-if="!orders.length"
      class="rounded-2xl border border-nude/30 bg-white p-6"
    >
      <p class="mb-4">هنوز سفارشی ثبت نکردی.</p>
      <BaseBtn to="/products" outline>مشاهده محصولات</BaseBtn>
    </div>

    <ul v-else class="space-y-4">
      <li
        v-for="order in orders"
        :key="order.id"
        class="rounded-2xl border border-nude/30 bg-white p-4 sm:p-6"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-bold text-dark-brown">
              سفارش {{ numbers.format(order.orderNumber) }}
            </h2>
            <time :datetime="order.createdAt" class="text-sm text-dark-brown/70">
              {{ dates.format(new Date(order.createdAt)) }}
            </time>
          </div>

          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="{
              'bg-green-50 text-green-800': order.status === 'SHIPPED',
              'bg-amber-50 text-amber-800':
                order.status === 'PREPARING' || order.status === 'PENDING_PAYMENT',
              'bg-rose-50 text-rose-800': order.status === 'NEEDS_REVIEW',
              'bg-gray-100 text-gray-700':
                order.status === 'CANCELLED' || order.status === 'EXPIRED',
            }"
          >
            {{ orderStatusLabels[order.status] }}
          </span>
        </div>

        <p class="mt-4">
          مبلغ سفارش
          <strong>{{ numbers.format(Number(order.totalAmount)) }} تومان</strong>
        </p>

        <div
          v-if="order.status === 'SHIPPED'"
          class="mt-3 space-y-1 border-s-2 border-nude ps-3 text-sm"
        >
          <p v-if="order.shippedAt">
            تاریخ ارسال {{ dates.format(new Date(order.shippedAt)) }}
          </p>
          <p v-if="order.trackingCode">
            کد رهگیری
            <bdi dir="ltr" class="select-all font-semibold">{{ order.trackingCode }}</bdi>
          </p>
        </div>

        <p v-if="order.status === 'NEEDS_REVIEW'" class="mt-3 text-sm text-dark-brown/75">
          فروشگاه در حال بررسی وضعیت این سفارش است.
        </p>

        <div v-if="order.canViewInvoice" class="mt-4">
          <BaseBtn
            :to="`/orders/${encodeURIComponent(order.id)}/invoice`"
            outline
            size="sm"
          >
            مشاهده و چاپ فاکتور
          </BaseBtn>
        </div>
      </li>
    </ul>

    <nav
      v-if="!error && pagination && pagination.totalPages > 1"
      aria-label="صفحه‌بندی سفارش‌ها"
      class="mt-6 flex justify-center"
    >
      <BasePagination
        v-model="pageIndex"
        :max="pagination.totalPages"
        :max-pages="3"
        :boundary-links="false"
        :loading="status === 'pending'"
        locale="fa-IR"
        dir="rtl"
        size="sm"
      />
    </nav>
  </main>
</template>