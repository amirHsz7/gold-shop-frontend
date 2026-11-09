<template>
  <component
    :is="tag"
    v-bind="attrs"
    :to="to"
    :replace="to ? replace : undefined"
    :href="href"
    :target="href ? target : undefined"
    :type="tag === 'button' ? type : undefined"
    :tabindex="tabindex"
    :class="classes"
    :style="customStyle"
    :disabled="tag === 'button' ? disable || loading : undefined"
    :aria-disabled="disable || loading ? 'true' : undefined"
    @click="onClick"
    v-ripple="ripple !== false && !disable && !loading"
  >
    <span
      v-if="percentage !== undefined && percentage > 0"
      class="absolute inset-y-0 left-0 bg-white/20 transition-all duration-200 z-0"
      :style="{ width: `${Math.max(0, Math.min(100, percentage))}%` }"
    />

    <span
      v-if="!disable && !loading"
      class="absolute inset-0 pointer-events-none transition-opacity duration-200 z-0"
      :class="overlayClass"
    />

    <span
      class="relative z-10 flex items-center gap-2"
      :class="[loading ? 'invisible' : 'visible', innerBtnClass]"
    >
      <slot name="icon">
        <i v-if="icon" :class="icon" aria-hidden="true" />
      </slot>

      <slot>
        <span v-if="label">{{ label }}</span>
      </slot>

      <slot name="icon-right">
        <i v-if="iconRight" :class="iconRight" aria-hidden="true" />
      </slot>
    </span>

    <span
      v-if="loading"
      class="absolute inset-0 z-20 flex items-center justify-center"
    >
      <slot name="loading">
        <svg
          class="animate-spin w-5 h-5"
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
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { vRipple } from '@/directives/vRipple'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  label: [String, Number],
  icon: String,
  iconRight: String,
  noCaps: Boolean,
  noWrap: Boolean,
  align: {
    type: String,
    default: 'center',
  },

  to: [String, Object],
  replace: Boolean,
  href: String,
  target: String,
  type: {
    type: String,
    default: 'button',
  },

  disable: Boolean,
  loading: Boolean,
  tabindex: [Number, String],

  color: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '',
  },

  flat: Boolean,
  outline: Boolean,
  unelevated: Boolean,
  push: Boolean,
  glossy: Boolean,

  size: {
    type: String,
    default: 'md',
  },
  padding: String,
  round: Boolean,
  rounded: Boolean,
  dense: Boolean,
  fab: Boolean,
  fabMini: Boolean,
  stretch: Boolean,
  full: Boolean,
  innerBtnClass: String,
  ripple: {
    type: [Boolean, Object],
    default: true,
  },
  percentage: Number,
})

const emit = defineEmits(['click'])
const attrs = useAttrs()

// کلاس‌ها باید به‌صورت رشته‌ی کامل نوشته شوند تا Tailwind آن‌ها را بسازد
type ColorPreset = {
  solidBg: string
  solidText: string
  solidHover: string
  lineBorder: string // حالت outline
  lineText: string // متن در حالت outline و flat
  lineHover: string // هاور در حالت outline و flat
}

const COLOR_MAP: Record<string, ColorPreset> = {
  black: {
    solidBg: 'bg-black',
    solidText: 'text-white',
    solidHover: 'hover:bg-black/90',
    lineBorder: 'border-black',
    lineText: 'text-black',
    lineHover: 'hover:bg-black/10',
  },
  white: {
    solidBg: 'bg-white',
    solidText: 'text-gray-900',
    solidHover: 'hover:bg-white/90',
    lineBorder: 'border-white',
    lineText: 'text-white',
    lineHover: 'hover:bg-white/10',
  },
  gray: {
    solidBg: 'bg-gray-200',
    solidText: 'text-gray-800',
    solidHover: 'hover:bg-gray-300',
    lineBorder: 'border-gray-300',
    lineText: 'text-gray-700',
    lineHover: 'hover:bg-gray-100',
  },
}

const TEXT_COLOR_MAP: Record<string, string> = {
  black: 'text-black',
  white: 'text-white',
  gray: 'text-gray-700',
}

const tag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

function onClick(e: MouseEvent) {
  if (props.disable || props.loading) {
    e.preventDefault()
    return
  }
  emit('click', e)
}

const radiusClass = computed(() => {
  if (props.round) return 'rounded-full'
  if (props.rounded) return 'rounded-xl'
  return 'rounded-md'
})

