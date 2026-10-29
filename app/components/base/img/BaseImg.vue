<template>
  <div :class="containerClasses" :style="containerStyle" :ratio="ratio">
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      :class="imgClasses"
      :style="imgStyle"
      :loading="nativeLoading as 'lazy' | 'eager'"
      :decoding="decoding as 'auto' | 'async' | 'sync'"
      :crossorigin="crossorigin as '' | 'anonymous' | 'use-credentials'"
      :referrerpolicy="referrerpolicy as ReferrerPolicy"
      :srcset="srcset"
      :sizes="sizes"
      :draggable="draggable as 'true' | 'false' | boolean"
      @load="onLoad"
      @error="onError"
    />

    <div
      v-if="isLoading && !noSpinner"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <slot name="loading">
        <svg
          class="animate-spin h-8 w-8 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </slot>
    </div>

    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <slot name="error">
        <svg
          class="w-10 h-10 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </slot>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: undefined },
  srcset: { type: String, default: undefined },
  sizes: { type: String, default: undefined },
  alt: { type: String, default: '' },
  draggable: { type: [Boolean, String], default: undefined },
  crossorigin: { type: String, default: undefined },
  referrerpolicy: { type: String, default: undefined },
  decoding: { type: String, default: 'async' },
  nativeLoading: { type: String, default: 'lazy' },
  ratio: { type: [String, Number], default: undefined },
  width: { type: String, default: undefined },
  height: { type: String, default: undefined },
  fit: { type: String, default: 'cover' },
  position: { type: String, default: '50% 50%' },
  noSpinner: Boolean,
  noTransition: Boolean,
  spinnerColor: { type: String, default: 'primary' },
  spinnerSize: { type: String, default: '50px' },
  placeholderSrc: { type: String, default: undefined },
})

const emit = defineEmits(['load', 'error'])

const isLoading = ref(true)
const hasError = ref(false)

const containerClasses = computed(() => ['relative overflow-hidden'])

const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (props.ratio) {
    style.aspectRatio = String(props.ratio)
  }
  return style
})

const fitMap: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
}

const imgClasses = computed(() => [
  'w-full h-full block',
  fitMap[props.fit] || fitMap.cover,
  !props.noTransition ? 'transition-opacity duration-300' : '',
  isLoading.value ? 'opacity-0' : 'opacity-100',
])

const imgStyle = computed(() => ({
  objectPosition: props.position,
}))

const onLoad = (e: Event) => {
  isLoading.value = false
  hasError.value = false
  emit('load', e)
}

const onError = (e: Event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', e)
}

watch(
  () => props.src,
  () => {
    isLoading.value = true
    hasError.value = false
  },
)
</script>
