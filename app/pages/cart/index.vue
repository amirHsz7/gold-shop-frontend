<template>
  <div :class="['pb-16 pt-6 lg:pb-20', SITE_GUTTER]">
    <nav aria-label="مسیر صفحه" class="flex items-center gap-2 text-xs text-dark-gray lg:text-sm">
      <NuxtLink to="/">خانه</NuxtLink>
      <Icon name="lucide:chevron-left" size="14" />
      <span class="text-dark-brown">سبد خرید</span>
    </nav>

    <div class="my-5 flex items-baseline gap-3">
      <h1 class="text-2xl font-bold text-burgundy lg:text-3xl">سبد خرید</h1>
      <span v-if="!cartStore.isEmpty" class="text-sm text-dark-gray">
        {{ toFaNumber(totalQuantity) }} کالا
      </span>
    </div>

    <div v-if="initialLoading" class="py-20 text-center text-dark-brown/60">
      در حال بارگذاری سبد خرید...
    </div>

    <div
      v-else-if="loadError"
      class="rounded-2xl border border-nude/25 bg-white/60 p-8 text-center"
    >
      <p class="mb-4">{{ loadError }}</p>
      <BaseBtn color="burgundy" round no-caps unelevated label="تلاش دوباره" @click="load" />
    </div>

    <!-- سبد خالی -->
    <div
      v-else-if="cartStore.isEmpty"
      class="flex flex-col items-center gap-4 rounded-2xl border border-nude/25 bg-white/60 px-6 py-16 text-center"
    >
      <Icon name="lucide:shopping-bag" size="48" class="text-nude" />
      <p class="text-lg font-semibold">سبد خرید شما خالی است</p>
      <p class="text-sm text-dark-gray">برای شروع، از میان محصولات سایت انتخاب کنید.</p>
      <BaseBtn to="/products" color="burgundy" round no-caps unelevated label="مشاهده‌ی محصولات" />
    </div>

    <template v-else>
      <div
        role="status"
        aria-live="polite"
        class="mb-6 flex items-center gap-2.5 rounded-xl border border-nude/20 bg-white/50 px-4 py-2.5 text-xs text-dark-gray lg:text-sm"
      >
        <Icon name="lucide:refresh-cw" size="16" class="shrink-0" />
        <span>قیمت‌ها هر یک دقیقه به‌روز می‌شوند. آخرین به‌روزرسانی: ساعت {{ updatedTime }}</span>
      </div>

      <!-- هشدار تغییر قیمت -->
      <div
        v-if="cartStore.priceChanges.length > 0"
        role="alert"
        class="mb-6 flex items-start justify-between gap-3 rounded-xl bg-gold/25 px-4 py-3 text-sm text-[#5C430E]"
      >
        <div class="flex flex-col gap-1">
          <span class="font-semibold">قیمت برخی کالاها تغییر کرد</span>
          <span v-for="change in cartStore.priceChanges" :key="change.variantId" class="text-xs leading-7">
            {{ change.name }}: از {{ formatToman(change.from) }} به {{ formatToman(change.to) }} تومان
          </span>
        </div>
        <button type="button" class="shrink-0 text-xs underline" @click="cartStore.clearPriceChanges()">
          متوجه شدم
        </button>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <section aria-label="کالاهای سبد" class="flex min-w-0 flex-1 flex-col gap-3">
          <ul class="flex flex-col gap-3">
            <li v-for="item in cartStore.items" :key="item.variantId">
              <article
                class="flex flex-wrap gap-x-5 gap-y-4 rounded-2xl p-4"
                :class="
                  unavailable(item)
                    ? 'border border-dashed border-nude bg-white/30'
                    : 'border border-nude/20 bg-white/50'
                "
              >
                <NuxtLink
                  :to="`/products/${item.slug}`"
                  tabindex="-1"
                  aria-hidden="true"
                  class="flex size-26 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-nude/10"
                  :class="unavailable(item) && 'opacity-60'"
                >
                  <img
                    v-if="item.imageUrl"
                    :src="assetUrl(item.imageUrl)"
                    :alt="item.imageAlt ?? item.name"
                    class="size-full object-cover"
                    loading="lazy"
                  >
                  <Icon v-else name="lucide:gem" size="36" class="text-nude" />
                </NuxtLink>

                <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-base font-semibold" :class="unavailable(item) && 'text-dark-gray'">
                      <NuxtLink :to="`/products/${item.slug}`">{{ item.name }}</NuxtLink>
                    </h2>
                    <span
                      v-if="unavailable(item)"
                      class="rounded-full bg-dark-gray px-2.5 py-0.5 text-xs text-white"
                    >
                      ناموجود شد
                    </span>
                  </div>

                  <p class="text-sm text-dark-gray">
                    وزن {{ formatWeight(item.weight) }} گرم · عیار {{ toFaNumber(item.karat) }}
                  </p>

                  <p
                    v-if="!unavailable(item) && item.unitPrice !== null"
                    class="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-burgundy"
                  >
                    {{ formatToman(item.unitPrice) }} تومان
                    <del
                      v-if="item.unitOriginalPrice && item.unitOriginalPrice > item.unitPrice"
                      class="text-xs font-normal text-dark-gray"
                    >
                      {{ formatToman(item.unitOriginalPrice) }}
                    </del>
                  </p>

                  <p
                    v-if="item.issue === 'UNAVAILABLE' || item.issue === 'OUT_OF_STOCK'"
                    class="flex items-start gap-2 rounded-lg bg-dark-brown/5 px-2.5 py-2 text-xs leading-6"
                  >
                    <Icon name="lucide:info" size="16" class="mt-1 shrink-0" />
                    این کالا دیگر موجود نیست و در مبلغ نهایی حساب نمی‌شود. می‌توانید آن را حذف کنید.
                  </p>
                </div>

                <div class="flex min-w-44 flex-col items-end justify-between gap-3">
                  <p
                    v-if="!unavailable(item) && item.lineTotal !== null"
                    class="text-base font-bold text-burgundy"
                  >
                    {{ formatToman(item.lineTotal) }}
                    <span class="text-xs font-normal">تومان</span>
                  </p>

                  <div v-if="!unavailable(item)" class="flex flex-col items-end gap-1.5">
                    <div class="flex items-center gap-2">
                      <div
                        role="group"
                        aria-label="تعداد"
                        class="flex h-11 items-center overflow-hidden rounded-xl border border-gray bg-white"
                      >
                        <button
                          type="button"
                          class="flex size-11 items-center justify-center disabled:opacity-35"
                          aria-label="کاهش تعداد"
                          :disabled="cartStore.busy || item.effectiveQuantity <= 1"
                          @click="changeQuantity(item, item.effectiveQuantity - 1)"
                        >
                          <Icon name="lucide:minus" size="16" />
                        </button>
                        <span class="min-w-7 text-center font-semibold">
                          {{ toFaNumber(item.effectiveQuantity) }}
                        </span>
                        <button
                          type="button"
                          class="flex size-11 items-center justify-center disabled:cursor-not-allowed disabled:opacity-35"
                          :aria-label="
                            item.effectiveQuantity >= item.stock
                              ? 'افزایش تعداد (به سقف موجودی رسیده‌اید)'
                              : 'افزایش تعداد'
                          "
                          :disabled="cartStore.busy || item.effectiveQuantity >= item.stock"
                          @click="changeQuantity(item, item.effectiveQuantity + 1)"
                        >
                          <Icon name="lucide:plus" size="16" />
                        </button>
                      </div>

                      <button
                        type="button"
                        class="flex size-11 items-center justify-center rounded-xl text-dark-gray hover:bg-white"
                        :aria-label="`حذف ${item.name} از سبد`"
                        :disabled="cartStore.busy"
                        @click="remove(item)"
                      >
                        <Icon name="lucide:trash-2" size="20" />
                      </button>
                    </div>

                    <span
                      v-if="item.stock <= 5 || item.issue === 'QUANTITY_EXCEEDS_STOCK'"
                      class="text-xs text-[#8A4B12]"
                    >
                      فقط {{ toFaNumber(item.stock) }} عدد موجود است
                    </span>
                  </div>

                  <button
                    v-else
                    type="button"
                    class="flex h-11 items-center gap-2 rounded-xl border border-gray bg-white px-4 text-sm"
                    :disabled="cartStore.busy"
                    @click="remove(item)"
                  >
                    <Icon name="lucide:trash-2" size="18" />
                    حذف از سبد
                  </button>
                </div>
              </article>
            </li>
          </ul>

          <NuxtLink to="/products" class="self-start text-sm font-medium text-burgundy">
            + افزودن کالای دیگر
          </NuxtLink>
        </section>

        <!-- خلاصه‌ی سفارش -->
        <aside
          v-if="summary"
          aria-label="خلاصه‌ی سفارش"
          class="flex flex-col gap-4 rounded-2xl border border-nude/20 bg-white p-6 lg:sticky lg:top-24 lg:w-95 lg:shrink-0"
        >
          <h2 class="text-base font-bold text-burgundy">خلاصه‌ی سفارش</h2>

          <dl class="flex flex-col gap-3 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-dark-gray">جمع کالاها ({{ toFaNumber(totalQuantity) }} عدد)</dt>
              <dd>{{ formatToman(summary.itemsTotal) }} تومان</dd>
            </div>
            <div v-if="summary.discountTotal > 0" class="flex justify-between gap-3">
              <dt class="text-dark-gray">تخفیف</dt>
              <dd class="text-burgundy">−{{ formatToman(summary.discountTotal) }} تومان</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-dark-gray">هزینه‌ی ارسال</dt>
              <dd v-if="summary.freeShipping" class="font-semibold text-[#2F5D3A]">رایگان</dd>
              <dd v-else>{{ formatToman(summary.shippingCost) }} تومان</dd>
            </div>
          </dl>

          <div class="h-px bg-gray" />

          <div class="flex items-baseline justify-between gap-3">
            <span class="text-sm font-semibold">مبلغ قابل پرداخت</span>
            <span class="text-lg font-bold text-burgundy">
              {{ formatToman(summary.totalAmount) }}
              <span class="text-xs font-normal">تومان</span>
            </span>
          </div>

          <p
            v-if="summary.freeShipping"
            class="flex items-start gap-2 rounded-xl bg-[#2F5D3A]/10 px-3 py-2.5 text-xs leading-6 text-[#2F5D3A]"
          >
            <Icon name="lucide:check" size="16" class="mt-1 shrink-0" />
            ارسال این سفارش رایگان است.
          </p>
          <p
            v-else-if="summary.freeShippingRemainingWeight !== null"
            class="flex items-start gap-2 rounded-xl bg-gold/20 px-3 py-2.5 text-xs leading-6 text-[#5C430E]"
          >
            <Icon name="lucide:truck" size="16" class="mt-1 shrink-0" />
            با افزودن {{ formatWeight(summary.freeShippingRemainingWeight) }} گرم دیگر،
            ارسال سفارش شما رایگان می‌شود.
          </p>

          <!-- صفحه‌ی تسویه‌حساب در مرحله‌ی بعد ساخته می‌شود -->
          <BaseBtn
            color="dark-brown"
            no-caps
            unelevated
            label="ادامه و تسویه‌حساب"
            class="h-13 rounded-xl text-[15px] font-semibold"
            :disable="cartStore.busy || cartStore.cart?.hasIssues === true || summary.totalAmount <= 0"
            @click="goCheckout"
          />

          <p
            v-if="cartStore.cart?.hasIssues"
            class="text-xs leading-6 text-[#8A4B12]"
          >
            برای ادامه، کالاهای ناموجود را حذف یا تعداد را اصلاح کنید.
          </p>

          <p class="flex items-start gap-2 text-xs leading-6 text-dark-gray">
            <Icon name="lucide:info" size="16" class="mt-1 shrink-0" />
            قیمت نهایی لحظه‌ی پرداخت یک‌بار دیگر بررسی می‌شود. کالای ناموجود در مبلغ بالا حساب نشده است.
          </p>
        </aside>

        <p
          v-else
          class="rounded-2xl border border-nude/25 bg-white p-6 text-sm lg:w-95"
        >
          قیمت‌ها در حال به‌روزرسانی است؛ کمی بعد دوباره تلاش کنید.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import { toFaNumber } from '~/utils/formatNumber'
