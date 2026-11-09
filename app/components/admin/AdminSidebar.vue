<script setup lang="ts">
const { isOpen, close } = useAdminSidebar()
</script>
 
<template>
  <!-- دسکتاپ: سایدبار ثابت سمت راست -->
  <aside class="fixed inset-y-0 start-0 z-40 hidden w-64 border-s border-gray-200 lg:block">
    <AdminSidebarContent />
  </aside>
 
  <!--
    موبایل: سایدبار کشویی با BaseDialog
    نکته: چون صفحه dir="rtl" است، position="left" (یعنی justify-start) در عمل سمت راست قرار می‌گیرد.
    ورود از راست با slide-right و خروج به راست با slide-left.
  -->
  <BaseDialog
    v-model="isOpen"
    position="left"
    full-height
    transition-show="slide-right"
    transition-hide="slide-left"
    overflow="hidden"
    custom-class="!w-72 !max-w-[85vw] !rounded-none lg:hidden"
    custom-main-class="lg:hidden"
  >
    <AdminSidebarContent closable @close="close" />
  </BaseDialog>
</template>
 