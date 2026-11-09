<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  unelevated: Boolean,
  outline: Boolean,
  flat: Boolean,
  rounded: Boolean,
  spread: Boolean,
})

const classes = computed(() => {
  const base = [
    'inline-flex',
    'flex-row',
    'items-stretch',

    '[&>*]:relative',
    'hover:[&>*]:z-10',
    'focus-within:[&>*]:z-10',
    'active:[&>*]:z-10',

    '[&>*]:!transition-none',
  ]

  base.push('[&>*:not(:first-child)]:!rounded-s-none')
  base.push('[&>*:not(:first-child)>button]:!rounded-s-none')
  base.push('[&>*:not(:first-child)>a]:!rounded-s-none')

  base.push('[&>*:not(:last-child)]:!rounded-e-none')
  base.push('[&>*:not(:last-child)>button]:!rounded-e-none')
  base.push('[&>*:not(:last-child)>a]:!rounded-e-none')

  if (props.rounded) {
    base.push('[&>*:first-child]:!rounded-s-full')
    base.push('[&>*:first-child>button]:!rounded-s-full')
    base.push('[&>*:first-child>a]:!rounded-s-full')

    base.push('[&>*:last-child]:!rounded-e-full')
    base.push('[&>*:last-child>button]:!rounded-e-full')
    base.push('[&>*:last-child>a]:!rounded-e-full')
  } else {
    base.push('[&>*:first-child]:!rounded-s-lg')
    base.push('[&>*:first-child>button]:!rounded-s-lg')
    base.push('[&>*:first-child>a]:!rounded-s-lg')

    base.push('[&>*:last-child]:!rounded-e-lg')
    base.push('[&>*:last-child>button]:!rounded-e-lg')
    base.push('[&>*:last-child>a]:!rounded-e-lg')
  }

  if (!props.unelevated && !props.flat && !props.outline) {
    base.push('shadow-sm')
    base.push('[&>*]:!shadow-none')
    base.push('[&>*>button]:!shadow-none')
  }

  if (props.outline) {
    base.push('[&>*:not(:first-child)]:-ms-px')
  } else if (!props.flat) {
    base.push('[&>*:not(:last-child)]:border-e')
    base.push('[&>*:not(:last-child)]:border-gray-200/50')
  }

  if (props.spread) {
    base.push('w-full', 'flex', '[&>*]:flex-1')
  }

  return base
})
</script>

<template>
  <div :class="classes" role="group" aria-label="Button group">
    <slot />
  </div>
</template>
