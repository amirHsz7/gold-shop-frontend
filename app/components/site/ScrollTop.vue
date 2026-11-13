<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="translate-y-2 opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="translate-y-2 opacity-0"
  >
    <BaseBtn
      v-if="visible"
      round
      size="md"
      color="burgundy"
      class="!fixed bottom-24 right-4 z-30 shadow-lg lg:bottom-6 lg:right-6"
      aria-label="بازگشت به بالای صفحه"
      @click="scrollToTop"
    >
      <template #icon>
        <Icon name="lucide:arrow-up" size="20px" />
      </template>
    </BaseBtn>
  </Transition>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'

const SHOW_AFTER_PX = 500

const visible = ref(false)

const onScroll = () => {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>