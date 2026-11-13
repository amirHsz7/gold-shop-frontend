<template>
  <BaseField
    :class="$attrs.class"
    :style="$attrs.style"
    :type="type"
    :label="label"
    :focused="isFocused"
    :has-value="hasValue"
    :error="computedError"
    :error-message="computedErrorMessage"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :loading="loading"
    :hint="hint"
    :counter="counter"
    :truncate-error="truncateError"
    :dense="dense"
    :hide-bottom-space="hideBottomSpace"
    :maxlength="maxlength"
    :control-length="currentLength"
    @clear="onClear"
  >
    <template v-for="(_, slotName) in slotsWithoutControl" v-slot:[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData || {}"></slot>
    </template>

    <template #control>
      <!-- حالت Input -->
      <input
        v-if="type !== 'textarea'"
        ref="inputRef"
        v-bind="inputAttrs"
        :type="type"
        :value="displayValue"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        :maxlength="maxlength"
        class="w-full h-full min-w-0 border-none bg-transparent text-dark-brown outline-none placeholder-nude"
        :class="[dense ? 'text-sm' : 'text-base', inputClass]"
        :style="inputStyle"
      />
      <!-- حالت Textarea -->
      <textarea
        v-else
        ref="inputRef"
        v-bind="inputAttrs"
        :value="displayValue"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :rows="rows"
        class="w-full h-full min-w-0 border-none bg-transparent text-dark-brown outline-none placeholder-nude"
        :class="[
          dense ? 'text-sm' : 'text-base',
          disableResize ? 'resize-none' : 'resize-y',
          inputClass,
        ]"
        :style="inputStyle"
      ></textarea>
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  useSlots,
  nextTick,
  useAttrs,
  inject,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import type { PropType } from 'vue'
import BaseField from '@/components/base/inputs/base-field/BaseField.vue'
import { formatNumber } from '@/utils/formatNumber'
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number] as PropType<string | number | null>, default: '' },
  type: { type: String, default: 'text' },
  rows: { type: [Number, String], default: 3 },
  truncateError: { type: Boolean, default: true },
  disableResize: { type: Boolean, default: false },
  boxClass: { type: [String, Array, Object], default: '' },
  financial: { type: Boolean, default: false },
  allowNegative: { type: Boolean, default: false },
  placeholder: String,
  rules: { type: Array as PropType<Array<(value: any) => boolean | string | Promise<boolean | string>>>, default: () => [] },
  lazyRules: { type: [Boolean, String], default: false },
  error: { type: Boolean, default: null },
  errorMessage: String,
  label: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean,
  loading: Boolean,
  clearable: Boolean,
  counter: Boolean,
  dense: Boolean,
  hideBottomSpace: Boolean,
  inputClass: [String, Array, Object],
  inputStyle: { type: [String, Array, Object] as PropType<string | Record<string, string | number>>, default: undefined },
  maxlength: [Number, String],
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear'])
const slots = useSlots()
const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

const isFocused = ref(false)
const innerError = ref(false)
const innerErrorMessage = ref('')

const formRegistry = inject<{ register: (component: unknown) => void; unregister: (component: unknown) => void } | null>('form-registry', null)

const inputAttrs = computed(() => {
  const result = { ...attrs }
  delete result.class
  delete result.style

  if (props.type === 'number' && !props.allowNegative && result.min === undefined) {
    result.min = 0
  }

  return result
})

const hasValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
})
const currentLength = computed(() => String(props.modelValue || '').length)

const displayValue = computed(() => {
  if (props.financial) {
    return formatNumber(Number(props.modelValue || 0))
  }
  return props.modelValue
})

const computedError = computed(() => (props.error !== null ? props.error : innerError.value))
const computedErrorMessage = computed(() => props.errorMessage || innerErrorMessage.value)

const slotsWithoutControl = computed(() => {
  const filtered = { ...slots }
  delete filtered.control
  return filtered
})

const validate = async () => {
  innerError.value = false
  innerErrorMessage.value = ''

  if (!props.rules || props.rules.length === 0) return true

  for (const rule of props.rules) {
    let res = rule(props.modelValue)

    if (res instanceof Promise) {
      res = await res
    }

    if (res === false || typeof res === 'string') {
      innerError.value = true
      innerErrorMessage.value = typeof res === 'string' ? res : ''
      return false
    }
  }
  return true
}

const resetValidation = () => {
  innerError.value = false
  innerErrorMessage.value = ''
}

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  let val = target.value

  if (props.type === 'number' && !props.allowNegative && val.includes('-')) {
    val = val.replace(/-/g, '')
    target.value = val
  }

  if (props.financial) {
    const rawNumber = val.replace(/[^\d]/g, '')
    target.value = formatNumber(Number(rawNumber))
    emit('update:modelValue', rawNumber)
  } else {
    emit('update:modelValue', val)
  }
}

const onFocus = (e: FocusEvent) => {
  if (props.disabled || props.readonly) return
  isFocused.value = true
  emit('focus', e)
}

const onBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
  if (props.rules.length > 0) {
    validate()
  }
}

const onClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  resetValidation()
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const formComponent = {
  validate,
  resetValidation,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  hasError: computedError,
}

onMounted(() => {
  if (formRegistry) {
    formRegistry.register(formComponent)
  }
})

onBeforeUnmount(() => {
  if (formRegistry) {
    formRegistry.unregister(formComponent)
  }
})

defineExpose(formComponent)
</script>
