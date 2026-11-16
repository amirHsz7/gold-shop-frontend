<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-100 flex flex-col bg-black/95"
        role="dialog"
        aria-modal="true"
        aria-label="نمایش بزرگ تصاویر"
      >
        <!-- نوار بالا -->
        <div class="flex items-center justify-between px-4 py-3 text-white">
          <BaseBtn
            flat
            rounded
            no-caps
            color="white"
            text-color="white"
            label="بستن"
            class="bg-white/15! pe-4!"
            aria-label="بستن نمایش بزرگ"
            @pointerdown.stop
            @click="close"
          >
            <template #icon>
              <Icon name="lucide:x" size="20" />
            </template>
          </BaseBtn>
          <span class="text-sm tabular-nums">
            {{ toFa(index + 1) }} / {{ toFa(images.length) }}
          </span>
          <div class="flex gap-1">
            <BaseBtn flat round color="white" aria-label="کوچک‌نمایی" :disable="scale <= 1" @click="zoomBy(1 / 1.6)">
              <template #icon>
                <Icon name="lucide:zoom-out" size="22" />
              </template>
            </BaseBtn>
            <BaseBtn flat round color="white" aria-label="بزرگ‌نمایی" :disable="scale >= MAX_SCALE" @click="zoomBy(1.6)">
              <template #icon>
                <Icon name="lucide:zoom-in" size="22" />
              </template>
            </BaseBtn>
          </div>
        </div>

        <!-- صحنه‌ی زوم -->
        <div
          ref="stage"
          class="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
          :class="scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'"
          @pointerdown="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
          @wheel.prevent="onWheel"
        >
          <img
            v-if="current"
            :src="assetUrl(current.url)"
            :alt="current.alt ?? name"
            draggable="false"
            class="pointer-events-none size-full object-contain will-change-transform"
            :class="!dragging && 'transition-transform duration-200'"
            :style="{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }"
          >

          <template v-if="images.length > 1 && scale === 1">
            <BaseBtn
              class="absolute start-3 top-1/2 hidden -translate-y-1/2 lg:flex"
              round
              color="white"
              aria-label="تصویر قبلی"
              :disable="index === 0"
              @pointerdown.stop
              @click="go(-1)"
            >
              <template #icon>
                <Icon name="lucide:chevron-right" size="22" />
              </template>
            </BaseBtn>
            <BaseBtn
              class="absolute end-3 top-1/2 hidden -translate-y-1/2 lg:flex"
              round
              color="white"
              aria-label="تصویر بعدی"
              :disable="index === images.length - 1"
              @pointerdown.stop
              @click="go(1)"
            >
              <template #icon>
                <Icon name="lucide:chevron-left" size="22" />
              </template>
            </BaseBtn>
          </template>
        </div>

        <!-- تامبنیل‌ها -->
        <div
          v-if="images.length > 1"
          class="flex justify-center gap-2 overflow-x-auto px-4 py-3"
        >
          <button
            v-for="(image, i) in images"
            :key="image.id"
            type="button"
            class="size-14 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity"
            :class="i === index ? 'border-gold' : 'border-transparent opacity-50'"
            :aria-label="`تصویر ${i + 1}`"
            @click="select(i)"
          >
            <BaseImg :src="assetUrl(image.url)" :alt="image.alt ?? name" ratio="1" no-spinner />
          </button>
        </div>

        <p class="pb-3 text-center text-xs text-white/60">
          برای بزرگ‌نمایی دو بار ضربه بزنید یا با دو انگشت باز کنید
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import BaseBtn from '../base/button/BaseBtn.vue';

type ViewerImage = { id: string; alt: string | null; url: string }

const props = defineProps<{
  modelValue: boolean
  index: number
  images: ViewerImage[]
  name: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:index': [value: number]
}>()

const MAX_SCALE = 5
const DOUBLE_TAP_SCALE = 2.5
const SWIPE_DISTANCE = 70

const assetUrl = useAssetUrl()
const toFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

const stage = ref<HTMLElement | null>(null)
const scale = ref(1)
const tx = ref(0)
const ty = ref(0)
const dragging = ref(false)

const current = computed(() => props.images[props.index] ?? null)

// ───── وضعیت ژست‌ها ─────
const pointers = new Map<number, { x: number, y: number }>()
let start = { x: 0, y: 0, tx: 0, ty: 0 }
let pinch = { distance: 0, scale: 1 }
let moved = false
let lastTap = 0

const resetZoom = () => {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}

