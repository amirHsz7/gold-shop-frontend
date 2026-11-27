<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: false })
usePageSeo({ title: 'فاکتور خرید', noindex: true })

type InvoiceItem = {
  id: string
  productName: string
  karat: number
  weight: string
  quantity: number
  originalUnitPrice: string
  unitPrice: string
}

type Invoice = {
  orderNumber: number
  paidAt: string
  recipientName: string
  recipientMobile: string
  province: string
  city: string
  address: string
  postalCode: string
  goldPricePerGram: number
  totalWeight: string
  itemsTotal: string
  discountTotal: string
  shippingCost: string
  totalAmount: string
  items: InvoiceItem[]
}

const route = useRoute()
const { data, status, refresh } = useApiFetch<{ data: Invoice }>(
  () => `/orders/${encodeURIComponent(String(route.params.id))}/invoice`,
  { server: false },
)

const invoice = computed(() => data.value?.data)
const numberFormat = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 3,
})
const dateFormat = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'long',
  timeZone: 'Asia/Tehran',
})

function formatNumber(value: string | number) {
  return numberFormat.format(Number(value))
}

function printInvoice() {
  window.print()
}
</script>
<template>
  <main dir="rtl" class="invoice-page">
    <div v-if="status === 'error'" class="invoice-state" role="alert">
      <p>دریافت فاکتور انجام نشد.</p>
      <button type="button" class="action-button" @click="refresh()">
        تلاش مجدد
      </button>
    </div>

    <p v-else-if="!invoice" class="invoice-state" role="status">
      در حال دریافت فاکتور…
    </p>

    <template v-else>
      <nav class="invoice-tools" aria-label="ابزارهای فاکتور">
        <NuxtLink to="/" class="shop-link">بازگشت به فروشگاه</NuxtLink>

        <button type="button" class="action-button" @click="printInvoice">
          چاپ یا ذخیره PDF
        </button>
      </nav>

      <article class="invoice-sheet" aria-labelledby="invoice-title">
        <header class="invoice-header">
          <div>
            <p class="brand-name">{{ SITE_NAME }}</p>
            <h1 id="invoice-title">فاکتور خرید</h1>
          </div>

          <dl class="invoice-meta">
            <div>
              <dt>شماره سفارش</dt>
              <dd><bdi>{{ formatNumber(invoice.orderNumber) }}</bdi></dd>
            </div>
            <div>
              <dt>تاریخ پرداخت</dt>
              <dd>{{ dateFormat.format(new Date(invoice.paidAt)) }}</dd>
            </div>
          </dl>
        </header>

        <div class="invoice-body">
          <div class="details-grid">
            <section aria-labelledby="recipient-title">
              <h2 id="recipient-title">مشخصات گیرنده</h2>
              <p class="recipient-name">{{ invoice.recipientName }}</p>
              <p><bdi>{{ invoice.recipientMobile }}</bdi></p>
              <p>{{ invoice.province }}، {{ invoice.city }}، {{ invoice.address }}</p>
              <p>کد پستی <bdi>{{ invoice.postalCode }}</bdi></p>
            </section>

            <section class="gold-details" aria-labelledby="gold-title">
              <h2 id="gold-title">اطلاعات طلا هنگام خرید</h2>
              <dl class="value-list">
                <div>
                  <dt>قیمت هر گرم</dt>
                  <dd>{{ formatNumber(invoice.goldPricePerGram) }} تومان</dd>
                </div>
                <div>
                  <dt>وزن کل سفارش</dt>
                  <dd>{{ formatNumber(invoice.totalWeight) }} گرم</dd>
                </div>
              </dl>
            </section>
          </div>

          <section class="items-section" aria-labelledby="items-title">
            <div class="section-heading">
              <h2 id="items-title">اقلام سفارش</h2>
              <span>مبالغ به تومان</span>
            </div>

            <table class="items-table" aria-labelledby="items-title">
              <thead>
                <tr>
                  <th scope="col">شرح کالا</th>
                  <th scope="col">وزن واحد</th>
                  <th scope="col">تعداد</th>
                  <th scope="col">قیمت واحد</th>
                  <th scope="col">جمع ردیف</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.id">
                  <th scope="row" class="product-cell">
                    <strong>{{ item.productName }}</strong>
                    <small>طلای {{ formatNumber(item.karat) }} عیار</small>
                  </th>
                  <td data-label="وزن واحد">{{ formatNumber(item.weight) }} گرم</td>
                  <td data-label="تعداد">{{ formatNumber(item.quantity) }}</td>
                  <td data-label="قیمت واحد">
                    <span class="unit-price">
                      <del v-if="Number(item.originalUnitPrice) > Number(item.unitPrice)">
                        {{ formatNumber(item.originalUnitPrice) }}
                      </del>
                      {{ formatNumber(item.unitPrice) }}
                    </span>
                  </td>
                  <td data-label="جمع ردیف" class="line-total">
                    {{ formatNumber(Number(item.unitPrice) * item.quantity) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="summary" aria-label="خلاصه مبالغ سفارش">
            <dl class="value-list">
              <div>
                <dt>جمع پیش از تخفیف</dt>
                <dd>{{ formatNumber(invoice.itemsTotal) }} تومان</dd>
              </div>
              <div>
                <dt>تخفیف</dt>
                <dd>{{ formatNumber(invoice.discountTotal) }} تومان</dd>
              </div>
              <div>
                <dt>هزینه ارسال</dt>
                <dd>
                  {{ Number(invoice.shippingCost) === 0
                    ? 'رایگان'
                    : `${formatNumber(invoice.shippingCost)} تومان` }}
                </dd>
              </div>
            </dl>

            <div class="paid-total">
              <span>مبلغ پرداخت‌شده</span>
              <strong>
                {{ formatNumber(invoice.totalAmount) }}
                <small>تومان</small>
              </strong>
            </div>
          </section>
        </div>
      </article>
    </template>
  </main>
</template>

<style scoped>
.invoice-page {
  --ink: #302629;
  --muted: #665b58;
  --line: #e4d9d0;
  --paper-tint: #faf7f3;
  min-height: 100dvh;
  padding: 28px 16px 64px;
  background: #f3efeb;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.85;
  font-variant-numeric: tabular-nums;
}

.invoice-tools,
.invoice-sheet,
.invoice-state {
  width: min(100%, 900px);
  margin-inline: auto;
}

.invoice-tools,
.section-heading,
.value-list > div,
.invoice-meta > div,
.paid-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.invoice-tools {
  align-items: center;
  margin-bottom: 16px;
}

.shop-link {
  color: var(--color-burgundy);
  text-underline-offset: 4px;
}

.shop-link:hover {
  text-decoration: underline;
}

.action-button {
  padding: 8px 20px;
  border-radius: 8px;
  background: var(--color-burgundy);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.action-button:focus-visible,
.shop-link:focus-visible {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 4px;
}

.invoice-sheet,
.invoice-state {
  background: white;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 12px 38px rgb(61 34 40 / 7%);
}

.invoice-state {
  padding: 32px;
}

.invoice-state .action-button {
  margin-top: 12px;
}

.invoice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 30px 40px;
  border-radius: 13px 13px 0 0;
  border-bottom: 3px solid var(--color-nude);
  background: var(--color-burgundy);
  color: white;
}

.brand-name {
  color: #f1d9c5;
  font-weight: 600;
}

.invoice-header h1 {
  margin-top: 4px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.4;
}

.invoice-meta {
  min-width: 215px;
}

.invoice-meta dt {
  color: #f1d9c5;
}

.invoice-meta dd,
.value-list dd {
  font-weight: 600;
}

.invoice-body {
  padding: 32px 40px 38px;
}

.details-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  align-items: start;
  gap: 32px;
}

.invoice-body h2 {
  margin-bottom: 8px;
  color: var(--color-burgundy);
  font-size: 16px;
  font-weight: 750;
}

.recipient-name,
.line-total {
  font-weight: 700;
}

.details-grid p,
.product-cell {
  overflow-wrap: anywhere;
}

.gold-details {
  padding: 16px 20px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper-tint);
}