import { useCartStore, type CartLine } from '~/stores/cart'

definePageMeta({ middleware: 'auth' })

usePageSeo({ title: 'سبد خرید', noindex: true })

const cartStore = useCartStore()
const assetUrl = useAssetUrl()
const { notify } = useToast()
const { getMessage, getStatus } = useApiError()

const initialLoading = ref(true)
const loadError = ref('')

const summary = computed(() => cartStore.cart?.summary ?? null)

const totalQuantity = computed(() =>
  cartStore.items.reduce((sum, item) => sum + item.effectiveQuantity, 0),
)

const updatedTime = computed(() => {
  const value = cartStore.cart?.updatedAt
  if (!value) return ''

  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
})

const unavailable = (item: CartLine) =>
  item.issue === 'UNAVAILABLE' || item.issue === 'OUT_OF_STOCK'

const showError = (error: unknown, fallback: string) =>
  notify({
    message: getMessage(error, fallback),
    color: 'burgundy',
    textColor: 'white',
    position: 'top',
    timeout: 4000,
  })

async function load() {
  loadError.value = ''

  try {
    await cartStore.fetchCart()
  }
  catch (error) {
    if (getStatus(error) === 401) {
      useUserStore().logout()
      await navigateTo('/login')
      return
    }
    loadError.value = getMessage(error, 'دریافت سبد خرید انجام نشد')
  }
  finally {
    initialLoading.value = false
  }
}

