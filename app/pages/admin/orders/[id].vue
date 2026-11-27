<script setup lang="ts">
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import { orderStatusLabels, type AdminOrderStatus } from '~/utils/order-status'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  key: route => route.path,
})

type OrderDetail = {
  id: string
  orderNumber: number
  status: AdminOrderStatus
  user: { fullName: string; mobile: string }
  recipientName: string
  recipientMobile: string
  province: string
  city: string
  address: string
  postalCode: string
  totalAmount: string
  totalWeight: string
  shippingCost: string
  trackingCode: string | null
  shippedAt: string | null
  items: {
    id: string
    productName: string
    karat: number
    weight: string
    quantity: number
    unitPrice: string
  }[]
  payments: {
    id: string
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'
    amount: string
    refId: string | null
    failureReason: string | null
  }[]
}

const paymentLabels = {
  PENDING: 'در انتظار پرداخت',
  SUCCESS: 'موفق',
  FAILED: 'ناموفق',
  EXPIRED: 'منقضی‌شده',
}

const route = useRoute()
const endpoint = `/admin/orders/${encodeURIComponent(String(route.params.id))}`
const { $api } = useNuxtApp()
const { getMessage } = useApiError()
const toast = useFormToast()

const { data, status, error, refresh } = useApiFetch<{ data: OrderDetail }>(
  endpoint,
  { server: false },
)

const order = computed(() => data.value?.data)
const trackingCode = ref('')
const saving = ref(false)
const submitError = ref('')
const numberFormat = new Intl.NumberFormat('fa-IR')
const dateFormat = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
})

async function shipOrder() {
  const code = trackingCode.value.trim()
  if (!code || saving.value || order.value?.status !== 'PREPARING') return

  saving.value = true
  submitError.value = ''

  try {
    await $api(`${endpoint}/ship`, {
      method: 'PATCH',
      body: { trackingCode: code },
      retry: 0,
    })
    toast.success('ارسال سفارش ثبت شد.')
  }
  catch (cause) {
    submitError.value = getMessage(cause, 'ثبت ارسال تأیید نشد.')
  }
  finally {
    // پاسخ درخواست ممکن است قطع شود، در حالی که سرور ارسال را ثبت کرده است.
    await refresh()
    saving.value = false
  }
}
</script>

