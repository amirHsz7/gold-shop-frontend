<template>
  <section
    v-if="loading || products.length > 0"
    class="py-8 lg:py-12"
    :class="SITE_GUTTER"
    dir="rtl"
    :aria-labelledby="titleId"
  >
    <SiteSectionHeader
      :id="titleId"
      :title="title"
      :subtitle="subtitle"
      :to="viewAllTo"
      :link-label="viewAllLabel"
    />

    <div class="relative">
      <!-- مسیر اسلاید: ۲ ستون در موبایل و ۴ ستون در دسکتاپ؛ فاصله‌ها (۰٫۷۵ و ۱٫۲۵ رم) در محاسبه‌ی عرض لحاظ شده -->
      <div
        ref="trackRef"
        role="group"
        aria-roledescription="carousel"
        :aria-label="title"
        class="grid snap-x snap-mandatory auto-cols-[calc((100%_-_0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto pb-4 [scrollbar-width:none] lg:auto-cols-[calc((100%_-_3.75rem)/4)] lg:gap-5 xl:auto-cols-[calc((100%_-_5rem)/5)] 2xl:auto-cols-[calc((100%_-_6.25rem)/6)] [&::-webkit-scrollbar]:hidden"        @scroll.passive="updateState"
      >
        <!-- حالت بارگذاری -->
        <template v-if="loading">
          <div
            v-for="n in 6"
            :key="n"
            class="animate-pulse"
            :class="{ 'hidden xl:block': n === 5, 'hidden 2xl:block': n === 6 }"
            aria-hidden="true"
          >
            <div class="aspect-square rounded-2xl bg-nude/15" />
            <div class="mx-auto mt-3 h-3 w-2/3 rounded bg-nude/15" />
            <div class="mx-auto mt-2 h-3 w-1/2 rounded bg-nude/15" />
          </div>
        </template>

        <template v-else>
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="snap-start"
          >
            <SiteProductCard
              :product="product"
              :wishlist="wishlist"
              :priority="index < eagerCount"
              :preload-hover="index < eagerCount"
              class="h-full"
            />
          </div>
        </template>
      </div>

      <!-- فلش‌ها (فقط دسکتاپ). در راست‌به‌چپ «قبلی» سمت راست است -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="canPrev"
          class="absolute start-2 top-[38%] z-10 hidden -translate-y-1/2 lg:block"
        >
          <BaseBtn
            round
            size="md"
            color="white"
            class="shadow-md"
            aria-label="محصولات قبلی"
            @click="scrollPage(-1)"
          >
            <template #icon>
              <Icon name="lucide:chevron-right" size="22px" />
            </template>
          </BaseBtn>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="canNext"
          class="absolute end-2 top-[38%] z-10 hidden -translate-y-1/2 lg:block"
        >
          <BaseBtn
            round
            size="md"
            color="white"
            class="shadow-md"
            aria-label="محصولات بعدی"
            @click="scrollPage(1)"
          >
            <template #icon>
              <Icon name="lucide:chevron-left" size="22px" />
            </template>
          </BaseBtn>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { PublicProduct } from '~/types/product'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string | null
    products: PublicProduct[]
    viewAllTo?: RouteLocationRaw
    viewAllLabel?: string
    loading?: boolean
    wishlist?: boolean
    // تعداد کارت‌های ابتدایی که زود بارگذاری می‌شوند (برای اسلایدرهای پایین‌تر صفر بگذار)
    eagerCount?: number
  }>(),
  {
    viewAllLabel: 'مشاهده همه',
    loading: false,
    wishlist: true,
    eagerCount: 4,
  },
)

const EDGE_TOLERANCE = 4

const titleId = useId()
const trackRef = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)

// در راست‌به‌چپ مقدار scrollLeft منفی است، پس قدر مطلق آن ملاک است
const updateState = () => {
  const track = trackRef.value

  if (!track) return

  const offset = Math.abs(track.scrollLeft)

  canPrev.value = offset > EDGE_TOLERANCE
  canNext.value
    = offset + track.clientWidth < track.scrollWidth - EDGE_TOLERANCE
}

// جلو (1) یعنی به‌سمت انتهای لیست؛ در راست‌به‌چپ این یعنی حرکت به چپ
const scrollPage = (direction: 1 | -1) => {
  const track = trackRef.value

  if (!track) return

  const sign = getComputedStyle(track).direction === 'rtl' ? -1 : 1
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  track.scrollBy({
    left: sign * direction * track.clientWidth,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}

let observer: ResizeObserver | undefined

onMounted(() => {
  updateState()

  if (trackRef.value) {
    observer = new ResizeObserver(updateState)
    observer.observe(trackRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(
  () => [props.products, props.loading],
  () => nextTick(updateState),
)
</script>