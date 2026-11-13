<template>
  <div class="flex w-full min-w-0 flex-col gap-2 md:flex-row" dir="rtl">
    <div
      role="tablist"
      aria-orientation="vertical"
      class="flex w-full min-w-0 max-w-full flex-row flex-nowrap gap-2 overflow-x-auto p-1.5 md:sticky md:top-1 md:w-64 md:shrink-0 md:flex-col md:gap-1 md:self-start md:rounded-xl md:border md:border-gray-200 md:bg-white md:p-3 [&::-webkit-scrollbar]:hidden"
      style="scrollbar-width: none;"
    >
      <template v-for="item in tabs" :key="item.id ?? item.label">
        <div
          v-if="item.type === 'title'"
          role="presentation"
          class="hidden px-3 pb-2 pt-4 text-xs font-bold text-gray-400 md:block"
        >
          {{ item.label }}
        </div>

        <hr
          v-else-if="item.type === 'divider'"
          role="presentation"
          class="mx-3 my-2 hidden border-t border-gray-200 md:block"
        />

        <button
          v-else
          type="button"
          role="tab"
          :aria-selected="modelValue === item.id"
          :disabled="item.disabled"
          :class="getTabClass(item)"
          :style="getTabStyle(item.id)"
          @click="!item.disabled && $emit('update:modelValue', item.id)"
        >
          <span
            :id="`${item.id}-label`"
            class="flex items-center justify-center gap-2 text-center md:justify-start md:text-start"
          >
            {{ item.label }}
            <svg
              v-if="!!item.tooltip"
              class="!cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="16"
              height="16"
              role="img"
            >
              <title>{{ item.tooltip }}</title>
              <circle cx="32" cy="32" r="32" fill="#E0E0E0" />
              <path
                fill="#ffffff"
                d="M31.9,13.5c-6.8,0-11.6,4-12.7,9.9h7.1c0.7-2.6,2.6-4.1,5.5-4.1c3.1,0,5.6,1.9,5.6,4.6c0,2.6-1.7,3.9-4.5,6 c-3.5,2.6-4.9,5.2-4.6,9.5h7.1c0-2.6,1.1-4.1,4.3-6.6c3.2-2.4,5.4-4.9,5.4-9.3C45.2,17.4,39.6,13.5,31.9,13.5z M32.2,42.5 c-2.4,0-4.3,1.9-4.3,4.3s1.9,4.3,4.3,4.3c2.4,0,4.3-1.9,4.3-4.3S34.5,42.5,32.2,42.5z"
              />
            </svg>
          </span>

          <span
            v-if="item.badge"
            class="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-normal"
            :class="getBadgeClass(item.id)"
          >
            {{ item.badge }}
          </span>
        </button>
      </template>
    </div>

    <div class="flex-1 md:px-0">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// کلاس‌ها باید به‌صورت رشته‌ی کامل نوشته شوند تا Tailwind آن‌ها را بسازد
const predefinedColors = {
  black: { bg: 'bg-black', text: 'text-white', mdBg: 'md:bg-black/10', mdText: 'md:text-black' },
  primary: { bg: 'bg-primary-light', text: 'text-primary-500', mdBg: 'md:bg-primary-100', mdText: 'md:text-primary-800' },
  blue: { bg: 'bg-blue-500', text: 'text-white', mdBg: 'md:bg-blue-100', mdText: 'md:text-blue-800' },
  red: { bg: 'bg-red', text: 'text-white', mdBg: 'md:bg-red-100', mdText: 'md:text-red-800' },
  green: { bg: 'bg-green-500', text: 'text-white', mdBg: 'md:bg-green-100', mdText: 'md:text-green-800' },
  yellow: { bg: 'bg-yellow-500', text: 'text-white', mdBg: 'md:bg-yellow-100', mdText: 'md:text-yellow-800' },
  indigo: { bg: 'bg-indigo-500', text: 'text-white', mdBg: 'md:bg-indigo-100', mdText: 'md:text-indigo-800' },
} as const

type Color = keyof typeof predefinedColors

export interface TabItem {
  id?: string | number
  label?: string
  badge?: number
  tooltip?: string | null
  type?: 'tab' | 'divider' | 'title'
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  tabs: TabItem[]
  color?: Color | string
}>(), {
  color: 'black',
})

defineEmits(['update:modelValue'])

const isCustomColor = computed(() => !(props.color in predefinedColors))

const getTabClass = (item: TabItem) => {
  if (item.id === undefined) return ''

  const isActive = props.modelValue === item.id

  const base = [
    'relative flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-full border px-5 py-2.5 text-sm transition-colors duration-200',
    'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400',
    'md:w-full md:justify-start md:rounded-lg md:border-transparent',
  ]

  if (item.disabled) {
    base.push(
      'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 opacity-60 md:bg-transparent',
    )
  }
  else if (!isActive) {
    base.push(
      'cursor-pointer border-gray-200 bg-white text-gray-600 hover:bg-gray-100 md:bg-transparent md:hover:bg-gray-50',
    )
  }
  else {
    base.push('cursor-pointer border-transparent font-semibold')

    if (!isCustomColor.value) {
      const scheme = predefinedColors[props.color as Color]

      base.push(scheme.bg, scheme.text, scheme.mdBg, scheme.mdText)
    }
    else {
      base.push('text-white')
    }
  }

  return base.join(' ')
}

const getTabStyle = (id: string | number | undefined) => {
  if (id === undefined || !isCustomColor.value || props.modelValue !== id) {
    return undefined
  }

  return { backgroundColor: props.color }
}

const getBadgeClass = (id: string | number | undefined) => {
  if (id === undefined) return ''

  if (props.modelValue === id) {
    // تب فعال: روی موبایل زمینه‌ی نیمه‌شفاف (متن سفید دیده شود)،
    // روی دسکتاپ با رنگ‌های آماده زمینه‌ی سفید؛ رنگ سفارشی همان نیمه‌شفاف می‌ماند
    return isCustomColor.value
      ? 'bg-white/25 text-current'
      : 'bg-white/25 text-current md:bg-white'
  }

  return 'bg-gray-100 text-gray-500'
}
</script>