.value-list > div {
  padding-block: 4px;
}

.value-list dt,
.section-heading span,
.product-cell small,
.unit-price del {
  color: var(--muted);
}

.items-section {
  margin-top: 30px;
}

.section-heading {
  margin-bottom: 8px;
}

.section-heading span,
.product-cell small,
.unit-price del {
  font-size: 12px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  text-align: start;
}

.items-table th,
.items-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--line);
  text-align: start;
  vertical-align: middle;
}

.items-table thead th {
  background: var(--paper-tint);
  color: var(--muted);
  font-size: 12px;
}

.product-cell {
  width: 36%;
}

.product-cell small,
.unit-price del {
  display: block;
  font-weight: 400;
}

.summary {
  width: min(100%, 360px);
  margin-block-start: 24px;
  margin-inline-start: auto;
}

.paid-total {
  margin-top: 10px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-inline-start: 3px solid var(--color-nude);
  border-radius: 6px;
  background: var(--paper-tint);
  color: var(--color-burgundy);
}

.paid-total strong {
  font-size: 21px;
}

.paid-total small {
  font-size: 12px;
}

@media screen and (max-width: 640px) {
  .invoice-page { padding: 16px 10px 36px; }
  .invoice-header { display: grid; gap: 16px; padding: 22px; }
  .invoice-header h1 { font-size: 26px; }
  .invoice-meta { min-width: 0; }
  .invoice-body { padding: 22px 16px; }
  .details-grid { grid-template-columns: 1fr; gap: 16px; }

  .items-table,
  .items-table tbody { display: block; }

  .items-table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .items-table tr {
    display: block;
    margin-bottom: 12px;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
  }

  .items-table .product-cell {
    display: block;
    width: 100%;
    margin-bottom: 6px;
    padding: 0 0 8px;
  }

  .items-table td {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 3px 0;
    border: 0;
  }

  .items-table td::before {
    content: attr(data-label);
    color: var(--muted);
    font-weight: 400;
  }

  .unit-price { text-align: end; }
}

@page {
  size: A4 portrait;
  margin: 14mm;
}

@media print {
  .invoice-page {
    min-height: auto;
    padding: 0;
    background: white;
    font-size: 10pt;
  }

  .invoice-tools { display: none; }

  .invoice-sheet {
    width: 100%;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .invoice-header {
    padding: 0 0 5mm;
    background: white;
    color: var(--ink);
    border-radius: 0;
  }

  .brand-name,
  .invoice-meta dt { color: var(--color-burgundy); }

  .invoice-body { padding: 6mm 0 0; }
  .items-table thead { display: table-header-group; }
  .items-table tr,
  .details-grid,
  .summary { break-inside: avoid; }
  .section-heading { break-after: avoid; }
}
</style>