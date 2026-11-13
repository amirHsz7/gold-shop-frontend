<template>
  <span
    ref="anchorMarkerRef"
    class="hidden"
    style="display: none !important"
    aria-hidden="true"
  ></span>

  <Teleport v-if="teleportTarget" :to="teleportTarget">
    <Transition name="menu" :css="!noTransition">
      <div
        v-if="visible"
        ref="menuRef"
        class="menu overflow-hidden fixed z-[6000] bg-white border border-gray-200"
        :class="[
          contentClass,
          {
            'rounded-md': round,
            'shadow-md': shadow
          }
        ]"
        :style="contentStyle"
        @click.stop="onMenuClick" 
        @mousedown.stop
        @touchstart.stop
        v-bind="$attrs"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { setPosition, parsePosition } from '@/utils/position-engine'

interface MenuProps {
  modelValue?: boolean
  anchor?: string
  self?: string
  anchorEl?: HTMLElement | Record<string, any> | null
  fit?: boolean
  cover?: boolean
  offset?: [number, number]
  touchPosition?: boolean
  persistent?: boolean
  autoClose?: boolean
  maxHeight?: string | null
  maxWidth?: string | null
  contentClass?: string | unknown[] | Record<string, any>
  contentStyle?: any
  round?: boolean
  shadow?: boolean
  noTransition?: boolean
  delay?: number
}

const props = withDefaults(defineProps<MenuProps>(), {
  modelValue: false,
  anchor: 'bottom start',
  self: 'top start',
  anchorEl: null,
  fit: false,
  cover: false,
  offset: () => [0, 0] as [number, number],
  touchPosition: false,
  persistent: false,
  autoClose: false,
  maxHeight: null,
  maxWidth: null,
  contentClass: '',
  contentStyle: '',
  round: true,
  shadow: true,
  noTransition: false,
  delay: 0,
})

const emit = defineEmits(['update:modelValue', 'before-show', 'show', 'before-hide', 'hide'])

const menuRef = ref<HTMLElement | null>(null)
const anchorMarkerRef = ref<HTMLElement | null>(null)
const teleportTarget = ref<HTMLElement | null>(null)
const visible = ref(false)

let resizeObserver: ResizeObserver | null = null
let showTimer: ReturnType<typeof setTimeout> | null = null

const getTargetAnchor = () => {
  if (props.anchorEl) {
    if (props.anchorEl instanceof HTMLElement) return props.anchorEl
    const el = (props.anchorEl as any).$el
    return el instanceof HTMLElement ? el : null
  }

  if (!anchorMarkerRef.value) return null

  let target: HTMLElement | null = anchorMarkerRef.value.parentElement
  const parentBtn = anchorMarkerRef.value.closest('button, .btn') as HTMLElement | null

  if (parentBtn) {
    target = parentBtn

    let groupContainer = parentBtn.closest('.btn-group, [class*="btn-group"]') as HTMLElement | null

    if (!groupContainer) {
      let parent = parentBtn.parentElement
      while (parent && parent !== document.body) {
        const btns = parent.querySelectorAll('button, .btn')
        if (btns.length === 2 && Array.from(btns).includes(parentBtn)) {
          groupContainer = parent as HTMLElement
          break
        } else if (btns.length > 2 && Array.from(btns).includes(parentBtn)) {
          break
        }
        parent = parent.parentElement
      }
    }

    if (groupContainer) {
      const btns = groupContainer.querySelectorAll('button, .btn')
      if (btns.length === 2) {
          target = groupContainer as HTMLElement
      }
    }
  }

  return target
}

const calculatePosition = () => {
  if (!menuRef.value || !anchorMarkerRef.value) return

  const targetAnchor = getTargetAnchor()
  if (!targetAnchor) return

  const isRtl = window.getComputedStyle(document.body).direction === 'rtl'

  const anchorOrigin = parsePosition(props.anchor, isRtl)
  const selfOrigin = parsePosition(props.self, isRtl)

  let absoluteOffset: { top: number; left: number } | undefined
  const globalClick = globalThis as typeof globalThis & {
    globalLastClickX?: number
    globalLastClickY?: number
  }
  if (props.touchPosition && globalClick.globalLastClickY !== undefined && globalClick.globalLastClickX !== undefined) {
    absoluteOffset = {
      top: globalClick.globalLastClickY,
      left: globalClick.globalLastClickX,
    }
  }

  setPosition({
    targetEl: menuRef.value,
    anchorEl: targetAnchor,
    offset: props.offset,
    anchorOrigin,
    selfOrigin,
    absoluteOffset,
    fit: props.fit,
    cover: props.cover,
    maxHeight: props.maxHeight ?? undefined,
    maxWidth: props.maxWidth ?? undefined,
    positionType: 'fixed', 
  })
}

const onClickOutside = (e: MouseEvent | TouchEvent) => {
  if (props.persistent || !props.modelValue) return

  const path = e.composedPath();

  if (menuRef.value && path.includes(menuRef.value)) return

  const targetAnchor = getTargetAnchor()
  if (targetAnchor && path.includes(targetAnchor)) return

  close()
}

const onGlobalScroll = () => {
  if (props.modelValue) {
    calculatePosition()
  }
}

const attachEvents = () => {
  setTimeout(() => {
    window.addEventListener('mousedown', onClickOutside)
    window.addEventListener('touchstart', onClickOutside)
    window.addEventListener('scroll', onGlobalScroll, true)
  }, 0)
}

const detachEvents = () => {
  window.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('touchstart', onClickOutside)
  window.removeEventListener('scroll', onGlobalScroll, true)
}

const setupResizeObserver = () => {
  destroyResizeObserver()
  if (menuRef.value) {
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (props.modelValue) calculatePosition()
      })
    })
    resizeObserver.observe(menuRef.value)
  }
}

const destroyResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

const showMenu = async () => {
  if (!props.modelValue) return
  emit('before-show')
  visible.value = true
  await nextTick()
  setupResizeObserver()
  attachEvents()

  await new Promise((resolve) => requestAnimationFrame(resolve))
  calculatePosition()

  emit('show')
}

const hideMenu = () => {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (!visible.value) return

  emit('before-hide')
  visible.value = false
  destroyResizeObserver()
  detachEvents()
  emit('hide')
}

const scheduleShow = () => {
  if (showTimer) clearTimeout(showTimer)

  if (props.delay > 0) {
    showTimer = setTimeout(() => {
      showTimer = null
      void showMenu()
    }, props.delay)
    return
  }

  void showMenu()
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      scheduleShow()
    } else {
      hideMenu()
    }
  },
)

watch(
  () => props.anchorEl,
  async () => {
    if (!props.modelValue) return
    await nextTick()
    calculatePosition()
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const onMenuClick = () => {
  if (props.autoClose) close()
}

onMounted(() => {
  if (anchorMarkerRef.value) {
    const rootNode = anchorMarkerRef.value.getRootNode()
    const queryRoot = rootNode as ParentNode
    const candidate = queryRoot.querySelector('body')
    teleportTarget.value = candidate instanceof HTMLElement ? candidate : null
  }

  if (props.modelValue) {
    scheduleShow()
  }
})

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  destroyResizeObserver()
  detachEvents()
})

defineExpose({
  updatePosition: calculatePosition,
  close,
})
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
