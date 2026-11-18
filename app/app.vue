<template>
  <NuxtLayout>
    <NuxtPage />
    <BaseToast />
  </NuxtLayout>
</template>

<script setup lang="ts">
// عنوان همه‌ی صفحه‌ها: «عنوان | نام سایت» (اگر نام سایت از قبل در عنوان بود تکرار نمی‌شود)
useHead({
  titleTemplate: (title) =>
    !title || title.includes(SITE_NAME) ? title || SITE_NAME : `${title} | ${SITE_NAME}`,
})
</script>