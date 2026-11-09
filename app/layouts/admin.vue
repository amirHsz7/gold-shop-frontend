
Admin · VUE
<script setup lang="ts">
useHead({ htmlAttrs: { dir: 'rtl', lang: 'fa' } })
 
const route = useRoute()
const { close } = useAdminSidebar()
 
// با تغییر صفحه، سایدبار موبایل بسته شود
// (Escape و قفل اسکرول را خود BaseDialog مدیریت می‌کند)
watch(() => route.fullPath, close)
 
// اگر سایدبار موبایل باز بود و صفحه به سایز دسکتاپ رسید، ببندش
// تا قفل اسکرول body آزاد شود
let mql: MediaQueryList | undefined
const onBreakpoint = (e: MediaQueryListEvent) => {
  if (e.matches) close()
}
onMounted(() => {
  mql = window.matchMedia('(min-width: 1024px)')
  mql.addEventListener('change', onBreakpoint)
})
onBeforeUnmount(() => mql?.removeEventListener('change', onBreakpoint))
</script>
 
<template>
  <div class="min-h-dvh bg-gray-50">
    <AdminSidebar />
 
    <!-- در دسکتاپ به اندازه عرض سایدبار از راست فاصله می‌گیرد -->
    <div class="flex min-h-dvh flex-col lg:ms-64">
      <AdminHeader />
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>