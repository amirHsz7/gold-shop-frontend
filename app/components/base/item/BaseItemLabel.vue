<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    header?: boolean
    caption?: boolean
    overline?: boolean
    lines?: number | string
  }>(),
  {
    header: false,
    caption: false,
    overline: false,
  },
)

const classes = computed(() => {
  const cls = []

  if (props.header) {
    cls.push('text-sm font-medium text-gray-500 px-4 py-3')
  } else if (props.caption) {
    cls.push('text-sm text-gray-500 mt-0.5')
  } else if (props.overline) {
    cls.push(
      'text-xs font-bold uppercase tracking-wider text-gray-500 mb-1',
    )
  } else {
    cls.push('text-base text-inherit leading-tight')
  }

  if (props.lines) {
    const num = Number(props.lines)
    if (num === 1) {
      cls.push('truncate block')
    } else if (num > 1) {
      cls.push(`line-clamp-${num}`)
    }
  }

  return cls.join(' ')
})
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
