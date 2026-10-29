<template>
  <div
    class="relative flex w-full flex-col"
    :class="{ 'pointer-events-none opacity-60': disabled }"
  >
    <label
      v-if="label || $slots.label"
      class="mb-1 block font-medium transition-colors duration-200"
      :class="[
        dense ? 'text-xs' : 'text-sm',
        hasError
          ? 'text-burgundy'
          : focused
            ? 'text-burgundy'
            : 'text-dark-brown',
      ]"
    >
      <slot name="label">{{ label }}</slot>
    </label>

    <div class="flex w-full items-stretch">
      <div v-if="$slots.before" class="flex items-center pe-3">
        <slot name="before"></slot>
      </div>

      <div
        class="relative flex flex-grow items-center overflow-hidden rounded-xl border bg-white transition-all duration-200"
        :class="[
          type === 'textarea'
            ? 'items-start py-2'
            : dense
              ? 'h-[2.5em]'
              : 'h-[3em]',
          hasError
            ? 'border-burgundy ring-1 ring-burgundy'
            : focused
              ? 'border-burgundy ring-1 ring-burgundy'
              : 'border-nude/30 hover:border-nude',
        ]"
      >
        <div
          v-if="$slots.prepend"
          class="flex ps-3 text-nude"
          :class="[type === 'textarea' ? 'pt-1' : 'items-center']"
        >
          <slot name="prepend"></slot>
        </div>

        <div
          class="flex h-full min-w-0 flex-grow"
          :class="[
            type !== 'textarea' ? 'items-center' : '',
            $slots.prepend ? 'ps-2' : 'ps-3',
            $slots.append ||
            (clearable && hasValue && !disabled && !readonly) ||
            loading
              ? 'pe-2'
              : 'pe-3',
          ]"
        >
          <slot name="control"></slot>
        </div>

        <div
          v-if="
            $slots.append ||
            (clearable && hasValue && !disabled && !readonly) ||
            loading
          "
          class="flex h-full gap-2 text-nude"
          :class="[
            type === 'textarea' ? 'pt-1' : 'items-center',
            $slots.append ? 'pe-3' : 'pe-3',
          ]"
        >
          <button
            v-if="clearable && hasValue && !disabled && !readonly"
            type="button"
            class="flex cursor-pointer items-center justify-center rounded-full text-nude outline-none transition-colors hover:text-burgundy"
            aria-label="پاک کردن مقدار"
            @click.stop.prevent="$emit('clear')"
          >
            <svg
              class="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
              />
            </svg>
          </button>

          <div
            v-if="loading"
            class="h-4 w-4 animate-spin rounded-full border-2 border-burgundy border-t-transparent"
            :class="dense ? 'h-4 w-4' : 'h-5 w-5'"
            role="status"
            aria-label="در حال بارگذاری"
          ></div>

          <slot name="append"></slot>
        </div>
      </div>

      <div v-if="$slots.after" class="flex items-center ps-3">
        <slot name="after" />
      </div>
    </div>

    <div
      v-if="!hideBottomSpace || hasError || hint || counter"
      class="flex justify-between pt-1"
      :class="[
        dense ? 'text-[11px]' : 'text-xs',
        hideBottomSpace ? '' : 'min-h-[20px]',
      ]"
    >
      <div
        v-if="hasError"
        class="text-burgundy"
        :class="truncateError ? 'truncate' : ''"
      >
        <slot name="error">{{ errorMessage }}</slot>
      </div>

      <div v-else-if="hint" class="truncate text-nude">
        <slot name="hint">{{ hint }}</slot>
      </div>

      <div v-else></div>

      <div v-if="counter" class="whitespace-nowrap ps-2 text-nude">
        <slot name="counter">
          {{ controlLength }} / {{ maxlength || '∞' }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps({
  type: { type: String, default: 'text' },
  label: String,
  hint: String,
  errorMessage: String,
  error: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  truncateError: { type: Boolean, default: true },
  loading: Boolean,
  clearable: Boolean,
  counter: Boolean,
  dense: Boolean,
  hideBottomSpace: Boolean,
  maxlength: [Number, String],
  focused: Boolean,
  hasValue: Boolean,
  controlLength: {
    type: Number,
    default: 0,
  },
})

defineEmits(['clear'])

const slots = useSlots()

const hasError = computed(() => props.error || !!props.errorMessage)
</script>