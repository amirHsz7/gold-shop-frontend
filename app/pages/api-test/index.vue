
<script setup lang="ts">
import { healthRepository } from '~/repositories/health';

const healthRepo = healthRepository()

const {
  data,
  status,
  error,
  refresh,
} = await healthRepo.checkHealth()
console.log('sss',status);

</script>

<template>
  <main class="p-6" dir="rtl">
    <h1 class="mb-4 text-2xl font-bold">
      تست اتصال به بک‌اند
    </h1>

    <p v-if="status === 'pending'">
      در حال بررسی اتصال...
    </p>

    <p v-else-if="error" class="text-red-600">
      خطا در اتصال: {{ error.message }}
    </p>

    <div v-else>
      <p>وضعیت پاسخ: {{ data?.status }}</p>

      <button
        class="mt-4 rounded bg-gray-900 px-4 py-2 text-white"
        @click="refresh()"
      >
        تست مجدد
      </button>
    </div>
  </main>
</template>
