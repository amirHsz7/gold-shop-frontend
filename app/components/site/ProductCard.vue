<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-nude/20 bg-white/50 transition-shadow focus-within:shadow-lg hover:shadow-lg"
    dir="rtl"
    @pointerenter="onPointerEnter"
  >
    <!-- تصویر -->
    <div class="relative aspect-square overflow-hidden bg-nude/10">
      <!-- هر دو لایه با هم زوم می‌شوند -->
      <div
        class="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        :class="{ 'opacity-60 grayscale': !product.inStock }"
      >
        <BaseImg
          v-if="imageUrl"
          :src="imageUrl"
          :alt="imageAlt"
          fit="cover"
          no-spinner
          :native-loading="priority ? 'eager' : 'lazy'"
          class="h-full w-full"
        >
          <template #error>
            <Icon name="lucide:gem" size="36px" class="text-nude" />
          </template>
        </BaseImg>

        <div
          v-else
          class="flex h-full w-full items-center justify-center text-nude"
          aria-hidden="true"
        >
          <Icon name="lucide:gem" size="40px" />
        </div>

        <!-- عکس دوم؛ فقط بعد از اولین هاور ساخته و دانلود می‌شود -->
        <div
          v-if="hoverImageUrl && hoverRequested"
          class="absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <BaseImg
            :src="hoverImageUrl"
            alt=""
            fit="cover"
            no-spinner
            native-loading="eager"
            class="h-full w-full"
          />
        </div>
      </div>

      <!-- برچسب -->
      <span
        v-if="badge"
        class="absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-medium"
        :class="badge.class"
      >
        {{ badge.label }}
      </span>

      <!-- علاقه‌مندی -->
      <BaseBtn
        v-if="wishlist"
        flat
        round
        size="sm"
        :color="favorite ? 'burgundy' : 'dark-brown'"
        class="!absolute end-2 top-2 z-10 !bg-white/70 backdrop-blur"
        :aria-label="favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'"
        :aria-pressed="favorite"
        @click="emit('toggleFavorite', product.id)"
      >
        <template #icon>
          <Icon name="lucide:heart" size="19px" />
        </template>
      </BaseBtn>
    </div>

    <!-- اطلاعات -->
    <div class="flex flex-1 flex-col items-center gap-2 px-3 pb-4 pt-3 text-center">
      <h3 class="m-0 w-full text-sm font-medium text-dark-brown">
        <!-- لینک کل کارت را می‌پوشاند (after) بدون اینکه دکمه‌ی قلب داخل لینک باشد -->
        <NuxtLink
          :to="`/products/${product.slug}`"
          class="line-clamp-1 after:absolute after:inset-0"
          :title="product.name"
        >
          {{ product.name }}
        </NuxtLink>
      </h3>

      <div class="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
        <template v-if="price">
          <span class="text-sm font-semibold text-burgundy">
            <span v-if="price.isFrom" class="text-xs font-normal">از </span>
            {{ formatToman(price.final) }}
            <span class="text-xs font-normal">تومان</span>
          </span>

          <del
            v-if="hasOriginalPrice"
            class="text-xs text-dark-gray/70"
          >
            {{ formatToman(price.original ?? 0) }}
          </del>
        </template>

        <!-- بدون قیمت طلا، وزن نمایش داده می‌شود -->
        <span v-else-if="weightText" class="text-sm text-dark-gray">
          {{ weightText }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { ProductPrice, PublicProduct } from '~/types/product'

const NEW_PRODUCT_DAYS = 14

const props = withDefaults(
  defineProps<{
    product: PublicProduct
    // نمایش دکمه‌ی علاقه‌مندی (بعد از ساخت ماژول علاقه‌مندی روشن شود)
    wishlist?: boolean
    favorite?: boolean
    // برای کارت‌های بالای صفحه که باید بلافاصله بارگذاری شوند
    priority?: boolean
    // عکس دوم را بعد از نمایش کارت می‌گیرد، تا اولین هاور بدون تأخیر باشد
    preloadHover?: boolean
  }>(),
  { wishlist: false, favorite: false, priority: false, preloadHover: false },
)

const emit = defineEmits<{ toggleFavorite: [productId: string] }>()

const assetUrl = useAssetUrl()
const pricing = usePricingStore()

const imageUrl = computed(() => assetUrl(props.product.images[0]?.url))

const imageAlt = computed(
  () => props.product.images[0]?.alt || props.product.name,
)

// عکس دوم؛ اگر وجود نداشت یا با عکس اول یکی بود، خالی است
const hoverImageUrl = computed(() => {
  const second = props.product.images[1]

  if (!second) return ''

  const url = assetUrl(second.url)

  return url === imageUrl.value ? '' : url
})

// بعد از اولین هاور با ماوس (یا preloadHover) true می‌شود و عکس دوم ساخته می‌شود
const hoverRequested = ref(false)

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') hoverRequested.value = true
}

onMounted(() => {
  if (props.preloadHover) hoverRequested.value = true
})

// اگر API قیمت داده باشد همان، وگرنه از روی قیمت طلای store حساب می‌شود
const price = computed<ProductPrice | null>(
  () => props.product.price ?? pricing.priceOf(props.product),
)

const discount = computed(() => Number(props.product.discountPercent) || 0)

const isNew = computed(() => {
  const created = new Date(props.product.createdAt).getTime()

  if (Number.isNaN(created)) return false

  return Date.now() - created < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
})

// فقط یک برچسب نمایش داده می‌شود
const badge = computed(() => {
  if (!props.product.inStock) {
    return { label: 'ناموجود', class: 'bg-dark-brown/70 text-white' }
  }

  if (discount.value > 0) {
    return { label: 'تخفیف ویژه', class: 'bg-burgundy text-cream' }
  }

  if (props.product.isFeatured) {
    return { label: 'ویژه', class: 'bg-burgundy text-cream' }
  }

  if (isNew.value) {
    return { label: 'جدید', class: 'bg-burgundy text-cream' }
  }

  return null
})

const hasOriginalPrice = computed(() => {
  const current = price.value

  return !!current?.original && current.original > current.final
})

const weightText = computed(() => {
  const min = Number(props.product.minWeight)
  const max = Number(props.product.maxWeight)

  if (!(max > 0)) return ''

  return min === max
    ? `${formatWeight(max)} گرم`
    : `${formatWeight(min)} تا ${formatWeight(max)} گرم`
})
</script>