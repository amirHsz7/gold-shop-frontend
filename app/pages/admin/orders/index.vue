<script setup lang="ts">
import BaseListPage from '~/components/base/list-page/BaseListPage.vue'
import type { Column } from '~/components/base/table/types'
import { orderStatusLabels, type AdminOrderStatus } from '~/utils/order-status'

definePageMeta({ middleware: 'admin', layout: 'admin' })

type OrderRow = {
  id: string
  orderNumber: number
  recipientName: string
  status: AdminOrderStatus
  totalAmount: string
}

type OrdersResponse = {
  data: {
    items: OrderRow[]
    pagination: { total: number; totalPages: number }
  }
}

const page = ref(0)
const rowsPerPage = ref(20)
const search = ref('')
const statusFilter = ref<AdminOrderStatus | ''>('')
const numberFormat = new Intl.NumberFormat('fa-IR')

watch([search, statusFilter, rowsPerPage], () => {
  page.value = 0
}, { flush: 'sync' })

const query = computed(() => ({
  page: page.value + 1,
  limit: rowsPerPage.value,
  orderNumber: search.value.trim() || undefined,
  status: statusFilter.value || undefined,
}))

const { data, status, error, refresh } = useApiFetch<OrdersResponse>(
  '/admin/orders',
  { query, server: false },
)

const rows = computed(() => data.value?.data.items ?? [])
const pagination = computed(() => data.value?.data.pagination)

const columns: Column[] = [
  { name: 'orderNumber', label: 'شماره سفارش', field: 'orderNumber' },
  { name: 'recipientName', label: 'گیرنده', field: 'recipientName' },
  { name: 'status', label: 'وضعیت', field: 'status' },
  { name: 'totalAmount', label: 'مبلغ سفارش (تومان)', field: 'totalAmount' },
]

function openOrder(row: OrderRow) {
  return navigateTo(`/admin/orders/${encodeURIComponent(row.id)}`)
}
</script>

<template>
  <BaseListPage
    v-model:page="page"
    v-model:rows-per-page="rowsPerPage"
    v-model:search="search"
    title="سفارش‌ها"
    entity-name="سفارش"
    search-placeholder="جست‌وجو با شماره دقیق سفارش"
    :show-back-btn="false"
    :show-add-btn="false"
    :columns="columns"
    :rows="rows"
    server-side-search
    server-side-pagination
    :total-elements="pagination?.total ?? 0"
    :total-pages="pagination?.totalPages ?? 0"
    :firstloading="!data && (status === 'idle' || status === 'pending')"
    :loading="!!data && status === 'pending'"
    :error="!!error"
    @row-click="openOrder"
  >
    <template #filters>
      <label class="flex items-center gap-2 text-sm">
        وضعیت سفارش
        <select
          v-model="statusFilter"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">همهٔ وضعیت‌ها</option>
          <option v-for="(label, value) in orderStatusLabels" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </label>
      <button v-if="error" type="button" class="underline" @click="refresh()">
        دریافت مجدد
      </button>
    </template>

    <template #body-cell(orderNumber)="{ row }">
      <NuxtLink
        :to="`/admin/orders/${encodeURIComponent(row.id)}`"
        class="font-semibold text-burgundy underline"
        @click.stop
      >
        {{ numberFormat.format(row.orderNumber) }}
      </NuxtLink>
    </template>

    <template #body-cell(status)="{ row }">
      {{ orderStatusLabels[row.status as AdminOrderStatus] }}
    </template>

    <template #body-cell(totalAmount)="{ row }">
      {{ numberFormat.format(Number(row.totalAmount)) }}
    </template>
  </BaseListPage>
</template>