async function changeQuantity(item: CartLine, quantity: number) {
  try {
    await cartStore.setQuantity(item.variantId, quantity)
  }
  catch (error) {
    showError(error, 'تغییر تعداد انجام نشد')
    await cartStore.fetchCart().catch(() => {})
  }
}

async function remove(item: CartLine) {
  try {
    await cartStore.removeItem(item.variantId)
  }
  catch (error) {
    showError(error, 'حذف کالا انجام نشد')
  }
}

const goCheckout = () => {
  notify({
    message: 'صفحه‌ی تسویه‌حساب به‌زودی فعال می‌شود',
    color: 'burgundy',
    textColor: 'white',
    position: 'top',
    timeout: 3000,
  })
}

// به‌روزرسانی قیمت‌ها هر ۱ دقیقه، فقط وقتی تب دیده می‌شود
let timer: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  if (document.visibilityState !== 'visible' || cartStore.busy) return

  try {
    await cartStore.fetchCart(true)
  }
  catch {
    // خطای موقت شبکه؛ دور بعدی دوباره تلاش می‌کند
  }
}

const onVisible = () => {
  if (document.visibilityState === 'visible') refresh()
}

onMounted(async () => {
  await load()

  timer = setInterval(refresh, 60_000)
  document.addEventListener('visibilitychange', onVisible)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>