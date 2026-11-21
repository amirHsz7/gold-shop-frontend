<template>
  <div class="relative h-8 w-full select-none" :class="{ 'opacity-50': disabled }">
    <!-- ریل و بازه‌ی انتخاب‌شده (به اندازه‌ی نصف دستگیره از دو طرف فاصله دارد) -->
    <div class="pointer-events-none absolute inset-y-0 inset-x-3" aria-hidden="true">
      <div class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray" />
      <div
        class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gold"
        :style="fillStyle"
      />
    </div>

    <input
      type="range"
      class="range-input"
      :min="min"
      :max="max"
      :step="step"
      :value="low"
      :disabled="disabled"
      :aria-label="minLabel"
      :style="{ zIndex: lowOnTop ? 3 : 2 }"
      @input="onLow"
      @change="emitChange"
    >

    <input
      type="range"
      class="range-input"
      :min="min"
      :max="max"
      :step="step"
      :value="high"
      :disabled="disabled"
      :aria-label="maxLabel"
      style="z-index: 2"
      @input="onHigh"
      @change="emitChange"
    >
  </div>
</template>

<script setup lang="ts">
type Range = [number, number]

const props = withDefaults(
  defineProps<{
    modelValue: Range
    min: number
    max: number
    step?: number
    disabled?: boolean
    minLabel?: string
    maxLabel?: string
  }>(),
  { step: 1, disabled: false, minLabel: 'حداقل', maxLabel: 'حداکثر' },
)

const emit = defineEmits<{
  'update:modelValue': [value: Range]
  // فقط وقتی کاربر دستگیره را رها می‌کند (یا با کیبورد تغییر می‌دهد)
  change: [value: Range]
}>()

const low = ref(props.modelValue[0])
const high = ref(props.modelValue[1])

watch(
  () => props.modelValue,
  ([nextLow, nextHigh]) => {
    low.value = nextLow
    high.value = nextHigh
  },
)

// اگر هر دو دستگیره به انتهای بالا رسیدند، دستگیره‌ی پایین باید روی دیگری باشد تا قابل کشیدن بماند
const lowOnTop = computed(() => low.value > (props.min + props.max) / 2)

const percent = (value: number) =>
  props.max > props.min ? ((value - props.min) / (props.max - props.min)) * 100 : 0

// ویژگی‌های منطقی (inset-inline) با جهت RTL هماهنگ‌اند و input range هم در RTL برعکس می‌شود
const fillStyle = computed(() => ({
  insetInlineStart: `${percent(low.value)}%`,
  insetInlineEnd: `${100 - percent(high.value)}%`,
}))

const onLow = (event: Event) => {
  const input = event.target as HTMLInputElement

  low.value = Math.min(Number(input.value), high.value)
  input.value = String(low.value)
  emit('update:modelValue', [low.value, high.value])
}

const onHigh = (event: Event) => {
  const input = event.target as HTMLInputElement

  high.value = Math.max(Number(input.value), low.value)
  input.value = String(high.value)
  emit('update:modelValue', [low.value, high.value])
}

const emitChange = () => emit('change', [low.value, high.value])
</script>

<style scoped>
/* دو input روی هم‌اند؛ فقط دستگیره‌ها رویداد ماوس و لمس می‌گیرند */
.range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  appearance: none;
  -webkit-appearance: none;
}

.range-input:focus {
  outline: none;
}

.range-input::-webkit-slider-runnable-track {
  height: 100%;
  background: transparent;
}

.range-input::-moz-range-track {
  height: 100%;
  background: transparent;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  width: 24px;
  height: 24px;
  margin-top: 4px;
  border-radius: 9999px;
  border: 2px solid var(--color-gold);
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.2);
  cursor: grab;
}

.range-input::-moz-range-thumb {
  pointer-events: auto;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  border: 2px solid var(--color-gold);
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.2);
  cursor: grab;
}

.range-input:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 2px;
}

.range-input:focus-visible::-moz-range-thumb {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 2px;
}

.range-input:active::-webkit-slider-thumb {
  cursor: grabbing;
}
</style>