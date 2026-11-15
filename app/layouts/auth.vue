<script setup lang="ts">
</script>

<template>
  <div
    dir="rtl"
    class="flex min-h-dvh flex-col bg-cream font-sans text-dark-brown lg:h-dvh lg:overflow-hidden"
  >
    <SiteHeader class="shrink-0" />

    <main class="flex min-h-0 flex-1 flex-col">
      <slot />
    </main>
  </div>
</template>