<script setup lang="ts">
const { isOpen, toggle } = useAdminSidebar()
</script>
 
<template>
  <header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur">
    <!-- دکمه همبرگری فقط در موبایل -->
    <button
      type="button"
      class="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
      aria-label="باز کردن منو"
      aria-controls="admin-sidebar"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
 
    <h1 class="text-sm font-semibold text-gray-800">
      <slot name="title">مدیریت</slot>
    </h1>
 
    <!-- سمت چپ هدر -->
    <div class="ms-auto flex items-center gap-2">
      <slot name="actions" />
      <div class="grid size-8 place-items-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
        A
      </div>
    </div>
  </header>
</template>