<template>
  <div class="order-page" dir="rtl">
    <NuxtLink to="/admin/orders" class="back-link">
      <span aria-hidden="true">→</span>
      بازگشت به سفارش‌ها
    </NuxtLink>

    <div v-if="error" class="panel state-box" role="alert">
      <p>{{ getMessage(error, 'دریافت سفارش انجام نشد.') }}</p>
      <button type="button" class="text-button" @click="refresh()">تلاش مجدد</button>
    </div>

    <p v-else-if="!order || status === 'idle'" class="panel state-box" role="status">
      در حال دریافت سفارش…
    </p>

    <template v-else>
      <header class="order-header">
        <div class="order-heading">
          <p class="heading-label">جزئیات سفارش</p>
          <h1>سفارش <bdi>{{ numberFormat.format(order.orderNumber) }}</bdi></h1>
        </div>

        <span class="status-badge" :data-status="order.status">
          {{ orderStatusLabels[order.status] }}
        </span>
      </header>

      <div class="order-grid">
        <section class="panel items-panel" aria-labelledby="items-title">
          <div class="panel-heading">
            <h2 id="items-title">اقلام سفارش</h2>
            <span class="subtle">وزن کل {{ numberFormat.format(Number(order.totalWeight)) }} گرم</span>
          </div>

          <ul class="item-list">
            <li v-for="item in order.items" :key="item.id" class="order-item">
              <div>
                <h3>{{ item.productName }}</h3>
                <p class="item-spec">
                  طلای {{ numberFormat.format(item.karat) }} عیار
                  <span aria-hidden="true">·</span>
                  هر عدد {{ numberFormat.format(Number(item.weight)) }} گرم
                </p>
              </div>

              <div class="item-quantity">
                <strong>{{ numberFormat.format(item.quantity) }} عدد</strong>
                <span class="subtle">
                  هر عدد {{ numberFormat.format(Number(item.unitPrice)) }} تومان
                </span>
              </div>
            </li>
          </ul>
        </section>

        <aside class="side-column">
          <section
            v-if="order.status === 'PREPARING' || order.status === 'SHIPPED'"
            class="panel shipment-panel"
            aria-labelledby="shipment-title"
          >
            <h2 id="shipment-title">
              {{ order.status === 'PREPARING' ? 'ثبت ارسال مرسوله' : 'اطلاعات ارسال' }}
            </h2>

            <form v-if="order.status === 'PREPARING'" class="ship-form" @submit.prevent="shipOrder">
              <BaseInput
                id="order-tracking"
                v-model="trackingCode"
                label="کد رهگیری"
                aria-label="کد رهگیری"
                aria-describedby="shipment-help"
                type="text"
                dir="ltr"
                input-class="text-left"
                autocomplete="off"
                placeholder="001234567890"
                :disabled="saving"
                required
                hide-bottom-space
              />
              <p id="shipment-help" class="subtle">
                با ثبت ارسال، پیامک اطلاع‌رسانی برای خریدار در صف قرار می‌گیرد.
              </p>
              <p v-if="submitError" class="error-message" role="alert">{{ submitError }}</p>
              <button type="submit" class="ship-button" :disabled="saving || !trackingCode.trim()">
                {{ saving ? 'در حال ثبت…' : 'ثبت ارسال سفارش' }}
              </button>
            </form>

            <dl v-else class="detail-list">
              <div>
                <dt>کد رهگیری</dt>
                <dd><bdi>{{ order.trackingCode || '—' }}</bdi></dd>
              </div>
              <div v-if="order.shippedAt">
                <dt>زمان ارسال</dt>
                <dd>{{ dateFormat.format(new Date(order.shippedAt)) }}</dd>
              </div>
            </dl>
          </section>

          <section class="panel" aria-labelledby="amount-title">
            <h2 id="amount-title">خلاصه مبلغ</h2>
            <dl class="detail-list">
              <div>
                <dt>هزینه ارسال</dt>
                <dd>
                  {{ Number(order.shippingCost) === 0
                    ? 'رایگان'
                    : `${numberFormat.format(Number(order.shippingCost))} تومان` }}
                </dd>
              </div>
              <div class="total-row">
                <dt>مبلغ سفارش</dt>
                <dd>
                  {{ numberFormat.format(Number(order.totalAmount)) }}
                  <small>تومان</small>
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        <section class="panel delivery-panel" aria-labelledby="delivery-title">
          <h2 id="delivery-title">مشخصات تحویل</h2>

          <div class="delivery-address">
            <span class="field-label">گیرندهٔ مرسوله</span>
            <strong>{{ order.recipientName }}</strong>
            <a :href="`tel:${order.recipientMobile}`"><bdi>{{ order.recipientMobile }}</bdi></a>
            <p>{{ order.province }}، {{ order.city }}، {{ order.address }}</p>
            <p class="subtle">کد پستی <bdi>{{ order.postalCode }}</bdi></p>
          </div>

          <div class="buyer-row">
            <span class="field-label">حساب خریدار</span>
            <span>{{ order.user.fullName }}</span>
            <a :href="`tel:${order.user.mobile}`"><bdi>{{ order.user.mobile }}</bdi></a>
          </div>
        </section>

        <section class="panel payments-panel" aria-labelledby="payments-title">
          <h2 id="payments-title">تاریخچه پرداخت</h2>

          <p v-if="!order.payments.length" class="subtle empty-payments">
            هنوز تراکنشی برای این سفارش ثبت نشده.
          </p>

          <ul v-else class="payment-list">
            <li v-for="payment in order.payments" :key="payment.id">
              <div class="payment-heading">
                <span class="payment-status" :data-payment="payment.status">
                  {{ paymentLabels[payment.status] }}
                </span>
                <strong>{{ numberFormat.format(Number(payment.amount)) }} تومان</strong>
              </div>
              <p v-if="payment.refId" class="subtle">
                شماره پیگیری بانک <bdi>{{ payment.refId }}</bdi>
              </p>
              <p v-if="payment.failureReason" class="subtle">
                علت ثبت‌شده <bdi>{{ payment.failureReason }}</bdi>
              </p>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.order-page {
  --ink: #31282a;
  --muted: #6c6263;
  --line: #e5dfe0;
  --wine: var(--color-burgundy, #641f32);
  max-width: 1120px;
  margin-inline: auto;
  padding-bottom: 32px;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.8;
  font-variant-numeric: tabular-nums;
}

.back-link,
.text-button {
  color: var(--wine);
  font-weight: 600;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.back-link:hover,
.text-button:hover,
.delivery-panel a:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.order-header,
.panel-heading,
.payment-heading,
.detail-list > div,
.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.order-header {
  flex-wrap: wrap;
  padding: 22px 26px;
  margin-bottom: 18px;
  border: 1px solid var(--line);
  border-inline-start: 4px solid var(--wine);
  border-radius: 14px;
  background: #fff;
}

.heading-label,
.field-label,
.subtle,
.item-spec,
.detail-list dt {
  color: var(--muted);
}

.heading-label,
.field-label,
.subtle,
.item-spec {
  font-size: 13px;
}

.order-heading h1 {
  color: var(--wine);
  font-size: clamp(23px, 3vw, 32px);
  font-weight: 800;
  line-height: 1.4;
}

.status-badge,
.payment-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 999px;
  background: #f0eded;
  color: #534c4e;
  font-size: 13px;
  font-weight: 700;
}

[data-status="PREPARING"],
[data-payment="PENDING"],
[data-status="PENDING_PAYMENT"] {
  background: #fbf0d9;
  color: #795311;
}

[data-status="SHIPPED"],
[data-payment="SUCCESS"] {
  background: #e6f2eb;
  color: #275a41;
}

[data-status="NEEDS_REVIEW"],
[data-payment="FAILED"] {
  background: #f9e8eb;
  color: #8a2941;
}

.order-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: 16px;
  align-items: start;
}

