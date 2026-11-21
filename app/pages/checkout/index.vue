<template>
  <div :class="['pb-16 pt-6 lg:pb-20', SITE_GUTTER]">
    <h1 class="mb-6 text-2xl font-bold text-burgundy lg:text-3xl">تسویه‌حساب</h1>

    <div v-if="loading" class="py-20 text-center text-dark-brown/60">
      در حال بارگذاری...
    </div>

    <div v-else class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <form
        aria-label="اطلاعات سفارش"
        class="flex min-w-0 flex-1 flex-col gap-5"
        novalidate
        @submit.prevent="submit"
      >
        <!-- گیرنده -->
        <section class="flex flex-col gap-4 rounded-2xl border border-nude/20 bg-white/50 p-5 lg:p-6">
          <h2 class="text-base font-bold text-burgundy">اطلاعات گیرنده</h2>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="rcv-name" class="text-[13px] text-dark-gray">نام و نام خانوادگی گیرنده</label>
              <input id="rcv-name" v-model="form.recipientName" type="text" :class="inputClass('recipientName')">
              <p v-if="errors.recipientName" class="text-xs text-burgundy">{{ errors.recipientName }}</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="rcv-mobile" class="text-[13px] text-dark-gray">شماره‌ی موبایل گیرنده</label>
              <input
                id="rcv-mobile"
                v-model="form.recipientMobile"
                type="text"
                inputmode="numeric"
                dir="ltr"
                maxlength="11"
                :class="[inputClass('recipientMobile'), 'text-right']"
              >
              <p v-if="errors.recipientMobile" class="text-xs text-burgundy">{{ errors.recipientMobile }}</p>
            </div>
          </div>

          <p class="text-xs leading-7 text-dark-gray">
            نام و موبایل از حساب شما پر شده‌اند. اگر سفارش را برای شخص دیگری می‌دهید، تغییرشان دهید.
          </p>
        </section>

        <!-- آدرس -->
        <section class="flex flex-col gap-4 rounded-2xl border border-nude/20 bg-white/50 p-5 lg:p-6">
          <h2 class="text-base font-bold text-burgundy">آدرس تحویل</h2>

          <fieldset class="min-w-0 border-0 p-0">
            <legend class="mb-2.5 p-0 text-[13px] text-dark-gray">آدرس‌های ذخیره‌شده‌ی شما</legend>

            <div class="grid gap-3 sm:grid-cols-2">
              <label
                v-for="item in addresses"
                :key="item.id"
                class="relative flex cursor-pointer items-start gap-3 rounded-2xl p-4"
                :class="
                  selectedId === item.id
                    ? 'border-2 border-burgundy bg-burgundy/5'
                    : 'border border-gray bg-white'
                "
              >
                <input
                  v-model="selectedId"
                  type="radio"
                  name="addr"
                  :value="item.id"
                  class="mt-1 size-4.5 shrink-0 accent-burgundy"
                  @change="fillFrom(item)"
                >
                <span class="flex min-w-0 flex-col items-start gap-2">
                  <span
                    class="rounded-full px-3 py-0.5 text-xs font-semibold"
                    :class="selectedId === item.id ? 'bg-burgundy text-cream' : 'bg-nude/20 text-dark-brown'"
                  >
                    {{ item.title }}
                  </span>
                  <span class="text-[13px] leading-7">
                    {{ item.province }}، {{ item.city }}، {{ item.address }}
                  </span>
                  <span class="text-xs text-dark-gray">کد پستی: {{ toFaNumber(item.postalCode) }}</span>
                </span>

                <button
                  type="button"
                  class="absolute left-2 top-2 flex size-9 items-center justify-center rounded-lg text-dark-gray hover:bg-cream"
                  :aria-label="`حذف آدرس ${item.title}`"
                  @click.prevent="removeAddress(item)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </label>

              <button
                type="button"
                class="flex min-h-24 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-nude p-4 text-sm font-medium text-burgundy"
                @click="startNew"
              >
                <Icon name="lucide:plus" size="18" />
                افزودن آدرس جدید
              </button>
            </div>
          </fieldset>

          <div class="h-px bg-gray" />

          <div class="flex flex-col gap-1">
            <h3 class="text-sm font-semibold">اطلاعات آدرس</h3>
            <p class="text-xs leading-7 text-dark-gray">
              با انتخاب هر آدرس ذخیره‌شده، فیلدهای زیر خودکار پر می‌شوند و می‌توانید تغییرشان دهید.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="ad-province" class="text-[13px] text-dark-gray">استان</label>
              <select id="ad-province" v-model="form.province" :class="inputClass('province')">
                <option v-for="province in IRAN_PROVINCES" :key="province" :value="province">
                  {{ province }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="ad-city" class="text-[13px] text-dark-gray">شهر</label>
              <select id="ad-city" v-model="form.city" :class="inputClass('city')">
                <option value="" disabled>انتخاب شهر</option>
                <option v-for="city in cityOptions" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
              <p v-if="errors.city" class="text-xs text-burgundy">{{ errors.city }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="ad-full" class="text-[13px] text-dark-gray">آدرس کامل</label>
            <textarea
              id="ad-full"
              v-model="form.address"
              rows="3"
              class="resize-y rounded-[10px] border bg-white px-3.5 py-3 text-sm leading-8 outline-none focus:border-burgundy"
              :class="errors.address ? 'border-burgundy' : 'border-gray'"
            />
            <p v-if="errors.address" class="text-xs text-burgundy">{{ errors.address }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="ad-postal" class="text-[13px] text-dark-gray">کد پستی (۱۰ رقم)</label>
              <input
                id="ad-postal"
                v-model="form.postalCode"
                type="text"
                inputmode="numeric"
                dir="ltr"
                maxlength="10"
                :class="[inputClass('postalCode'), 'text-right']"
              >
              <p v-if="errors.postalCode" class="text-xs text-burgundy">{{ errors.postalCode }}</p>
            </div>
          </div>

          <fieldset class="flex min-w-0 flex-col gap-2.5 border-0 p-0">
            <legend class="mb-2.5 p-0 text-[13px] text-dark-gray">عنوان آدرس</legend>

            <div class="flex flex-wrap gap-2">
              <label
                v-for="option in TITLE_OPTIONS"
                :key="option.value"
                class="flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm"
                :class="
                  form.titleChoice === option.value
                    ? 'border-2 border-burgundy bg-burgundy/5 font-semibold text-burgundy'
                    : 'border border-gray bg-white'
                "
              >
                <input
                  v-model="form.titleChoice"
                  type="radio"
                  name="atitle"
                  :value="option.value"
                  class="size-4 accent-burgundy"
                >
                {{ option.label }}
              </label>
            </div>

            <div v-if="form.titleChoice === 'custom'" class="flex max-w-90 flex-col gap-1.5">
              <label for="ad-title-custom" class="text-xs text-dark-gray">عنوان را بنویسید</label>
              <input
                id="ad-title-custom"
                v-model="form.customTitle"
                type="text"
                maxlength="50"
                placeholder="مثلاً خانه‌ی مادربزرگ"
                :class="inputClass('title')"
              >
              <p v-if="errors.title" class="text-xs text-burgundy">{{ errors.title }}</p>
            </div>
          </fieldset>

          <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
            <input v-model="form.save" type="checkbox" class="size-4.5 accent-gold">
            ذخیره‌ی این آدرس (و تغییرات آن) در آدرس‌های من
          </label>
        </section>

        <!-- ارسال -->
        <section class="flex flex-col gap-4 rounded-2xl border border-nude/20 bg-white/50 p-5 lg:p-6">
          <h2 class="text-base font-bold text-burgundy">روش ارسال</h2>

          <div class="flex items-center gap-3 rounded-2xl border-2 border-burgundy bg-burgundy/5 p-4">
            <span class="flex grow flex-col gap-0.5">
              <span class="text-sm font-semibold">ارسال به آدرس انتخاب‌شده</span>
              <span v-if="summary?.freeShipping" class="text-xs text-[#2F5D3A]">
                ارسال این سفارش رایگان است.
              </span>
              <span
                v-else-if="summary?.freeShippingMinWeight != null"
                class="text-xs text-dark-gray"
              >
                ارسال سفارش‌های {{ formatWeight(summary.freeShippingMinWeight) }} گرم به بالا رایگان است.
              </span>
            </span>

            <span v-if="summary?.freeShipping" class="text-sm font-semibold text-[#2F5D3A]">رایگان</span>
            <span v-else class="text-sm font-semibold">
              {{ formatToman(summary?.shippingCost ?? 0) }} تومان
            </span>
          </div>
        </section>
      </form>

      <!-- خلاصه -->
      <aside
        v-if="summary"
        aria-label="خلاصه‌ی سفارش"
        class="flex flex-col gap-4 rounded-2xl border border-nude/20 bg-white p-6 lg:sticky lg:top-24 lg:w-100 lg:shrink-0"
      >
        <h2 class="text-base font-bold text-burgundy">خلاصه‌ی سفارش</h2>

        <ul class="flex flex-col gap-3">
          <li v-for="item in payableItems" :key="item.variantId" class="flex items-center gap-3">
            <span class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-nude/10">
              <img
                v-if="item.imageUrl"
                :src="assetUrl(item.imageUrl)"
                :alt="item.imageAlt ?? item.name"
                class="size-full object-cover"
                loading="lazy"
              >
              <Icon v-else name="lucide:gem" size="24" class="text-nude" />
            </span>
            <span class="flex min-w-0 grow flex-col gap-0.5">
              <span class="text-[13px] font-medium">{{ item.name }}</span>
              <span class="text-xs text-dark-gray">
                {{ formatWeight(item.weight) }} گرم · تعداد {{ toFaNumber(item.effectiveQuantity) }}
              </span>
            </span>
            <span class="text-[13px] font-semibold">{{ formatToman(item.lineTotal ?? 0) }}</span>
          </li>
        </ul>

        <div class="h-px bg-gray" />

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

        <BaseBtn
          color="burgundy"
          no-caps
          unelevated
          label="پرداخت و ثبت سفارش"
          class="h-13 rounded-xl text-[15px] font-semibold"
          :loading="paying"
          @click="submit"
        />

        <p class="flex items-start gap-2 text-xs leading-6 text-dark-gray">
          <Icon name="lucide:info" size="16" class="mt-1 shrink-0" />
          با کلیک روی پرداخت، قیمت نهایی بررسی و ثابت می‌شود و به درگاه بانکی منتقل می‌شوید.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import { toEnNumber, toFaNumber } from '~/utils/formatNumber'
import { IRAN_PROVINCES, citiesOf } from '~/utils/iran-geo'

definePageMeta({ middleware: 'auth' })

usePageSeo({ title: 'تسویه‌حساب', noindex: true })

type SavedAddress = {
  id: string
  title: string
  province: string
  city: string
  address: string
  postalCode: string
}

const TITLE_OPTIONS = [
  { value: 'خانه', label: 'خانه' },
  { value: 'محل کار', label: 'محل کار' },
  { value: 'custom', label: 'عنوان دلخواه' },
]

const { $api } = useNuxtApp()
const cartStore = useCartStore()
const userStore = useUserStore()
const assetUrl = useAssetUrl()
const { notify } = useToast()
const { getMessage, getStatus } = useApiError()

const loading = ref(true)
const paying = ref(false)

const addresses = ref<SavedAddress[]>([])
// شناسه‌ی آدرس انتخاب‌شده، یا 'new' برای آدرس جدید
const selectedId = ref<string>('new')

const form = reactive({
  recipientName: '',
  recipientMobile: '',
  province: 'تهران' as string,
  city: '',
  address: '',
  postalCode: '',
  titleChoice: 'خانه',
  customTitle: '',
  save: true,
})

const errors = reactive<Record<string, string>>({})

const cityOptions = computed(() => citiesOf(form.province))

// با عوض شدن استان، شهرِ نامربوط پاک می‌شود
watch(() => form.province, () => {
  if (!cityOptions.value.includes(form.city)) form.city = ''
})

const summary = computed(() => cartStore.cart?.summary ?? null)
const payableItems = computed(() =>
  cartStore.items.filter(item => item.effectiveQuantity > 0),
)
const totalQuantity = computed(() =>
  payableItems.value.reduce((sum, item) => sum + item.effectiveQuantity, 0),
)

const inputClass = (field: string) => [
  'h-12 rounded-[10px] border bg-white px-3.5 text-sm outline-none focus:border-burgundy',
  errors[field] ? 'border-burgundy' : 'border-gray',
]

// ارقام فارسی را انگلیسی می‌کند و فقط رقم نگه می‌دارد
watch(() => form.recipientMobile, (value) => {
  const clean = toEnNumber(value).replace(/\D/g, '').slice(0, 11)
  if (clean !== value) form.recipientMobile = clean
})

watch(() => form.postalCode, (value) => {
  const clean = toEnNumber(value).replace(/\D/g, '').slice(0, 10)
  if (clean !== value) form.postalCode = clean
})

const resolvedTitle = () =>
  form.titleChoice === 'custom' ? form.customTitle.trim() : form.titleChoice

function fillFrom(item: SavedAddress) {
  form.province = item.province
  form.city = item.city
  form.address = item.address
  form.postalCode = item.postalCode

  if (item.title === 'خانه' || item.title === 'محل کار') {
    form.titleChoice = item.title
    form.customTitle = ''
  }
  else {
    form.titleChoice = 'custom'
    form.customTitle = item.title
  }

  form.save = true
  Object.keys(errors).forEach(key => delete errors[key])
}

function startNew() {
  selectedId.value = 'new'
  form.city = ''
  form.address = ''
  form.postalCode = ''
  form.titleChoice = addresses.value.length === 0 ? 'خانه' : 'محل کار'
  form.customTitle = ''
  form.save = true
}

function validate() {
  Object.keys(errors).forEach(key => delete errors[key])

  if (form.recipientName.trim().length < 3) {
    errors.recipientName = 'نام گیرنده را وارد کنید (حداقل ۳ حرف)'
  }
  if (!/^09\d{9}$/.test(form.recipientMobile)) {
    errors.recipientMobile = 'شماره‌ی موبایل باید ۱۱ رقم و با ۰۹ شروع شود'
  }
  if (!form.city) {
    errors.city = 'شهر را انتخاب کنید'
  }
  if (form.address.trim().length < 10) {
    errors.address = 'آدرس کامل باید حداقل ۱۰ کاراکتر باشد'
  }
  if (!/^[1-9]\d{9}$/.test(form.postalCode)) {
    errors.postalCode = 'کد پستی باید ۱۰ رقم باشد'
  }
  if (form.titleChoice === 'custom' && form.customTitle.trim().length === 0) {
    errors.title = 'عنوان آدرس را بنویسید'
  }

  return Object.keys(errors).length === 0
}

const showError = (error: unknown, fallback: string) =>
  notify({
    message: getMessage(error, fallback),
    color: 'burgundy',
    textColor: 'white',
    position: 'top',
    timeout: 4000,
  })

async function removeAddress(item: SavedAddress) {
  if (!window.confirm(`آدرس «${item.title}» حذف شود؟`)) return

  try {
    await $api(`/addresses/${item.id}`, { method: 'DELETE' })
    addresses.value = addresses.value.filter(address => address.id !== item.id)

    if (selectedId.value === item.id) startNew()
  }
  catch (error) {
    showError(error, 'حذف آدرس انجام نشد')
  }
}

// آدرس را (اگر کاربر خواسته) ذخیره یا ویرایش می‌کند
async function persistAddress() {
  if (!form.save) return

  const body = {
    title: resolvedTitle(),
    province: form.province,
    city: form.city,
    address: form.address.trim(),
    postalCode: form.postalCode,
  }

  if (selectedId.value === 'new') {
    const res = await $api<{ data: SavedAddress }>('/addresses', { method: 'POST', body })
    addresses.value = [res.data, ...addresses.value]
    selectedId.value = res.data.id
    return
  }

  const current = addresses.value.find(address => address.id === selectedId.value)
  const changed = !current
    || (Object.keys(body) as (keyof typeof body)[]).some(key => current[key] !== body[key])

  if (!changed) return

  const res = await $api<{ data: SavedAddress }>(`/addresses/${selectedId.value}`, {
    method: 'PATCH',
    body,
  })
  addresses.value = addresses.value.map(address =>
    address.id === res.data.id ? res.data : address,
  )
}

async function submit() {
  if (paying.value) return

  if (!validate()) {
    notify({
      message: 'اطلاعات واردشده را بررسی کنید',
      color: 'burgundy',
      textColor: 'white',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  paying.value = true

  try {
    await persistAddress()

    // ثبت سفارش و انتقال به درگاه در مرحله‌ی بعد اضافه می‌شود
    notify({
      message: 'آدرس ذخیره شد. پرداخت در مرحله‌ی بعد فعال می‌شود',
      color: 'green',
      textColor: 'white',
      position: 'top',
      timeout: 3500,
    })
  }
  catch (error) {
    showError(error, 'ذخیره‌ی آدرس انجام نشد')
  }
  finally {
    paying.value = false
  }
}

onMounted(async () => {
  try {
    if (!userStore.user?.fullName) {
      await userStore.fetchUser()
    }

    const [, addressRes] = await Promise.all([
      cartStore.fetchCart(),
      $api<{ data: SavedAddress[] }>('/addresses'),
    ])

    // سبد خالی یا دارای مشکل (ناموجود) اجازه‌ی تسویه ندارد
    if (cartStore.isEmpty || cartStore.cart?.hasIssues || !cartStore.cart?.summary) {
      await navigateTo('/cart')
      return
    }

    addresses.value = addressRes.data
    form.recipientName = userStore.user?.fullName ?? ''
    form.recipientMobile = userStore.user?.mobile ?? ''

    const first = addresses.value[0]
    if (first) {
      selectedId.value = first.id
      fillFrom(first)
    }
    else {
      startNew()
    }
  }
  catch (error) {
    if (getStatus(error) === 401) {
      userStore.logout()
      await navigateTo('/login')
      return
    }
    showError(error, 'دریافت اطلاعات انجام نشد')
  }
  finally {
    loading.value = false
  }
})
</script>