<template>
  <div class="flex flex-col" dir="rtl">
    <!-- دسته‌بندی -->
    <ProductsFilterSection title="دسته‌بندی" default-open :active="!!filters.category">
      <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
        <li>
          <NuxtLink
            :to="locationFor({ category: null })"
            :class="itemClass(!filters.category)"
            :aria-current="!filters.category ? 'true' : undefined"
            @click="emit('navigate')"
          >
            <ProductsFilterThumb icon="lucide:layout-grid" />
            <span class="min-w-0 flex-1 truncate">همه‌ی دسته‌ها</span>
          </NuxtLink>
        </li>

        <li v-for="root in categories" :key="root.id">
          <NuxtLink
            :to="locationFor({ category: root.slug })"
            :class="itemClass(filters.category === root.slug || hasActiveChild(root))"
            :aria-current="filters.category === root.slug ? 'true' : undefined"
            @click="emit('navigate')"
          >
            <ProductsFilterThumb :src="root.imageUrl" />
            <span class="min-w-0 flex-1 truncate">{{ root.name }}</span>
            <span class="text-xs font-normal text-dark-gray/70">
              {{ toFaNumber(root.totalProductCount) }}
            </span>
          </NuxtLink>

          <!-- زیردسته‌ها فقط وقتی دسته یا یکی از زیردسته‌هایش انتخاب شده -->
          <ul
            v-if="isOpen(root)"
            class="me-4 mt-0.5 flex list-none flex-col gap-0.5 border-s border-nude/30 p-0 ps-2"
          >
            <li v-for="child in root.children" :key="child.id">
              <NuxtLink
                :to="locationFor({ category: child.slug })"
                :class="itemClass(filters.category === child.slug)"
                :aria-current="filters.category === child.slug ? 'true' : undefined"
                @click="emit('navigate')"
              >
                <ProductsFilterThumb :src="child.imageUrl" size="sm" />
                <span class="min-w-0 flex-1 truncate">{{ child.name }}</span>
                <span class="text-xs font-normal text-dark-gray/70">
                  {{ toFaNumber(child.productCount) }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </ProductsFilterSection>

    <!-- کالکشن -->
    <ProductsFilterSection
      v-if="collections.length > 0"
      title="کالکشن"
      :default-open="!!filters.collection"
      :active="!!filters.collection"
    >
      <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
        <li>
          <NuxtLink
            :to="locationFor({ collection: null })"
            :class="itemClass(!filters.collection)"
            :aria-current="!filters.collection ? 'true' : undefined"
            @click="emit('navigate')"
          >
            <ProductsFilterThumb icon="lucide:layers" />
            <span class="min-w-0 flex-1 truncate">همه‌ی کالکشن‌ها</span>
          </NuxtLink>
        </li>

        <li v-for="item in collections" :key="item.id">
          <NuxtLink
            :to="locationFor({ collection: item.slug })"
            :class="itemClass(filters.collection === item.slug)"
            :aria-current="filters.collection === item.slug ? 'true' : undefined"
            @click="emit('navigate')"
          >
            <ProductsFilterThumb :src="item.imageUrl" icon="lucide:layers" />
            <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
            <span class="text-xs font-normal text-dark-gray/70">
              {{ toFaNumber(item.productCount) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </ProductsFilterSection>

    <!-- بازه‌ی قیمت: اسلایدر دوسر -->
    <ProductsFilterSection
      v-if="priceBounds"
      title="بازه‌ی قیمت (تومان)"
      default-open
      :active="filters.minPrice !== null || filters.maxPrice !== null"
    >
      <p class="mb-2 mt-0 text-xs text-dark-gray" aria-live="polite">
        {{ formatToman(priceDraft[0]) }} تا {{ formatToman(priceDraft[1]) }}
      </p>

      <BaseRangeSlider
        :model-value="priceDraft"
        :min="priceBounds.min"
        :max="priceBounds.max"
        :step="priceStep"
        min-label="حداقل قیمت"
        max-label="حداکثر قیمت"
        @update:model-value="priceDraft = $event"
        @change="commitPrice"
      />

      <div class="mt-0.5 flex justify-between px-1 text-xs text-dark-gray/70">
        <span>{{ formatToman(priceBounds.min) }}</span>
        <span>{{ formatToman(priceBounds.max) }}</span>
      </div>
    </ProductsFilterSection>

    <!-- بازه‌ی وزن: اسلایدر دوسر -->
    <ProductsFilterSection
      v-if="weightBounds"
      title="بازه‌ی وزن (گرم)"
      default-open
      :active="filters.minWeight !== null || filters.maxWeight !== null"
    >
      <p class="mb-2 mt-0 text-xs text-dark-gray" aria-live="polite">
        {{ formatWeight(weightDraft[0]) }} تا {{ formatWeight(weightDraft[1]) }}
      </p>

      <BaseRangeSlider
        :model-value="weightDraft"
        :min="weightBounds.min"
        :max="weightBounds.max"
        :step="WEIGHT_STEP"
        min-label="حداقل وزن"
        max-label="حداکثر وزن"
        @update:model-value="weightDraft = $event"
        @change="commitWeight"
      />

      <div class="mt-0.5 flex justify-between px-1 text-xs text-dark-gray/70">
        <span>{{ formatWeight(weightBounds.min) }}</span>
        <span>{{ formatWeight(weightBounds.max) }}</span>
      </div>
    </ProductsFilterSection>

    <!-- گزینه‌ها -->
    <section
      class="flex flex-col pt-3"
      :class="touch ? 'gap-1' : 'gap-3'"
      aria-label="گزینه‌های بیشتر"
    >
      <BaseCheckbox
        :class="touch ? 'min-h-11 !flex items-center' : ''"
        :model-value="filters.inStock"
        label="فقط کالاهای موجود"
        color="#D6B36A"
        size="md"
        @update:model-value="emit('update', { inStock: !!$event })"
      />

      <BaseCheckbox
        :class="touch ? 'min-h-11 !flex items-center' : ''"
        :model-value="filters.hasDiscount"
        label="فقط تخفیف‌دار"
        color="#D6B36A"
        size="md"
        @update:model-value="emit('update', { hasDiscount: !!$event })"
      />
    </section>

    <BaseBtn
      v-if="!hideClear && filterCount > 0"
      class="mt-4"
      outline
      no-caps
      color="gray"
      text-color="black"
      label="پاک کردن همه‌ی فیلترها"
      @click="emit('reset')"
    />
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import BaseCheckbox from '~/components/base/inputs/BaseCheckbox.vue'
import BaseRangeSlider from '~/components/base/range-slider/BaseRangeSlider.vue'
import type { ProductFilters } from '~/composables/useProductsQuery'
import type { PublicCategory, PublicCollection } from '~/types/site'
import { toFaNumber } from '~/utils/formatNumber'

const WEIGHT_STEP = 0.5

const props = withDefaults(
  defineProps<{
    filters: ProductFilters
    categories: PublicCategory[]
    collections: PublicCollection[]
    filterCount: number
    locationFor: (patch?: Partial<ProductFilters>) => RouteLocationRaw
    // کمترین و بیشترین وزن (گرم) برای ریل اسلایدر؛ اگر نیامد بخش وزن نمایش داده نمی‌شود
    weightRange?: { min: number, max: number } | null
    // کمترین و بیشترین قیمت (تومان) برای ریل اسلایدر؛ اگر نیامد بخش قیمت نمایش داده نمی‌شود
    priceRange?: { min: number, max: number } | null
    // ردیف‌های بزرگ‌تر برای لمس (کشوی موبایل)
    touch?: boolean
    // دکمه‌ی «پاک کردن» داخل لیست نشان داده نشود (کشوی موبایل دکمه‌ی خودش را دارد)
    hideClear?: boolean
  }>(),
  { weightRange: null, priceRange: null, touch: false, hideClear: false },
)

const emit = defineEmits<{
  update: [patch: Partial<ProductFilters>]
  reset: []
  // برای بستن کشوی موبایل بعد از کلیک روی لینک
  navigate: []
}>()

const itemClass = (active: boolean) => [
  'flex items-center gap-2 rounded-lg px-2 text-sm transition-colors',
  props.touch ? 'min-h-12 py-1' : 'py-1',
  active
    ? 'bg-burgundy/10 font-semibold text-burgundy'
    : 'text-dark-brown hover:bg-nude/10',
]

const hasActiveChild = (root: PublicCategory) =>
  root.children.some(child => child.slug === props.filters.category)

const isOpen = (root: PublicCategory) =>
  root.children.length > 0
  && (props.filters.category === root.slug || hasActiveChild(root))

// ───── قیمت (اسلایدر) ─────
// گام را از اندازه‌ی بازه حدس می‌زنیم (حدود ۱۰۰ گام، به شکل ۱، ۲ یا ۵ در توان ده)، حداقل ۱٬۰۰۰ تومان
const niceStep = (span: number) => {
  const raw = Math.max(span / 100, 1000)
  const power = 10 ** Math.floor(Math.log10(raw))
  const unit = raw / power

  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power
}

const priceStep = computed(() => {
  const range = props.priceRange

  return range ? niceStep(range.max - range.min) : 1000
})

// ریل به مضرب گام گرد می‌شود تا دستگیره‌ها دقیقاً به ابتدا و انتها برسند
const priceBounds = computed(() => {
  const range = props.priceRange

  if (!range) return null

  const step = priceStep.value
  const min = Math.floor(range.min / step) * step
  const max = Math.ceil(range.max / step) * step

  return max > min ? { min, max } : null
})

const priceFromFilters = (): [number, number] => {
  const bounds = priceBounds.value

  if (!bounds) return [0, 0]

  const clamp = (value: number) => Math.min(Math.max(value, bounds.min), bounds.max)

  return [
    clamp(props.filters.minPrice ?? bounds.min),
    clamp(props.filters.maxPrice ?? bounds.max),
  ]
}

const priceDraft = ref<[number, number]>(priceFromFilters())

// آدرس یا ریل عوض شد (برگشت، پاک کردن فیلتر، ...)
watch(
  () => [props.filters.minPrice, props.filters.maxPrice, priceBounds.value],
  () => {
    priceDraft.value = priceFromFilters()
  },
)

// بعد از رها کردن دستگیره؛ اگر روی ابتدا یا انتهای ریل است یعنی فیلتر نیست
const commitPrice = ([low, high]: [number, number]) => {
  const bounds = priceBounds.value

  if (!bounds) return

  emit('update', {
    minPrice: low <= bounds.min ? null : low,
    maxPrice: high >= bounds.max ? null : high,
  })
}

// ───── وزن (اسلایدر) ─────
const weightBounds = computed(() => {
  const range = props.weightRange

  if (!range) return null

  const min = Math.floor(range.min / WEIGHT_STEP) * WEIGHT_STEP
  const max = Math.ceil(range.max / WEIGHT_STEP) * WEIGHT_STEP

  return max > min ? { min, max } : null
})

const weightFromFilters = (): [number, number] => {
  const bounds = weightBounds.value

  if (!bounds) return [0, 0]

  const clamp = (value: number) => Math.min(Math.max(value, bounds.min), bounds.max)

  return [
    clamp(props.filters.minWeight ?? bounds.min),
    clamp(props.filters.maxWeight ?? bounds.max),
  ]
}

const weightDraft = ref<[number, number]>(weightFromFilters())

watch(
  () => [props.filters.minWeight, props.filters.maxWeight, weightBounds.value],
  () => {
    weightDraft.value = weightFromFilters()
  },
)

const commitWeight = ([low, high]: [number, number]) => {
  const bounds = weightBounds.value

  if (!bounds) return

  emit('update', {
    minWeight: low <= bounds.min ? null : low,
    maxWeight: high >= bounds.max ? null : high,
  })
}
</script>