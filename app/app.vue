<script setup lang="ts">
import AppFooter from './components/layout/AppFooter.vue';
import AppHeader from './components/layout/AppHeader.vue';

</script>


<template>
  <div dir="rtl" class="min-h-screen bg-cream">
    <AppHeader />

    <main>
      <NuxtPage />
    </main>

    <AppFooter />
  </div>
</template>