const sizeClasses = computed(() => {
  const classes = []

  const externalClass = (attrs.class || '').toString()
  const hasExternalPadding = /\bp[xytrbl]?-[0-9\w\[\]]+/.test(externalClass)

  const applyDefaultPadding = !props.padding && !hasExternalPadding

  if (props.fab) return 'w-14 h-14 text-2xl shadow-lg'
  if (props.fabMini) return 'w-10 h-10 text-xl shadow-md'

  if (props.round) {
    let base = props.dense
      ? 'p-1.5 min-h-[2.3em] min-w-[2.3em]'
      : 'p-3 min-h-[3em] min-w-[3em]'
    if (props.size === 'xs') base = 'w-6 h-6 text-xs p-1'
    else if (props.size === 'sm') base = 'w-8 h-8 text-sm p-1.5'
    else if (props.size === 'md') base = 'w-10 h-10 text-base p-2'
    else if (props.size === 'lg') base = 'w-12 h-12 text-lg p-3'
    else if (props.size === 'xl') base = 'w-14 h-14 text-xl p-3.5'
    return base
  } else {
    if (props.dense) classes.push('min-h-[2.3em]')
    else if (props.size === 'sm') classes.push('min-h-[2.5em] text-[13px]')
    else if (props.size === 'md') classes.push('min-h-[3em] text-[14px]')
    else if (props.size === 'lg') classes.push('min-h-[3.5em] text-[16px]')
    else if (props.size === 'xl') classes.push('min-h-[4em] text-[18px]')

    if (applyDefaultPadding) {
      if (props.dense) classes.push('px-2 py-1')
      else if (props.size === 'sm') classes.push('px-3 py-1')
      else if (props.size === 'md') classes.push('px-4 py-2')
      else if (props.size === 'lg') classes.push('px-6 py-3')
      else if (props.size === 'xl') classes.push('px-8 py-4')
    }
  }

  if (props.padding) {
    const sizeMap: Record<string, string> = { none: '0', xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    classes.push(
      props.padding
        .split(' ')
        .map((p) => sizeMap[p] || p)
        .join(' '),
    )
  }

  return classes.join(' ')
})

const alignClass = computed(() => {
  const map: Record<string, string> = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }
  return map[props.align] || 'justify-center'
})

const baseClasses = computed(() => [
  'group relative inline-flex items-center overflow-hidden',
  'transition-all duration-200 font-medium select-none',

  props.noCaps ? 'normal-case' : 'uppercase tracking-wider',
  props.noWrap ? 'whitespace-nowrap' : '',
  props.full ? 'w-full' : '',
  props.stretch ? 'self-stretch h-auto' : '',

  radiusClass.value,
  sizeClasses.value,
  alignClass.value,

  props.disable || props.loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',

  props.glossy ? 'bg-gradient-to-b from-white/30 to-transparent' : '',
  props.push ? 'border-b-[3px] active:border-b active:translate-y-[2px]' : '',
])

const textColorClass = computed(() => {
  if (!props.textColor) return ''

  return TEXT_COLOR_MAP[props.textColor] ?? `text-${props.textColor}`
})

const variantClasses = computed(() => {
  const color = props.color
  const preset = COLOR_MAP[color]
  const txt = textColorClass.value
  const canHover = !!color && !props.disable

  // رنگ متن در حالت‌های flat و outline
  const lineText = txt || (preset ? preset.lineText : color ? `text-${color}` : '')

  // هاور در حالت‌های flat و outline
  const lineHover = canHover
    ? preset
      ? preset.lineHover
      : `hover:bg-${color}/10`
    : ''

  if (props.flat) {
    return ['bg-transparent', lineText, lineHover]
  }

  if (props.outline) {
    return [
      'bg-transparent border',
      preset ? preset.lineBorder : color ? `border-${color}` : '',
      lineText,
      lineHover,
    ]
  }

  const contained = [
    preset ? preset.solidBg : color ? `bg-${color}` : 'bg-gray-200',
    txt || (preset ? preset.solidText : color ? 'text-white' : 'text-gray-800'),
    canHover ? (preset ? preset.solidHover : `hover:bg-${color}/90`) : '',
  ]

  if (!props.unelevated && !props.push && !props.flat && !props.outline) {
    contained.push('shadow-md hover:shadow-lg active:shadow-sm')
  }

  return contained
})

const classes = computed(() => [...baseClasses.value, ...variantClasses.value])

const overlayClass = computed(() => {
  if (props.flat || props.outline) return 'bg-current opacity-0 group-hover:opacity-10'

  // روی پس‌زمینه‌ی روشن، لایه‌ی سفید دیده نمی‌شود
  if (props.color === 'white' || props.color === 'gray') {
    return 'bg-black opacity-0 group-hover:opacity-5'
  }

  return 'bg-white opacity-0 group-hover:opacity-20'
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.size && !['xs', 'sm', 'md', 'lg', 'xl'].includes(props.size)) {
    style.fontSize = props.size
  }

  if (props.padding) {
    const sizeMap: Record<string, string> = { none: '0', xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
    style.padding = props.padding
      .split(' ')
      .map((p) => sizeMap[p] || p)
      .join(' ')
  }

  return style
})
</script>