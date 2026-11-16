<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    stroke-width="1.8"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0 transition-colors"
    :class="filled ? 'fill-gold stroke-gold' : 'fill-transparent stroke-nude/50'"
  >
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    filled?: boolean
    size?: number
  }>(),
  { filled: false, size: 20 },
)
</script>