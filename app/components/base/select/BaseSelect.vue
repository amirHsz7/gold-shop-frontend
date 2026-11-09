<template>
  <div
    class="relative w-full outline-none cursor-pointer"
    ref="selectWrapperRef"
    :class="generalClass"
    @click="handleWrapperClick"
    @keydown.esc.prevent="closeMenu"
  >
    <BaseField
      :class="$attrs.class"
      :style="$attrs.style"
      :label="label"
      :focused="menuOpen || isFocused"
      :has-value="hasValue"
      :error="computedError"
      :error-message="computedErrorMessage"
      :disabled="disabled"
      :readonly="readonly"
      :clearable="clearable"
      :loading="loading"
      :hint="hint"
      :dense="dense"
      :hide-bottom-space="hideBottomSpace"
      @clear="onClear"
    >
      <template v-for="(_, slotName) in slotsWithoutControl" v-slot:[slotName]="slotData">
        <slot :name="slotName" v-bind="slotData || {}"></slot>
      </template>

      <template #control>
        <div
          ref="controlRef"
          class="flex items-center w-full h-full cursor-pointer outline-none min-w-0"
          :class="[dense ? 'text-sm' : 'text-base', inputClass]"
          :style="inputStyle"
          tabindex="0"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.enter.prevent="toggleMenu"
          @keydown.space.prevent="toggleMenu"
          @keydown.down.prevent="openMenu"
          @keydown.up.prevent="openMenu"
        >
          <input
            v-if="useInput"
            ref="inputRef"
            v-model="inputValue"
            type="text"
            class="h-full w-full min-w-0 bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
            :placeholder="inputPlaceholder"
            :disabled="disabled"
            :readonly="readonly"
            autocomplete="off"
            @click.stop="openMenu"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @keydown.enter.prevent="selectHighlightedOption"
            @keydown.esc.prevent="closeMenu"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
          />
          <span
            v-else-if="hasValue"
            class="text-gray-700 truncate w-full text-start"
          >
            <slot name="display-value">
              {{ displayValue }}
            </slot>
          </span>
          <span
            v-else-if="placeholder"
            class="text-gray-400 truncate w-full text-start"
          >
            {{ placeholder }}
          </span>
        </div>
      </template>

      <template #append>
        <slot name="append">
          <span
            class="inline-flex items-center justify-center text-gray-700 transition-transform duration-300 mx-2"
            :class="{ 'rotate-180': menuOpen }"
          >
            <slot name="dropdown-icon" :open="menuOpen">
              <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </slot>
          </span>
        </slot>
      </template>
    </BaseField>

    <!-- Desktop dropdown (development) -->
    <BaseMenu
      v-if="!dialog"
      v-model="menuOpen"
      :anchor-el="selectWrapperRef"
      anchor="bottom start"
      self="top start"
      :offset="[0, 4]"
      fit
      :max-height="searchable ? '300px' : '240px'"
      :content-class="[
        '!z-[100100] !rounded-md !border-gray-200 !bg-white !shadow-lg',
        popupContentClass,
      ]"
      :content-style="popupContentStyle"
    >
      <div
        v-if="searchable"
        class="p-2 border-b border-gray-200 "
        @click.stop
      >
        <BaseInput
          v-model="searchValue"
          type="text"
          :placeholder="searchPlaceholder"
          clearable
          dense
          hide-bottom-space
          @click.stop
        />
      </div>
      <ul
        class="max-h-60 overflow-y-auto py-1 text-base outline-none sm:text-sm"
      >
        <li
          v-if="filteredOptions.length === 0"
          class="px-4 py-2 text-gray-500 text-center"
        >
          گزینه‌ای موجود نیست
        </li>

        <li
          v-for="(opt, index) in filteredOptions"
          :key="index"
          @click.stop="selectOption(opt)"
          class="relative cursor-pointer select-none py-2 px-4 transition-colors duration-200"
          :class="{
            'bg-transparent text-primary-500 hover:bg-gray-100': isSelected(opt),
            'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900':
              !isSelected(opt),
          }"
        >
          <slot name="option" :opt="opt" :selected="isSelected(opt)">
            <span
              class="block truncate"
              :class="{
                'font-semibold': isSelected(opt),
                'font-normal': !isSelected(opt),
              }"
            >
              {{ getOptionLabel(opt) }}
            </span>
          </slot>
        </li>
      </ul>
    </BaseMenu>

    <!-- Mobile dialog (reports) -->
    <BaseDialog
      v-else
      v-model="menuOpen"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
      :full-width="true"
      overflow="hidden"
      custom-class="!rounded-t-2xl !rounded-b-none"
    >
      <div dir="rtl" class="flex max-h-[70dvh] w-full flex-col bg-white">
        <header
          class="flex h-16 flex-none items-center justify-between border-b border-[#E7E8EB] px-4"
        >
          <h2 class="m-0 text-base font-bold text-[#202226]">
            {{ dialogTitle || label || placeholder || 'انتخاب گزینه' }}
          </h2>

          <BaseBtn
            flat
            round
            dense
            :ripple="false"
            aria-label="بستن انتخاب گزینه"
            class="!h-9 !min-h-0 !min-w-0 !w-9 !p-1 !text-[#555966]"
            @click.stop="closeMenu"
          >
            <svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </BaseBtn>
        </header>
        <div
          v-if="searchable"
          class="flex-none border-b border-[#E7E8EB] p-3 "
        >
          <BaseInput
            v-model="searchValue"
            type="text"
            :placeholder="searchPlaceholder"
            clearable
            dense
            hide-bottom-space
          />
        </div>
        <BaseScrollArea
          vertical
          class="min-h-0"
          :class="
            searchable
              ? 'max-h-[calc(70dvh-128px)]'
              : 'max-h-[calc(70dvh-64px)]'
          "
        >
          <ul class="m-0 list-none p-2">
            <li
              v-if="filteredOptions.length === 0"
              class="px-4 py-4 text-center text-sm text-gray-500"
            >
              گزینه‌ای موجود نیست
            </li>

            <li v-for="(opt, index) in filteredOptions" :key="index">
              <BaseBtn
                flat
                full
                no-caps
                :ripple="false"
                class="!min-h-12 !w-full !justify-between !rounded-lg !px-3 !text-sm !tracking-normal"
                :class="
                  isSelected(opt)
                    ? '!bg-[#F4F4F6] !font-bold !text-[#202226]'
                    : '!bg-white !text-[#555966]'
                "
                inner-btn-class="w-full justify-between"
                @click.stop="selectOption(opt)"
              >
                <slot name="option" :opt="opt" :selected="isSelected(opt)">
                  <span class="truncate">{{ getOptionLabel(opt) }}</span>
                </slot>

                <svg
                  v-if="isSelected(opt)"
                  aria-hidden="true"
                  class="h-5 w-5 flex-none text-[#202226]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </BaseBtn>
            </li>
          </ul>
        </BaseScrollArea>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import type { PropType, StyleValue } from 'vue'
