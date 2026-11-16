<template>
  <div class="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
    <!-- تامبنیل‌ها (دسکتاپ) -->
    <div v-if="images.length > 1" class="hidden w-22 shrink-0 flex-col gap-3 lg:flex">
      <button
        v-for="(image, i) in images"
        :key="image.id"
        type="button"
        class="overflow-hidden rounded-2xl border-2 transition-colors"
        :class="i === active ? 'border-burgundy' : 'border-nude/30'"
        :aria-label="`نمایش تصویر ${i + 1}`"
        @click="goTo(i)"
      >
        <BaseImg :src="assetUrl(image.url)" :alt="image.alt ?? name" ratio="1" no-spinner />
      </button>
    </div>

    <div class="relative min-w-0 flex-1">
      <div
        ref="scroller"
        class="flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-white/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onScroll"
      >
        <!-- با موس روی عکس بروید تا همان ناحیه بزرگ شود؛ با کلیک نمایشگر کامل باز می‌شود -->
        <div
          v-for="(image, i) in images"
          :key="image.id"
          class="group w-full shrink-0 cursor-zoom-in snap-center overflow-hidden"
          @mousemove="onHover"
          @mouseleave="origin = '50% 50%'"
          @click="openViewer(i)"
        >
          <BaseImg
            :src="assetUrl(image.url)"
            :alt="image.alt ?? name"
            ratio="1"
            no-spinner
            :native-loading="i === 0 ? 'eager' : 'lazy'"
            class="transition-transform duration-150 ease-out lg:group-hover:scale-[2.2]"
            :style="{ transformOrigin: origin }"
          />
        </div>

        <div
          v-if="images.length === 0"
          class="flex aspect-square w-full items-center justify-center text-nude"
        >
          <Icon name="lucide:image" size="48" />
        </div>
      </div>

      <div class="pointer-events-none absolute start-4 top-4 flex flex-col gap-2">
        <slot name="badges" />
      </div>

      <!-- دکمه‌ی بزرگ‌نمایی (برای موبایل و کیبورد) -->
      <BaseBtn
        v-if="images.length > 0"
        class="absolute end-3 top-3"
        round
        color="white"
        size="sm"
        aria-label="نمایش بزرگ تصویر"
        @click="openViewer(active)"
      >
        <template #icon>
          <Icon name="lucide:maximize-2" size="16" />
        </template>
      </BaseBtn>

      <div
        v-if="images.length > 1"
        class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden"
      >
        <span
          v-for="(image, i) in images"
          :key="image.id"
          class="h-1.5 rounded-full transition-all"
          :class="i === active ? 'w-5 bg-burgundy' : 'w-1.5 bg-gold'"
        />
      </div>
    </div>

    <ProductImageViewer
      v-model="viewerOpen"
      v-model:index="viewerIndex"
      :images="images"
      :name="name"
    />
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '../base/button/BaseBtn.vue';

type GalleryImage = { id: string; alt: string | null; url: string }

const props = defineProps<{
  images: GalleryImage[]
  name: string
}>()

const assetUrl = useAssetUrl()

const scroller = ref<HTMLElement | null>(null)
const active = ref(0)

// نقطه‌ی مرکز زوم؛ با حرکت موس روی عکس عوض می‌شود
const origin = ref('50% 50%')

const viewerOpen = ref(false)
const viewerIndex = ref(0)

const onHover = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  origin.value = `${x.toFixed(1)}% ${y.toFixed(1)}%`
}

const openViewer = (index: number) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

const onScroll = () => {
  const el = scroller.value
  if (!el || el.clientWidth === 0) return

  // در RTL مقدار scrollLeft منفی است
  active.value = Math.round(Math.abs(el.scrollLeft) / el.clientWidth)
}

const goTo = (index: number) => {
  const el = scroller.value
  if (!el) return

  const direction = getComputedStyle(el).direction === 'rtl' ? -1 : 1

  el.scrollTo({ left: direction * index * el.clientWidth, behavior: 'smooth' })
  active.value = index
}

// وقتی نمایشگر بسته می‌شود، گالری هم روی همان عکس می‌رود
watch(viewerOpen, (open) => {
  if (!open && viewerIndex.value !== active.value) goTo(viewerIndex.value)
})

// اگر محصول عوض شد (مثلاً مسیر دیگر)، به عکس اول برگرد
watch(() => props.images, () => {
  active.value = 0
})
</script>