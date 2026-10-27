<template>
  <Teleport v-if="isMounted && targetNode" :to="targetNode">
    <div
      class="fixed inset-0 max-h-[100dvh] z-[100] flex no-scrollbar"
      :class="[positionClasses, customMainClass, modelValue ? 'pointer-events-auto' : 'pointer-events-none']"
    >
      <!-- Backdrop -->
      <Transition name="backdrop-fade" appear>
        <div
          v-if="modelValue"
          class="absolute inset-0 bg-black/30"
          @click="closeDialog"
        />
      </Transition>

      <!-- Dialog -->
      <Transition :name="transitionName" appear>
        <div
          v-if="modelValue"
          :style="dialogStyles"
          :class="[dialogClasses, { shake: isShaking }]"
        >
          <slot />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { toggleBodyScroll } from '@/utils/scroll';

type Position = 'top' | 'right' | 'left' | 'bottom' | 'center'
type TransitionType = 'fade' | 'slide-down' | 'slide-up' |  'fade-slide-up'  |  'fade-slide-down' |  'slide-left' | 'slide-right' 

interface Props {
  modelValue: boolean
  persistent?: boolean
  transitionShow?: TransitionType
  transitionHide?: TransitionType
  position?: Position
  maximized?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
  overflow?: string
  customClass?: string
  customMainClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
  transitionShow: 'fade',
  transitionHide: 'fade',
  position: 'center',
  maximized: false,
  fullWidth: false,
  fullHeight: false,
  overflow: 'auto'
})

const emit = defineEmits<Emits>()

const isShaking = ref(false)
const isMounted = ref(false)
const targetNode = ref<Element | null>(null)

const closeDialog = () => {
  if (props.persistent) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 500) 
    return
  }
  emit('update:modelValue', false)
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeDialog()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  
  // Shadow DOM Aware Teleportation Logic
  const instance = getCurrentInstance();
  const rootElement = instance?.vnode.el?.getRootNode();
  
  if (rootElement instanceof ShadowRoot) {
    targetNode.value = rootElement.querySelector('body');
  } else {
    targetNode.value = document.querySelector('body') || document.body;
  }
  
  isMounted.value = true;
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'items-start justify-center'
    case 'bottom':
      return 'items-end justify-center'
    case 'left':
      return 'items-center justify-start'
    case 'right':
      return 'items-center justify-end'
    default:
      return 'items-center justify-center'
  }
})

const dialogClasses = computed(() => {
  const base = 'bg-white rounded-lg shadow-2xl relative z-[100000] transition-transform scale-100 flex flex-col'
  
  if (props.maximized) {
    return `${base} !rounded-none`
  }
  
  return `${base} overflow-${props.overflow} ${props.customClass || ''}`
})

const dialogStyles = computed(() => {
  if (props.maximized) {
    return { width: '100vw', height: '100dvh' }
  }
  
  return {
    width: props.fullWidth ? '98vw' : '100%',
    maxWidth: props.fullWidth ? 'none' : '672px',
    marginLeft: props.fullWidth || props.fullHeight ? '0' : '1rem',   
    marginRight: props.fullWidth || props.fullHeight ? '0' : '1rem',
    height: props.fullHeight ? '100dvh' : 'auto',
    maxHeight: props.fullHeight ? 'none' : '90dvh' 
  }
})

const transitionName = computed(() => {
  return props.modelValue ? props.transitionShow : props.transitionHide
})

watch(() => props.modelValue, (newValue) => {
  toggleBodyScroll(newValue);
});
</script>

<style scoped>
/* استایل‌ها بدون تغییر باقی می‌مانند */
:host {
  display: block;
}
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out; 
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.1) !important; 
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1) !important;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from {
  transform: translateY(-100%);
}
.slide-down-leave-to {
  transform: translateY(100%);
}
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-up-leave-to {
  transform: translateY(-100%);
}
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}
.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-leave-to {
  transform: translateX(100%);
}
@keyframes shake {
  0%, 100% {
    transform: translateY(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateY(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateY(5px);
  }
}
.shake {
  animation: shake 0.5s ease-in-out;
}
</style>
