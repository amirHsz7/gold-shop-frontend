<template>
  <div :class="['pb-28 lg:pb-12', SITE_GUTTER]">
    <div v-if="status === 'pending' && !product" class="py-20 text-center text-dark-brown/60">
      در حال بارگذاری...
    </div>

    <template v-else-if="product">
      <!-- مسیر صفحه -->
      <nav aria-label="مسیر صفحه" class="flex flex-wrap items-center gap-2 py-4 text-xs text-dark-brown/70 lg:py-6 lg:text-sm">
        <NuxtLink to="/">خانه</NuxtLink>
        <Icon name="lucide:chevron-left" size="14" />
        <template v-if="product.category.parent">
          <NuxtLink :to="`/products?category=${product.category.parent.slug}`">
            {{ product.category.parent.name }}
          </NuxtLink>
          <Icon name="lucide:chevron-left" size="14" />
        </template>
        <NuxtLink :to="`/products?category=${product.category.slug}`">
          {{ product.category.name }}
        </NuxtLink>
        <Icon name="lucide:chevron-left" size="14" />
        <span class="font-medium text-dark-brown">{{ product.name }}</span>
      </nav>

      <div class="grid gap-6 lg:grid-cols-2 lg:gap-14">
        <ProductGallery :images="product.images" :name="product.name">
          <template #badges>
            <span
              v-if="discount > 0"
              class="rounded-full bg-burgundy px-3 py-1 text-xs text-cream"
            >
              {{ toFa(discount) }}٪ تخفیف
            </span>
            <span
              v-if="!product.inStock"
              class="rounded-full bg-dark-brown px-3 py-1 text-xs text-cream"
            >
              ناموجود
            </span>
          </template>
        </ProductGallery>

        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-if="product.collection"
              :to="`/products?collection=${product.collection.slug}`"
              class="text-xs font-medium text-burgundy lg:text-sm"
            >
              کالکشن {{ product.collection.name }}
            </NuxtLink>

            <h1 class="text-2xl font-bold leading-relaxed text-dark-brown lg:text-4xl">
              {{ product.name }}
            </h1>

            <div class="flex items-center gap-3 text-xs text-dark-brown/70 lg:text-sm">
              <template v-if="product.rating.count > 0">
                <span class="flex items-center gap-1 font-medium text-dark-brown">
                  <Icon name="lucide:star" class="text-gold" size="16" />
                  {{ toFa(product.rating.average) }}
                </span>
                <span class="text-burgundy">{{ toFa(product.rating.count) }} نظر</span>
              </template>
              <span v-else>هنوز نظری ثبت نشده</span>
            </div>
          </div>

          <!-- قیمت -->
          <div class="flex flex-wrap items-baseline gap-3 border-y border-nude/20 py-4">
            <template v-if="selectedBreakdown">
              <span class="text-3xl font-bold text-burgundy">
                {{ formatToman(selectedBreakdown.final) }}
                <span class="text-sm font-normal">تومان</span>
              </span>
              <del v-if="selectedBreakdown.discount > 0" class="text-dark-brown/60">
                {{ formatToman(selectedBreakdown.original) }}
              </del>
            </template>
            <span v-else class="text-dark-brown/70">قیمت در حال به‌روزرسانی است</span>
          </div>

          <ProductWeightSelector
            v-if="weightItems.length > 0"
            v-model="selectedId"
            :items="weightItems"
          />

          <ProductPriceBreakdown
            v-if="selectedBreakdown && selectedVariant"
            :breakdown="selectedBreakdown"
            :weight="Number(selectedVariant.weight)"
          />

          <!-- خرید -->
          <!-- خرید -->
          <div
            class="fixed inset-x-0 bottom-15 z-30 flex items-center gap-3 border-t border-nude/30 bg-white px-4 py-2.5 shadow-[0_-6px_18px_rgba(48,37,34,.08)] lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
          >
            <div class="hidden items-center rounded-full border border-nude/40 bg-white lg:flex">
              <BaseBtn flat round color="dark-brown" aria-label="افزایش تعداد" :disable="quantity >= maxQuantity" @click="quantity++">
                <template #icon>
                  <Icon name="lucide:plus" size="18" />
                </template>
              </BaseBtn>
              <span class="min-w-8 text-center font-semibold">{{ toFa(quantity) }}</span>
              <BaseBtn flat round color="dark-brown" aria-label="کاهش تعداد" :disable="quantity <= 1" @click="quantity--">
                <template #icon>
                  <Icon name="lucide:minus" size="18" />
                </template>
              </BaseBtn>
            </div>

            <div v-if="selectedBreakdown" class="flex flex-col leading-snug lg:hidden">
              <span class="text-[11px] text-dark-brown/60">قیمت این وزن</span>
              <span class="font-bold text-burgundy">{{ formatToman(selectedBreakdown.final) }}</span>
            </div>

            <BaseBtn
              color="gold"
              round
              no-caps
              unelevated
              label="افزودن به سبد خرید"
              class="h-12 flex-1 lg:h-14"
              :disable="!canBuy"
              @click="addToCart"
            />

            <BaseBtn
              outline
              round
              color="burgundy"
              aria-label="افزودن به علاقه‌مندی‌ها"
              class="hidden size-14! lg:flex"
              @click="notifyInfo('علاقه‌مندی‌ها به‌زودی فعال می‌شود')"
            >
              <template #icon>
                <Icon name="lucide:heart" size="22" />
              </template>
            </BaseBtn>
          </div>

          <ul class="grid gap-3 text-sm sm:grid-cols-3">
            <li v-for="item in TRUST_ITEMS" :key="item.text" class="flex items-center gap-2">
              <Icon :name="item.icon" size="24" class="shrink-0 text-burgundy" />
              {{ item.text }}
            </li>
          </ul>
        </div>
      </div>

      <!-- توضیحات و مشخصات -->
      <section class="mt-12 lg:mt-16">
        <div class="flex gap-8 border-b border-nude/20">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="-mb-px border-b-[3px] px-1 py-3 text-sm lg:text-base"
            :class="activeTab === tab.key ? 'border-burgundy font-bold text-burgundy' : 'border-transparent text-dark-brown/60'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="pt-6">
          <p
            v-if="activeTab === 'description'"
            class="max-w-3xl whitespace-pre-line text-sm leading-loose lg:text-base"
          >
            {{ product.description || 'توضیحاتی برای این محصول ثبت نشده است.' }}
          </p>

          <dl v-else class="max-w-xl text-sm">
            <div v-for="row in specs" :key="row.label" class="flex justify-between border-b border-nude/20 py-3">
              <dt class="text-dark-brown/60">{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- نظرات: مرحله‌ی بعد -->
    </template>
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import type { PublicProduct } from '~/types/product'
import { calcVariantBreakdown } from '~/utils/pricing'


const { notify } = useToast()

const TRUST_ITEMS = [
  { icon: 'lucide:gem', text: 'ضمانت اصالت کالا و فاکتور رسمی' },
  { icon: 'lucide:truck', text: 'ارسال بیمه‌شده به سراسر کشور' },
  { icon: 'lucide:shield-check', text: 'پرداخت امن با درگاه بانکی' },
]

const route = useRoute()
const pricing = usePricingStore()

const slug = computed(() => String(route.params.slug))

const { data, status, error } = await useApiFetch<{ data: PublicProduct }>(
  () => `/products/${slug.value}`,
  { key: `product-${slug.value}` },
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode === 404 ? 404 : 500,
    statusMessage: error.value.statusCode === 404 ? 'محصول پیدا نشد' : 'خطا در دریافت محصول',
    fatal: true,
  })
}

