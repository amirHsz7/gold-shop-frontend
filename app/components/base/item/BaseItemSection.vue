<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    avatar?: boolean
    thumbnail?: boolean
    side?: boolean
    top?: boolean
    noWrap?: boolean
  }>(),
  {
    avatar: false,
    thumbnail: false,
    side: false,
    top: false,
    noWrap: false,
  },
)

const isSide = computed(() => props.avatar || props.thumbnail || props.side)

const classes = computed(() => [
  'flex flex-col',
  props.top ? 'justify-start self-start' : 'justify-center',
  isSide.value ? 'shrink-0' : 'flex-auto min-w-0',
  props.avatar ? 'min-w-[40px] items-center' : '',
  props.side ? 'text-gray-500 items-end' : '',
  props.noWrap ? 'whitespace-nowrap' : '',
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