// جابه‌جایی به اندازه‌ای محدود می‌شود که لبه‌ی عکس از صحنه بیرون نرود
const clampPan = () => {
  const rect = stage.value?.getBoundingClientRect()
  if (!rect) return

  const maxX = ((scale.value - 1) * rect.width) / 2
  const maxY = ((scale.value - 1) * rect.height) / 2

  tx.value = Math.min(maxX, Math.max(-maxX, tx.value))
  ty.value = Math.min(maxY, Math.max(-maxY, ty.value))
}

// زوم حول یک نقطه (مختصات نسبت به مرکز صحنه)
const zoomAt = (next: number, cx: number, cy: number) => {
  const target = Math.min(MAX_SCALE, Math.max(1, next))
  const ratio = target / scale.value

  tx.value = cx - (cx - tx.value) * ratio
  ty.value = cy - (cy - ty.value) * ratio
  scale.value = target

  if (target === 1) {
    tx.value = 0
    ty.value = 0
  }
  else {
    clampPan()
  }
}

const toStagePoint = (clientX: number, clientY: number) => {
  const rect = stage.value!.getBoundingClientRect()

  return {
    x: clientX - rect.left - rect.width / 2,
    y: clientY - rect.top - rect.height / 2,
  }
}

const zoomBy = (factor: number) => zoomAt(scale.value * factor, 0, 0)

const distanceOf = () => {
  const [a, b] = [...pointers.values()]

  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
}

const onDown = (event: PointerEvent) => {
  stage.value?.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  dragging.value = true

  if (pointers.size === 1) {
    start = { x: event.clientX, y: event.clientY, tx: tx.value, ty: ty.value }
    moved = false
  }
  else if (pointers.size === 2) {
    pinch = { distance: distanceOf(), scale: scale.value }
    moved = true
  }
}

const onMove = (event: PointerEvent) => {
  if (!pointers.has(event.pointerId)) return

  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [{ x: number, y: number }, { x: number, y: number }]
    const center = toStagePoint((a.x + b.x) / 2, (a.y + b.y) / 2)

    if (pinch.distance > 0) {
      zoomAt(pinch.scale * (distanceOf() / pinch.distance), center.x, center.y)
    }

    return
  }

  const dx = event.clientX - start.x
  const dy = event.clientY - start.y

  if (Math.abs(dx) + Math.abs(dy) > 6) moved = true

  if (scale.value > 1) {
    tx.value = start.tx + dx
    ty.value = start.ty + dy
    clampPan()
  }
  else {
    // در حالت عادی فقط کشیدن افقی برای تعویض عکس
    tx.value = dx
  }
}

const onUp = (event: PointerEvent) => {
  pointers.delete(event.pointerId)

  // بعد از پینچ، انگشت باقی‌مانده ادامه‌ی جابه‌جایی را می‌گیرد
  if (pointers.size === 1) {
    const [rest] = [...pointers.values()] as [{ x: number, y: number }]

    start = { x: rest.x, y: rest.y, tx: tx.value, ty: ty.value }

    return
  }

  if (pointers.size > 0) return

  dragging.value = false

  if (scale.value <= 1.02) {
    const swipe = tx.value

    resetZoom()

    // در RTL کشیدن به راست یعنی تصویر بعدی
    if (Math.abs(swipe) > SWIPE_DISTANCE) go(swipe > 0 ? 1 : -1)
  }

  if (moved) return

  // ضربه‌ی دوم: زوم یا بازگشت
  const now = Date.now()

  if (now - lastTap < 300) {
    const point = toStagePoint(event.clientX, event.clientY)

    if (scale.value > 1) resetZoom()
    else zoomAt(DOUBLE_TAP_SCALE, point.x, point.y)

    lastTap = 0
  }
  else {
    lastTap = now
  }
}

const onWheel = (event: WheelEvent) => {
  const point = toStagePoint(event.clientX, event.clientY)

  zoomAt(scale.value * (event.deltaY < 0 ? 1.2 : 1 / 1.2), point.x, point.y)
}

// ───── تعویض و بستن ─────
const select = (i: number) => {
  resetZoom()
  emit('update:index', i)
}

const go = (delta: number) => {
  const next = props.index + delta

  if (next >= 0 && next < props.images.length) select(next)
}

const close = () => emit('update:modelValue', false)

const onKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue) return

  if (event.key === 'Escape') close()
  // در RTL فلش چپ یعنی بعدی
  else if (event.key === 'ArrowLeft') go(1)
  else if (event.key === 'ArrowRight') go(-1)
}

watch(
  () => props.modelValue,
  (open) => {
    resetZoom()
    pointers.clear()
    document.documentElement.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})
</script>