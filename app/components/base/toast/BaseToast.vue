<template>
  <!-- <Teleport to="body"> -->
    <div :class="['fixed z-[999999999] pointer-events-none flex flex-col gap-2.5', positionClasses]">
      
      <transition-group 
        name="toast-list" 
        tag="div" 
        class="flex flex-col gap-2.5 w-full"
        enter-active-class="transition-all duration-300 ease-out"
        :enter-from-class="transitionClasses.enterFrom"
        enter-to-class="opacity-100 translate-x-0 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-x-0 translate-y-0"
        :leave-to-class="transitionClasses.leaveTo"
        move-class="transition-transform duration-300 ease-in-out"
      >
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="[
            'px-4 py-3 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] pointer-events-auto transition-all duration-300 ease min-w-[250px] max-w-[350px]',
            getToastColors(toast).class
          ]"
          :style="getToastColors(toast).style"
        >
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium leading-tight">{{ toast.message }}</span>
            <span v-if="toast.caption" class="text-xs opacity-80 leading-tight">{{ toast.caption }}</span>
          </div>
        </div>
      </transition-group>
    </div>
  <!-- </Teleport> -->
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from '@/composables/useToast'; 

const { toasts, globalPosition } = useToast();

const positionClasses = computed(() => {
  const positions = {
    'top-right': 'top-5 right-5 items-end',
    'top-left': 'top-5 left-5 items-start',
    'bottom-right': 'bottom-5 right-5 items-end',
    'bottom-left': 'bottom-5 left-5 items-start',
    'top': 'top-5 left-1/2 -translate-x-1/2 items-center',
    'bottom': 'bottom-5 left-1/2 -translate-x-1/2 items-center',
  };
  return positions[globalPosition.value as keyof typeof positions] || positions['top-right'];
});

const transitionClasses = computed(() => {
  if (globalPosition.value.includes('left')) {
    return {
      enterFrom: 'opacity-0 -translate-x-[30px]',
      leaveTo: 'opacity-0 -translate-x-[30px]',
    };
  } else if (globalPosition.value === 'top' || globalPosition.value === 'bottom') {
    const isTop = globalPosition.value === 'top';
    return {
      enterFrom: `opacity-0 ${isTop ? '-translate-y-[30px]' : 'translate-y-[30px]'}`,
      leaveTo: `opacity-0 ${isTop ? '-translate-y-[30px]' : 'translate-y-[30px]'}`,
    };
  } else {
    return {
      enterFrom: 'opacity-0 translate-x-[30px]',
      leaveTo: 'opacity-0 translate-x-[30px]',
    };
  }
});

interface ToastItem { id: string | number; message: string; caption?: string | null; color?: string; textColor?: string }
const getToastColors = (toast: ToastItem) => {
  const color = toast.color || 'info';
  const textColor = toast.textColor;

  const presets = {
    primary: 'bg-burgundy text-white',
    blue: 'bg-blue-700 text-white',
    red: 'bg-red-700 text-white',
    green: 'bg-green-700 text-white',
    yellow: 'bg-yellow text-white',
    indigo: 'bg-indigo text-white',
  };

  let classes: string[] = [];
  let styles: Record<string, string> = {};

  if (color in presets) {
    classes.push(presets[color as keyof typeof presets]);
  } else if (color.startsWith('#') || color.startsWith('rgb')) {
    styles.backgroundColor = color;
    if (!textColor) styles.color = '#ffffff'; 
  } else {
    classes.push(color); 
  }

  if (textColor) {
    if (textColor.startsWith('#') || textColor.startsWith('rgb')) {
      styles.color = textColor; 
    } else {
      classes.push(textColor); 
    }
  }

  return { class: classes.join(' '), style: styles };
}
</script>
