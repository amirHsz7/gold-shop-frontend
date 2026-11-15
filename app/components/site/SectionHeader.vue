<template>
  <header class="mb-5 flex items-center gap-4 lg:mb-8 lg:gap-6" dir="rtl">
    <!-- عنوان و زیرعنوان (زیرعنوان فقط وقتی هست که ادمین پر کرده باشد) -->
    <div class="min-w-0 shrink-0">
      <h2
        :id="id"
        class="m-0 text-xl font-bold text-burgundy lg:text-3xl"
      >
        {{ title }}
      </h2>

      <p
        v-if="subtitle"
        class="m-0 mt-1 line-clamp-2 max-w-[16rem] text-xs text-dark-gray sm:max-w-sm lg:mt-1.5 lg:max-w-md lg:text-sm"
      >
        {{ subtitle }}
      </p>
    </div>

    <!-- خط گرادیانی با عرض ثابت: کنار عنوان (راست) پررنگ و به سمت چپ محو می‌شود -->
    <span
      class="h-px w-16 shrink bg-linear-to-l from-burgundy/70 to-transparent sm:w-28 lg:w-44"
      aria-hidden="true"
    />

    <!-- فضای خالی بین خط و لینک -->
    <span class="flex-1" aria-hidden="true" />

    <NuxtLink
      v-if="to"
      :to="to"
      class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-burgundy transition-opacity hover:opacity-70 lg:text-base"
    >
      {{ linkLabel }}
      <Icon name="lucide:arrow-left" size="18px" />
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    // متن کوچک زیر عنوان (اختیاری)
    subtitle?: string | null
    // برای aria-labelledby بخش
    id?: string
    // خالی یعنی لینک «مشاهده همه» نمایش داده نمی‌شود
    to?: RouteLocationRaw
    linkLabel?: string
  }>(),
  { subtitle: null, linkLabel: 'مشاهده همه' },
)
</script>