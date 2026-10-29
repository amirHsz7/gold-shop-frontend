<template>
  <label class="relative w-fit" :for="id">
    <slot name="prepend" />

    <div class="flex items-center gap-1 group">
      
      <!-- Wrapper اختصاصی برای خودِ چک‌باکس و آیکون -->
      <div class="relative flex items-center justify-center">
        <input
          type="checkbox"
          class="appearance-none"
          :class="trackClass"
          :style="isCustomColor ? trackStyle : undefined"
          :aria-checked="ariaChecked"
          role="checkbox"
          aria-hidden="true"
          @click.prevent.stop="toggle"
        />

        <!-- icon -->
        <Icon
        :name="state === null ? 'lucide:minus' : 'lucide:check'"
        class="absolute pointer-events-none transition-all duration-200"
        :class="[iconClass, sizes[size]]"
        :style="{ color: 'black' }"
        />

        <!-- ripple -->
        <span
        aria-hidden="true"
        :class="rippleClass"
        :style="isCustomColor ? rippleStyle : undefined"
        />

      </div>

      <slot name="label">
        {{ label }}
      </slot>

    </div>

    <slot name="append" />
  </label>
</template>


<script setup lang="ts">
import { computed } from "vue"
import { useId } from "vue"

const sizes = {
  xs: "w-[11px] h-[11px]",
  sm: "w-[13.5px] h-[13.5px]",
  md: "w-4 h-4",
  lg: "w-[21px] h-[21px]",
  xl: "w-[26px] h-[26px]",
} as const

const predefinedColors = {
  blue: { border: "border-blue", bg: "bg-blue", ripple: "bg-blue-light" },
  red: { border: "border-red", bg: "bg-red", ripple: "bg-red-light" },
  green: { border: "border-green", bg: "bg-green", ripple: "bg-green-light" },
  yellow: { border: "border-yellow", bg: "bg-yellow", ripple: "bg-yellow-light" },
  indigo: { border: "border-indigo", bg: "bg-indigo", ripple: "bg-indigo-light" },
  primary: { border: "border-primary-500", bg: "bg-primary-500", ripple: "bg-primary-light" }
} as const

type Size = keyof typeof sizes
type Color = keyof typeof predefinedColors

const props = withDefaults(defineProps<{
  modelValue: any 
  trueValue?: any 
  falseValue?: any 
  indeterminateValue?: any 
  size?: Size
  id?: string
  color?: Color | string
  label?: string
  disabled?: boolean
  keepColor?: boolean
  toggleIndeterminate?: boolean
}>(), {
  trueValue: true,
  falseValue: false,
  indeterminateValue: null,
  size: "xs",
  color: "blue",
  disabled: false,
  keepColor: false,
  toggleIndeterminate: false,
})

const emit = defineEmits<{
  (e: "update:modelValue", v: any): void 
}>()

const id = props.id ?? useId()

/* state */
const state = computed(() => {
  if (props.modelValue === props.trueValue) return true
  if (props.modelValue === props.falseValue) return false
  if (props.modelValue === props.indeterminateValue) return null
  return false // fallback
})

/* accessibility */
const ariaChecked = computed(() =>
  state.value === null ? "mixed" : state.value
)

/* toggle */
function toggle() {
  if (props.disabled) return

  if (props.toggleIndeterminate) {
    if (state.value === null) emit("update:modelValue", props.trueValue)
    else if (state.value === true) emit("update:modelValue", props.falseValue)
    else emit("update:modelValue", props.indeterminateValue)
  } else {
    emit("update:modelValue", state.value === true ? props.falseValue : props.trueValue)
  }
}

/* icon */
const iconClass = computed(() => {
  if (state.value === false) return "opacity-0 scale-75"
  return "opacity-100 scale-100"
})

/* colors */
const isCustomColor = computed(
  () => !(props.color in predefinedColors)
)

/* track */
const trackClass = computed(() => {
  const base = [
    "relative rounded-sm border-2 transition-colors",
    sizes[props.size],
    props.disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer",
  ]

  if (!isCustomColor.value) {
    const color = predefinedColors[props.color as Color]

    base.push(
      state.value ? color.bg : "bg-white",
      state.value || props.keepColor ? color.border : "border-gray-300"
    )
  }

  return base.join(" ")
})

const trackStyle = computed(() => {
  if (!isCustomColor.value) return

  return {
    backgroundColor: state.value ? props.color : "#fff",
    borderColor: state.value || props.keepColor
      ? props.color
      : "#d1d5db",
  }
})

/* ripple */
const rippleClass = computed(() => {
  const base = [
    "absolute transform scale-100 group-hover:scale-[230%]",
    sizes[props.size],
    "rounded-full pointer-events-none transition-transform",
  ]

  if (!isCustomColor.value) {
    const color = predefinedColors[props.color as Color]

    base.push(
      state.value || props.keepColor ? color.ripple : "bg-white",
      state.value || props.keepColor ? "opacity-20" : "opacity-10"
    )
  }

  return base.join(" ")
})

const rippleStyle = computed(() => {
  if (!isCustomColor.value) return

  const color = state.value || props.keepColor
    ? props.color
    : "#000"

  return { backgroundColor: `${color}33` }
})
</script>
