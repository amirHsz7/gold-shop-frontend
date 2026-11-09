<script setup lang="ts">
import { computed, provide } from 'vue'

const props = withDefaults(
  defineProps<{
    bordered?: boolean
    dense?: boolean
    separator?: boolean
    padding?: boolean
  }>(),
  {
    bordered: false,
    dense: false,
    separator: false,
    padding: false,
  },
)

provide('list-dense', props.dense)

const classes = computed(() => [
  'list-none m-0',
  props.padding ? 'py-2' : 'p-0',
  props.bordered ? 'border border-gray-200 rounded-md' : '',
  props.separator ? 'divide-y divide-gray-200' : '',
  
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
