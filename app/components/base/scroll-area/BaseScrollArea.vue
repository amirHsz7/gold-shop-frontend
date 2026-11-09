<template>
  <div
    class="scroll-area relative overflow-hidden h-full w-full"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      ref="scrollContainer"
      class="scroll-container h-full w-full [&::-webkit-scrollbar]:!hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      :class="scrollContainerClasses"
      @scroll="onScroll"
    >
      <div ref="contentRef" :class="contentClasses">
        <slot />
      </div>
    </div>

    <div
      v-show="vertical && isScrollableY"
      class="scroll-bar-vertical absolute left-0 top-0 bottom-0 w-2 z-20"
      :class="[isHovered || isDragging ? 'opacity-100' : 'opacity-0']"
      style="transition: opacity 0.3s"
    >
      <div
        class="scroll-thumb bg-gray-300 rounded-full absolute left-1 cursor-pointer hover:bg-gray-400"
        :style="verticalThumbStyle"
        @mousedown.stop.prevent="startDragging('vertical', $event)"
      ></div>
    </div>

    <div
      v-show="horizontal && showHorizontalScrollbar && isScrollableX"
      class="scroll-bar-horizontal absolute left-0 right-0 bottom-0 h-2 z-20"
      :class="[isHovered || isDragging ? 'opacity-100' : 'opacity-0']"
      style="transition: opacity 0.3s"
    >
      <div
        class="scroll-thumb bg-gray-300 rounded-full absolute bottom-0 cursor-pointer hover:bg-gray-400"
        :style="horizontalThumbStyle"
        @mousedown.stop.prevent="startDragging('horizontal', $event)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'

const props = defineProps({
  horizontal: { type: Boolean, default: false },
  vertical: { type: Boolean, default: true },
  showHorizontalScrollbar: { type: Boolean, default: true },
})

const emit = defineEmits(['scroll'])

const scrollContainer = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const isDragging = ref(false)
const dragAxis = ref<'vertical' | 'horizontal' | null>(null)
const isScrollableY = ref(false)
const isScrollableX = ref(false)
const thumbHeight = ref(0)
const thumbTop = ref(0)
const thumbWidth = ref(0)
const thumbLeft = ref(0)

let startPointer = 0
let startScrollTop = 0
let startScrollLeft = 0

const verticalThumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  top: `${thumbTop.value}px`,
  width: '4px',
}))

const horizontalThumbStyle = computed(() => ({
  width: `${thumbWidth.value}px`,
  insetInlineStart: `${thumbLeft.value}px`,
  height: '4px',
}))

const scrollContainerClasses = computed(() => [
  props.vertical ? 'overflow-y-auto' : 'overflow-y-hidden',
  props.horizontal ? 'overflow-x-auto' : 'overflow-x-hidden',
])

const contentClasses = computed(() =>
  props.horizontal ? 'w-max min-w-full' : 'w-full min-w-0',
)

const getDirection = () => scrollContainer.value ? getComputedStyle(scrollContainer.value).direction : 'ltr'

const getNormalizedScrollLeft = () => {
  const element = scrollContainer.value
  if (!element) return 0
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  if (getDirection() !== 'rtl') return element.scrollLeft
  return Math.min(maxScrollLeft, Math.abs(element.scrollLeft))
}

const setNormalizedScrollLeft = (value: number) => {
  const element = scrollContainer.value
  if (!element) return
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  const nextValue = Math.max(0, Math.min(maxScrollLeft, value))
  element.scrollLeft = getDirection() === 'rtl' ? -nextValue : nextValue
}

const updateThumbPosition = () => {
  if (!scrollContainer.value) return

  const { scrollTop, scrollHeight, scrollWidth, clientHeight, clientWidth } = scrollContainer.value

  isScrollableY.value = scrollHeight > clientHeight
  isScrollableX.value = scrollWidth > clientWidth

  if (isScrollableY.value) {
    const ratio = clientHeight / scrollHeight
    thumbHeight.value = Math.max(clientHeight * ratio, 24)
    const maxScrollTop = scrollHeight - clientHeight
    const maxThumbTop = clientHeight - thumbHeight.value
    thumbTop.value = (scrollTop / maxScrollTop) * maxThumbTop
  }

  if (isScrollableX.value) {
    const ratio = clientWidth / scrollWidth
    thumbWidth.value = Math.max(clientWidth * ratio, 24)
    const maxScrollLeft = scrollWidth - clientWidth
    const maxThumbLeft = clientWidth - thumbWidth.value
    thumbLeft.value = (getNormalizedScrollLeft() / maxScrollLeft) * maxThumbLeft
  }
}

const startDragging = (axis: 'vertical' | 'horizontal', e: MouseEvent) => {
  isDragging.value = true
  dragAxis.value = axis
  startPointer = axis === 'vertical' ? e.clientY : e.clientX
  const element = scrollContainer.value
  if (!element) return
  startScrollTop = element.scrollTop
  startScrollLeft = getNormalizedScrollLeft()
  document.addEventListener('mousemove', onDragging)
  document.addEventListener('mouseup', stopDragging)
  document.body.style.userSelect = 'none'
}

const onDragging = (e: MouseEvent) => {
  if (!isDragging.value) return
  const element = scrollContainer.value
  if (!element) return

  if (dragAxis.value === 'vertical') {
    const deltaY = e.clientY - startPointer
    const { scrollHeight, clientHeight } = element
    const maxThumbTop = clientHeight - thumbHeight.value
    const maxScrollTop = scrollHeight - clientHeight
    const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop
    element.scrollTop = startScrollTop + scrollDelta
    return
  }

  const deltaX = e.clientX - startPointer
  const { scrollWidth, clientWidth } = element
  const maxThumbLeft = clientWidth - thumbWidth.value
  const maxScrollLeft = scrollWidth - clientWidth
  const directionMultiplier = getDirection() === 'rtl' ? -1 : 1
  const scrollDelta = ((deltaX * directionMultiplier) / maxThumbLeft) * maxScrollLeft
  setNormalizedScrollLeft(startScrollLeft + scrollDelta)
  updateThumbPosition()
}

const stopDragging = () => {
  isDragging.value = false
  dragAxis.value = null
  document.removeEventListener('mousemove', onDragging)
  document.removeEventListener('mouseup', stopDragging)
  document.body.style.userSelect = ''
}

const onScroll = (e: Event) => {
  updateThumbPosition() // آپدیت کردن موقعیت اسکرول‌بار سفارشی شما
  emit('scroll', e) // ارسال رویداد به بیرون
}

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  updateThumbPosition()
  resizeObserver = new ResizeObserver(() => {
    updateThumbPosition()
  })
  if (contentRef.value) resizeObserver.observe(contentRef.value)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  stopDragging()
})
</script>

<style scoped>
.scroll-container {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

.scroll-container::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
</style>