import { ref, computed, useSlots, nextTick, inject, onMounted, onBeforeUnmount, watch } from 'vue'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseDialog from '@/components/base/dialog/BaseDialog.vue'
import BaseField from '@/components/base/inputs/base-field/BaseField.vue'
import BaseMenu from '@/components/base/menu/BaseMenu.vue'
import BaseScrollArea from '@/components/base/scroll-area/BaseScrollArea.vue'
import BaseInput from '../inputs/base-input/BaseInput.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number, Object, Array, null], default: null },
  options: { type: Array as PropType<readonly unknown[]>, default: () => [] },

  optionValue: { type: [String, Function], default: 'value' },
  optionLabel: { type: [String, Function], default: 'label' },
  emitValue: { type: Boolean, default: false },
  mapOptions: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'جستجو...' },
  placeholder: String,
  displayLabel: String,
  rules: { type: Array as PropType<Array<(value: unknown) => unknown>>, default: () => [] },
  lazyRules: { type: [Boolean, String], default: false },
  error: { type: Boolean, default: null },
  errorMessage: String,
  label: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean,
  loading: Boolean,
  clearable: Boolean,
  dense: Boolean,
  multiple: Boolean,
  useInput: Boolean,
  fillInput: Boolean,
  filterFn: Function as PropType<(inputValue: string, option: unknown) => boolean>,
  hideBottomSpace: Boolean,
  generalClass: String,
  inputClass: { type: [String, Array, Object], default: '' },
  inputStyle: { type: [String, Array, Object] as PropType<StyleValue>, default: '' },
  popupContentClass: { type: String, default: '' },
  popupContentStyle: { type: [String, Array, Object] as PropType<StyleValue>, default: '' },
  // Reports-specific props
  dialog: Boolean,
  dialogTitle: String,
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'input'])
const slots = useSlots()

