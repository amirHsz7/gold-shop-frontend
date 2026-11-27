<script setup lang="ts">
import BaseList from '~/components/base/list/BaseList.vue'
import BaseItem from '~/components/base/item/BaseItem.vue'
import BaseItemSection from '~/components/base/item/BaseItemSection.vue'
import BaseItemLabel from '~/components/base/item/BaseItemLabel.vue'

definePageMeta({ middleware: 'auth' })
usePageSeo({ title: 'حساب کاربری', noindex: true })

type AccountSection = {
  title: string
  icon: string
  to?: string
}

const sections: AccountSection[] = [
  { title: 'لیست علاقه‌مندی‌ها', icon: 'lucide:heart' },
  { title: 'سفارش‌های من', icon: 'lucide:package', to: '/account/orders' },
  { title: 'آدرس‌ها', icon: 'lucide:map-pin', to: '/account/addresses' },
]
</script>

<template>
  <div :class="[SITE_GUTTER, 'pb-16 pt-6 lg:pb-20']">
    <div class="mx-auto max-w-3xl">
      <nav
        aria-label="مسیر صفحه"
        class="flex items-center gap-2 text-sm text-dark-gray"
      >
        <NuxtLink to="/">خانه</NuxtLink>
        <Icon name="lucide:chevron-left" size="14" aria-hidden="true" />
        <span aria-current="page">حساب کاربری</span>
      </nav>

      <h1 class="my-5 text-2xl font-bold text-burgundy lg:text-3xl">
        حساب کاربری
      </h1>

      <BaseList class="overflow-hidden rounded-2xl border border-nude/25 bg-white/60">
        <BaseItem
          v-for="section in sections"
          :key="section.title"
          :to="section.to"
          class="min-h-20! border-b border-nude/20 last:border-0"
        >
          <BaseItemSection avatar>
            <Icon
              :name="section.icon"
              size="22"
              class="text-burgundy"
              aria-hidden="true"
            />
          </BaseItemSection>

          <BaseItemSection>
            <BaseItemLabel class="font-semibold text-dark-brown">
              {{ section.title }}
            </BaseItemLabel>
          </BaseItemSection>

          <BaseItemSection side>
            <Icon
              v-if="section.to"
              name="lucide:chevron-left"
              size="18"
              aria-hidden="true"
            />
            <BaseItemLabel v-else caption>به‌زودی</BaseItemLabel>
          </BaseItemSection>
        </BaseItem>
      </BaseList>
    </div>
  </div>
</template>