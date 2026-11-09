<template>
  <form @submit.prevent="$emit('submit', $event)" class="w-full">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  autofocus: { type: Boolean, default: false },
  autoFocus: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

interface FormInput {
  validate?: () => boolean | Promise<boolean>
  resetValidation?: () => void
  focus?: () => void
}
const registeredInputs = ref<FormInput[]>([])

provide('form-registry', {
  register: (inputComponent: FormInput) => {
    registeredInputs.value.push(inputComponent)
  },
  unregister: (inputComponent: FormInput) => {
    const index = registeredInputs.value.indexOf(inputComponent)
    if (index > -1) {
      registeredInputs.value.splice(index, 1)
    }
  },
})

const validate = async () => {
  let isFormValid = true
  let firstInvalidInput: FormInput | null = null

  for (const input of registeredInputs.value) {
    if (typeof input.validate === 'function') {
      const isInputValid = await input.validate()
      if (!isInputValid) {
        isFormValid = false
        if (!firstInvalidInput) {
          firstInvalidInput = input
        }
      }
    }
  }

  if (!isFormValid && firstInvalidInput && typeof firstInvalidInput.focus === 'function') {
    firstInvalidInput.focus()
  }

  return { valid: isFormValid }
}

const resetValidation = () => {
  for (const input of registeredInputs.value) {
    if (typeof input.resetValidation === 'function') {
      input.resetValidation()
    }
  }
}

const focus = () => {
  for (const input of registeredInputs.value) {
    if (typeof input.focus === 'function') {
      input.focus()
      break
    }
  }
}

onMounted(() => {
  if (props.autofocus || props.autoFocus) {
    nextTick(() => {
      setTimeout(() => {
        focus()
      }, 100)
    })
  }
})

defineExpose({
  validate,
  focus,
  resetValidation
})
</script>