const selectWrapperRef = ref<HTMLElement | null>(null)
const controlRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const menuOpen = ref(false)
const isFocused = ref(false)
const inputValue = ref('')
const highlightedIndex = ref(-1)
const innerError = ref(false)
const innerErrorMessage = ref('')
const selectedValues = ref<unknown[]>([])
const searchValue = ref('')

interface FormRegistry {
  register: (component: unknown) => void
  unregister: (component: unknown) => void
}
const formRegistry = inject<FormRegistry | null>('form-registry', null)

const slotsWithoutControl = computed(() => {
  const filtered = { ...slots }
  delete filtered.control
  delete filtered.option
  delete filtered.dropdownIcon
  delete filtered['dropdown-icon']
  return filtered
})

const hasValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
})

const computedError = computed(() => (props.error !== null ? props.error : innerError.value))
const computedErrorMessage = computed(() => props.errorMessage || innerErrorMessage.value)

const getOptionValue = (opt: unknown): unknown => {
  if (opt === null || typeof opt !== 'object') return opt
  return typeof props.optionValue === 'function'
    ? props.optionValue(opt)
    : (opt as Record<string, unknown>)[props.optionValue as string]
}

const getOptionLabel = (opt: unknown): unknown => {
  if (opt === null || typeof opt !== 'object') return opt
  return typeof props.optionLabel === 'function'
    ? props.optionLabel(opt)
    : (opt as Record<string, unknown>)[props.optionLabel as string]
}

const inputPlaceholder = computed(() => {
  if (props.fillInput && hasValue.value) return String(displayValue.value ?? '')
  return props.placeholder
})

const isSelected = (opt: unknown): boolean => {
  const optVal = getOptionValue(opt)
  if (props.multiple) {
    return selectedValues.value.some((i) => getOptionValue(i) === optVal)
  } else {
    const modelVal = props.emitValue ? props.modelValue : getOptionValue(props.modelValue)
    return optVal === modelVal
  }
}

const displayValue = computed(() => {
  if (props.displayLabel) return props.displayLabel
  if (!hasValue.value) return ''

  if (props.multiple) {
    return selectedValues.value.length
      ? selectedValues.value.map((o) => getOptionLabel(o)).join(' , ')
      : props.placeholder
  }

  const targetValue = props.emitValue ? props.modelValue : getOptionValue(props.modelValue)

  const opt = props.options.find((o) => getOptionValue(o) === targetValue)

  if (opt) {
    return getOptionLabel(opt)
  }

  return props.emitValue ? props.modelValue : getOptionLabel(props.modelValue)
})

const filteredOptions = computed(() => {
  const search = searchValue.value.trim().toLocaleLowerCase()

  if (!props.searchable || search.length === 0) {
    return props.options
  }

  return props.options.filter((opt) => {
    if (props.filterFn) {
      return props.filterFn(searchValue.value, opt)
    }

    return String(getOptionLabel(opt) ?? '')
      .toLocaleLowerCase()
      .includes(search)
  })
})

