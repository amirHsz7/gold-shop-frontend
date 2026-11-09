<script setup lang="ts">
import { computed, inject } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    activeClass?: string
    clickable?: boolean
    dense?: boolean
    tag?: string
    to?: string | object
    href?: string
  }>(),
  {
    active: false,
    activeClass: 'text-blue-600',
    clickable: false,
    dense: false,
    tag: 'div',
  },
)

const listDense = inject('list-dense', false)
const isDense = computed(() => props.dense || listDense)

const isActionable = computed(() => props.clickable || !!props.to || !!props.href)

const tagType = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return props.tag
})

const classes = computed(() => [
  'relative group flex items-center justify-start w-full transition-colors duration-200 gap-4 overflow-hidden',
  isDense.value ? 'min-h-[32px] py-1.5 px-3' : 'min-h-[48px] py-2 px-4',
  isActionable.value ? 'cursor-pointer outline-none' : '',
  props.active ? props.activeClass : 'text-gray-800',
])
</script>

<template>
  <component :is="tagType" :to="to" :href="href" :class="classes">
    <span
      v-if="isActionable"
      class="absolute inset-0 pointer-events-none bg-current opacity-0 group-hover:opacity-[0.08] group-focus-visible:opacity-[0.12] transition-opacity"
    ></span>

    <slot />
  </component>
</template>
