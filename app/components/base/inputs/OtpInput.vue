<template>
  <div class="w-full">
  <div
    class="flex justify-center items-center gap-3 sm:gap-4"
    dir="ltr"
    @click="focusFirstEmpty"
  >
    <input
      v-for="(digit, i) in OTP_LENGTH"
      :key="i"
      ref="inputs"
      type="text"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      class="
        w-12 sm:w-14
        h-12 sm:h-14
        flex-shrink-0
        text-center
        border
        rounded-xl
        text-xl
        sm:text-2xl
        font-bold
        focus:outline-none
        transition-colors
      "
      :class="boxClass(i)"
      :value="code[i] || ''"
      @input="onInput($event, i)"
      @keydown.backspace.prevent="onBackspace($event, i)"
      @paste.prevent="onPaste($event, i)"
      @focus="isFocusedIndex = i"
      @blur="isFocusedIndex = -1"
    />
  </div>

    <div
      v-if="hasError"
      class="text-red text-xs sm:text-sm mt-2"
    >
      {{ localError || errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, inject } from 'vue'

type OtpRule = (value: string) => boolean | string

const props = withDefaults(
  defineProps<{
    modelValue?: string
    rules?: OtpRule[]
    error?: boolean
    errorMessage?: string
  }>(),
  {
    modelValue: '',
    rules: () => [],
    error: false,
    errorMessage: '',
  },
)

const emit = defineEmits(['update:modelValue'])

const form = inject('form-registry', null as any)

const OTP_LENGTH = 6
const code = ref(Array(OTP_LENGTH).fill(''))
const inputs = ref<(HTMLInputElement | null)[]>([])
const isFocusedIndex = ref(-1)
const localError = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (val && val.length === OTP_LENGTH) {
      code.value = val.split('').slice(0, OTP_LENGTH)
    } else if (!val) {
      code.value = Array(OTP_LENGTH).fill('')
    }
  },
  { immediate: true },
)

function validate() {
  localError.value = ''
  const strCode = code.value.join('')
  for (const rule of props.rules) {
    const result = rule(strCode)
    if (result !== true) {
      localError.value = typeof result === 'string' ? result : 'کد وارد شده معتبر نیست'
      return false
    }
  }
  return true
}

function resetValidation() {
  localError.value = ''
}

function reset() {
  code.value = Array(OTP_LENGTH).fill('')
  emit('update:modelValue', '')
  resetValidation()
}

const hasError = computed(() => !!localError.value || props.error)

function boxClass(i: number) {
  if (hasError.value) return 'border-red'
  if (isFocusedIndex.value === i) return 'border-burgundy ring-1 ring-burgundy'
  return 'border-gray-300 hover:border-gray-400'
}

function emitChange() {
  const str = code.value.join('')
  emit('update:modelValue', str)
}

function focusInput(index: number) {
  nextTick(() => {
    inputs.value[index]?.focus()
    inputs.value[index]?.select()
  })
}

function focusFirstEmpty() {
  const emptyIndex = code.value.findIndex((c) => !c)
  focusInput(emptyIndex === -1 ? OTP_LENGTH - 1 : emptyIndex)
}

function onInput(e: Event, idx: number) {
  const el = e.target as HTMLInputElement
  const val = el.value.replace(/\D/g, '')
  if (!val) {
    el.value = ''
    return
  }
  code.value[idx] = val[0]
  emitChange()
  if (idx < OTP_LENGTH - 1) {
    focusInput(idx + 1)
  } else {
    el.blur()
  }
}

function onBackspace(e: KeyboardEvent, idx: number) {
  if (code.value[idx]) {
    code.value[idx] = ''
    emitChange()
    return
  }
  if (idx > 0) {
    code.value[idx - 1] = ''
    emitChange()
    focusInput(idx - 1)
  }
}

function onPaste(e: ClipboardEvent, idx: number) {
  const pasteData = e.clipboardData?.getData('text') || ''
  const filtered = pasteData.replace(/\D/g, '').slice(0, OTP_LENGTH - idx)
  if (!filtered) return
  for (let i = 0; i < filtered.length; i++) {
    code.value[idx + i] = filtered[i]
  }
  emitChange()
  const lastIndex = Math.min(idx + filtered.length, OTP_LENGTH - 1)
  focusInput(lastIndex)
}

const field = {
  validate,
  resetValidation,
  reset,
  focus: focusFirstEmpty,
}

onMounted(() => {
  form?.register(field)
})

onBeforeUnmount(() => {
  form?.unregister(field)
})

defineExpose({
  validate,
  reset,
  resetValidation,
  focus: focusFirstEmpty,
})
</script>