const handleWrapperClick = (_event: MouseEvent) => {
  if (props.disabled || props.readonly) return
  toggleMenu()
}

const toggleMenu = () => {
  if (menuOpen.value) closeMenu()
  else openMenu()
}

const openMenu = () => {
  if (props.disabled || props.readonly) return
  menuOpen.value = true
  highlightedIndex.value = filteredOptions.value.length > 0 ? 0 : -1
  nextTick(() => {
    if (props.useInput) inputRef.value?.focus()
    else controlRef.value?.focus()
  })
}

const closeMenu = () => {
  menuOpen.value = false
  highlightedIndex.value = -1
  searchValue.value = ''

  if (props.useInput && !props.fillInput) {
    inputValue.value = ''
  }
}

const onInput = () => {
  emit('input', inputValue.value)
  if (!menuOpen.value) openMenu()
  highlightedIndex.value = filteredOptions.value.length > 0 ? 0 : -1
}

const moveHighlight = (offset: number) => {
  if (!menuOpen.value) {
    openMenu()
    return
  }

  const optionCount = filteredOptions.value.length
  if (optionCount === 0) return

  highlightedIndex.value = (highlightedIndex.value + offset + optionCount) % optionCount
}

const selectHighlightedOption = () => {
  const option = filteredOptions.value[highlightedIndex.value]
  if (option !== undefined) selectOption(option)
}

const selectOption = (opt: unknown) => {
  if (props.multiple) {
    const optValue = getOptionValue(opt)

    const index = selectedValues.value.findIndex(
      (i) => getOptionValue(i) === optValue,
    )

    if (index > -1) {
      selectedValues.value.splice(index, 1)
    } else {
      selectedValues.value.push(opt)
    }

    const valueToEmit = props.emitValue
      ? selectedValues.value.map((o) => getOptionValue(o))
      : [...selectedValues.value]

    emit('update:modelValue', valueToEmit)
  } else {
    emit(
      'update:modelValue',
      props.emitValue ? getOptionValue(opt) : opt,
    )

    closeMenu()
  }

  if (props.useInput) {
    inputValue.value = props.fillInput
      ? String(getOptionLabel(opt) ?? '')
      : ''
  }

  searchValue.value = ''

  if (!props.lazyRules && props.rules?.length > 0) {
    nextTick(validate)
  }
}

const validate = async () => {
  innerError.value = false
  innerErrorMessage.value = ''

  if (!props.rules || props.rules.length === 0) return true

  for (let i = 0; i < props.rules.length; i++) {
    const rule = props.rules[i]
    let res = rule(props.modelValue)
    if (res instanceof Promise) res = await res

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

const onFocus = (e: FocusEvent) => {
  if (props.disabled || props.readonly) return
  isFocused.value = true
  emit('focus', e)
}

const onBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
  if (props.rules.length > 0) {
    setTimeout(() => {
      validate()
    }, 150)
  }
}

const onClear = () => {
  emit('update:modelValue', null)
  emit('clear')
  resetValidation()
  closeMenu()
}

const formComponent = {
  validate,
  resetValidation,
  hasError: computedError,
}

onMounted(() => {
  if (formRegistry) formRegistry.register(formComponent)
})

onBeforeUnmount(() => {
  if (formRegistry) formRegistry.unregister(formComponent)
})

watch(
  [() => props.modelValue, () => props.options],
  ([val]) => {
    if (!props.multiple) return

    if (!Array.isArray(val)) {
      selectedValues.value = []
      return
    }

    const modelValues = val.map((value) => String(value))
    selectedValues.value = props.options.filter((opt) =>
      modelValues.includes(String(getOptionValue(opt))),
    )
  },
  { immediate: true, deep: true },
)

watch(
  () => props.modelValue,
  (value) => {
    if (!props.useInput) return
    if (value === null || value === undefined || value === '') {
      inputValue.value = ''
    }
  },
)

defineExpose(formComponent)
</script>
