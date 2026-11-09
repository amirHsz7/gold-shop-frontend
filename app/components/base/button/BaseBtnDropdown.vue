<script setup lang="ts">
import { ref, watch } from 'vue'

import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseBtnGroup from '@/components/base/button/BaseBtnGroup.vue'
import BaseMenu from '@/components/base/menu/BaseMenu.vue'

const props = defineProps({
  label: String,
  icon: String,
  color: String,
  textColor: String,
  flat: Boolean,
  anchor: String,
  self: String,
  outline: Boolean,
  unelevated: Boolean,
  rounded: Boolean,
  dense: Boolean,
  disable: Boolean,
  containerClass: String,
  padding: String,
  noCaps: Boolean,
  dropDownIconSize: { type: String, default: '16px' },
  modelValue: { type: Boolean, default: false },
  split: { type: Boolean, default: false },
  dropdownIcon: String,
  autoClose: { type: Boolean, default: true },
  menuClass: { type: String, default: 'min-w-[12rem] bg-white' },
})

const emit = defineEmits(['update:modelValue', 'click', 'show', 'hide'])

const isOpen = ref(props.modelValue)
const isClosing = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal
  },
)

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
  emit(newVal ? 'show' : 'hide')
})

defineOptions({
  inheritAttrs: false
})

function toggle(e: MouseEvent) {
  if (props.disable) return;
  
  if (isClosing.value) return; 

  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation(); 
  }
  isOpen.value = !isOpen.value;
}

function close() {
  if (isOpen.value) {
    isOpen.value = false;
    
    isClosing.value = true;
    setTimeout(() => {
      isClosing.value = false;
    }, 150);
  }
}

function onMainBtnClick(e: MouseEvent) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation(); 
  }
  if (props.split) {
    emit('click', e);
  } else {
    toggle(e);
  }
}

function onMenuContentClick() {
  if (props.autoClose) close()
}

defineExpose({
  toggle,
  close,
  show: () => {
    isOpen.value = true
  },
})
</script>

<template>
  <!-- حالت Split -->
  <div v-if="split" class="relative inline-block">
    <BaseBtnGroup
      :flat="flat"
      :outline="outline"
      v-bind="$attrs"
      :unelevated="unelevated"
      :rounded="rounded"
    >
      <BaseBtn
        :label="label"
        :icon="icon"
        :color="color"
        :text-color="textColor"
        :flat="flat"
        v-bind="$attrs"
        :outline="outline"
        :unelevated="unelevated"
        :dense="dense"
        :disable="disable"
        :padding="padding"
        :no-caps="noCaps"
        @click="onMainBtnClick"
      >
        <slot name="label" />
      </BaseBtn>

      <BaseBtn
        :color="color"
        :text-color="textColor"
        :flat="flat"
        :outline="outline"
        :unelevated="unelevated"
        :dense="dense"
        v-bind="$attrs"
        :disable="disable"
        padding="none"
        class="px-2 border-s border-current/20"
        @click="toggle"
      >
        <slot name="dropdown-icon">
          <i
            v-if="dropdownIcon"
            :class="[
              dropdownIcon,
              'transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ]"
          />
          <svg
            v-else
            class="transition-transform duration-200"
            :class="isOpen ? 'rotate-180' : ''"
            :width="dropDownIconSize"
            :height="dropDownIconSize"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </slot>
      </BaseBtn>
    </BaseBtnGroup>
    
    <!-- منو هم‌نیا (Sibling) گروه دکمه‌ها -->
    <BaseMenu :contentClass="menuClass" v-model="isOpen">
      <div @click.stop="onMenuContentClick" @mousedown.stop>
        <slot />
      </div>
    </BaseMenu>
  </div>

  <!-- حالت عادی (Non-split) -->
  <div v-else :class="containerClass" class="relative inline-block">
    <BaseBtn
      :color="color"
      :text-color="textColor"
      :flat="flat"
      :outline="outline"
      :unelevated="unelevated"
      :rounded="rounded"
      :dense="dense"
      v-bind="$attrs"
      :disable="disable"
      :padding="padding"
      :no-caps="noCaps"
      @click="onMainBtnClick"
    >
      <span class="flex items-center gap-2">
        <slot name="label">
          <i v-if="icon" :class="icon" />
          <span v-if="label">{{ label }}</span>
        </slot>

        <slot name="dropdown-icon">
          <i
            v-if="dropdownIcon"
            :class="[
              dropdownIcon,
              'transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ]"
          />
          <svg
            v-else
            class="transition-transform duration-200"
            :class="isOpen ? 'rotate-180' : ''"
            fill="none"
            :width="dropDownIconSize"
            :height="dropDownIconSize"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </slot>
      </span>
    </BaseBtn>

    <!-- منو هم‌نیا (Sibling) دکمه اصلی -->
    <BaseMenu :contentClass="menuClass" v-model="isOpen" :anchor="anchor" :self="self">
      <div @click.stop="onMenuContentClick" @mousedown.stop>
        <slot />
      </div>
    </BaseMenu>
  </div>
</template>
