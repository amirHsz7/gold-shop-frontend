<script setup lang="ts">
import AppFooter from '~/components/layout/AppFooter.vue';
import AppHeader from '~/components/layout/AppHeader.vue';
import MobileBottomNav from '~/components/layout/MobileBottomNav.vue';

</script>

<template>
  <div
    dir="rtl"
    class="flex min-h-screen flex-col bg-cream font-sans text-dark-brown"
  >
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

     <MobileBottomNav />
     
    <AppFooter />
  </div>
</template>