.items-panel,
.delivery-panel,
.payments-panel {
  grid-column: 1;
}

.side-column {
  grid-column: 2;
  grid-row: 1 / span 3;
  display: grid;
  gap: 16px;
  min-width: 0;
}

.panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: white;
}

.panel h2 {
  font-size: 16px;
  font-weight: 750;
}

.panel-heading {
  flex-wrap: wrap;
  gap: 4px 12px;
}

.item-list,
.payment-list {
  margin-top: 12px;
}

.order-item,
.payment-list li {
  padding-block: 12px;
  border-top: 1px solid var(--line);
}

.order-item:last-child,
.payment-list li:last-child {
  padding-bottom: 0;
}

.order-item h3,
.item-quantity strong,
.payment-heading strong,
.delivery-address strong {
  font-weight: 700;
}

.order-item h3,
.delivery-address p,
.payment-list bdi,
.detail-list dd {
  overflow-wrap: anywhere;
}

.item-spec span {
  margin-inline: 4px;
}

.item-quantity {
  display: grid;
  text-align: end;
  flex-shrink: 0;
}

.shipment-panel {
  border-top: 3px solid var(--color-nude, #b58a69);
}

.ship-form,
.delivery-address {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}




.ship-button {
  width: 100%;
  margin-top: 4px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--wine);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.ship-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.order-page :is(a, button):focus-visible {
  outline: 2px solid var(--wine);
  outline-offset: 3px;
}

.detail-list {
  margin-top: 12px;
}

.detail-list > div {
  align-items: baseline;
  padding-block: 7px;
}

.detail-list dd {
  text-align: end;
}

.detail-list .total-row {
  margin-top: 6px;
  padding-top: 12px;
  padding-bottom: 0;
  border-top: 1px solid var(--line);
}

.total-row dd {
  color: var(--wine);
  font-size: 21px;
  font-weight: 800;
}

.total-row small {
  font-size: 12px;
}

.delivery-address {
  gap: 3px;
  padding-inline-start: 14px;
  border-inline-start: 2px solid var(--color-nude, #b58a69);
}

.delivery-panel a {
  width: fit-content;
  color: var(--wine);
}

.buyer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.payment-heading {
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.empty-payments,
.state-box .text-button {
  margin-top: 8px;
}

.error-message {
  color: #9c273d;
}

@media (max-width: 760px) {
  .order-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .side-column {
    grid-column: 1;
    grid-row: auto;
  }

  .order-header,
  .panel {
    padding: 16px;
  }
}

@media (max-width: 420px) {
  .order-item {
    align-items: start;
    flex-direction: column;
    gap: 5px;
  }

  .item-quantity {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    text-align: start;
  }
}
</style>