const product = computed(() => data.value?.data ?? null)

const assetUrl = useAssetUrl()

useSeoMeta({
  title: () => product.value?.name ?? 'محصول',
  description: () => product.value?.description?.slice(0, 160) ?? '',
  ogImage: () => assetUrl(product.value?.images[0]?.url),
})

const toFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

const discount = computed(() => Number(product.value?.discountPercent ?? 0))

// ───── وزن‌ها ─────
const selectedId = ref<string | null>(null)

// پیش‌فرض: اولین وزن موجود
watch(
  product,
  (value) => {
    const first = value?.variants.find(variant => variant.stock > 0) ?? value?.variants[0]
    selectedId.value = first?.id ?? null
  },
  { immediate: true },
)

const selectedVariant = computed(
  () => product.value?.variants.find(variant => variant.id === selectedId.value) ?? null,
)

const breakdownOf = (variant: PublicProduct['variants'][number]) => {
  const gold = pricing.goldPricePerGram

  if (!gold || gold <= 0) return null

  return calcVariantBreakdown(variant, gold, discount.value, pricing.settings)
}

const weightItems = computed(() =>
  (product.value?.variants ?? []).map(variant => ({
    id: variant.id,
    weight: Number(variant.weight),
    stock: variant.stock,
    price: breakdownOf(variant)?.final ?? null,
  })),
)

const selectedBreakdown = computed(() =>
  selectedVariant.value ? breakdownOf(selectedVariant.value) : null,
)

// ───── خرید ─────
const quantity = ref(1)
const maxQuantity = computed(() => Math.max(selectedVariant.value?.stock ?? 1, 1))
const canBuy = computed(() => !!selectedVariant.value && selectedVariant.value.stock > 0)

watch(selectedId, () => {
  quantity.value = 1
})

const notifyInfo = (message: string) =>
  notify({ message, color: 'burgundy', textColor: 'white', position: 'top', timeout: 3000 })

// ماژول سبد خرید هنوز ساخته نشده است
const addToCart = () => notifyInfo('سبد خرید به‌زودی فعال می‌شود')

// ───── تب‌ها ─────
const tabs = [
  { key: 'description', label: 'توضیحات' },
  { key: 'specs', label: 'مشخصات' },
] as const

const activeTab = ref<(typeof tabs)[number]['key']>('description')

const specs = computed(() => {
  const value = product.value
  if (!value) return []

  const min = Number(value.minWeight)
  const max = Number(value.maxWeight)

  return [
    { label: 'دسته‌بندی', value: value.category.name },
    ...(value.collection ? [{ label: 'کالکشن', value: value.collection.name }] : []),
    {
      label: 'بازه‌ی وزن',
      value: min === max ? `${formatWeight(min)} گرم` : `${formatWeight(min)} تا ${formatWeight(max)} گرم`,
    },
  ]
})
</script>