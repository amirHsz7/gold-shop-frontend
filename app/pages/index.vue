<template>
  <div>
    <h1 class="sr-only">{{ SITE_NAME }}: خرید آنلاین طلا و جواهر</h1>
    <!-- هنگام بارگذاری اولیه (مثلاً ناوبری سمت کلاینت) -->
    <template v-if="isLoading">
      <SiteHeroSlider :items="[]" loading />
      <SiteProductSlider
        title="جدیدترین محصولات"
        :products="[]"
        loading
      />
    </template>

    <!-- اگر اسلایدر اصلی نباشد یا خاموش باشد، نوار ویژگی‌ها بالای صفحه می‌آید -->
    <SiteFeaturesBar v-if="!isLoading && !hasSlider" />

    <template v-for="section in sections" :key="section.id">
      <template v-if="section.type === 'SLIDER'">
        <SiteHeroSlider
          :items="section.items"
          :autoplay-ms="section.autoplayMs"
        />
        <SiteFeaturesBar />
      </template>

      <SiteProductSlider
        v-else-if="section.type === 'PRODUCTS'"
        :title="section.title || defaultTitle(section.source)"
        :subtitle="section.subtitle"
        :products="section.items"
        :view-all-to="viewAllRoute(section)"
        :eager-count="section.id === firstProductsId ? 4 : 0"
      />

      <SiteBannerSection
        v-else-if="section.type === 'BANNERS'"
        :items="section.items"
        :columns="section.columns"
        :title="section.title"
        :subtitle="section.subtitle"
      />

      <SiteCategoriesSection
        v-else-if="section.type === 'CATEGORIES'"
        :items="section.items"
        :title="section.title || 'دسته‌بندی‌ها'"
        :subtitle="section.subtitle"
      />

      <SiteCollectionsSection
        v-else-if="section.type === 'COLLECTIONS'"
        :items="section.items"
        :title="section.title || 'کالکشن‌ها'"
        :subtitle="section.subtitle"
      />

      <SiteTestimonialsSection
        v-else-if="section.type === 'TESTIMONIALS'"
        :items="section.items"
        :title="section.title || 'نظرات مشتریان'"
        :subtitle="section.subtitle"
      />

      <SiteMapSection
        v-else-if="section.type === 'MAP'"
        :location="section.location"
        :address="section.address"
        :phones="section.phones"
        :working-hours="section.workingHours"
        :title="section.title || 'آدرس فروشگاه'"
        :subtitle="section.subtitle"
      />
    </template>
  </div>
</template>

<script setup lang="ts">

usePageSeo({
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: 'خرید آنلاین طلا و جواهر با ضمانت اصالت کالا و فاکتور رسمی',
})

import type {
  PublicHomeProductsSection,
  PublicHomeSection,
} from '~/types/public-home'

useSeoMeta({
  title: `${SITE_NAME} | زیبایی، سرمایه ماندگار شما`,
  description: 'خرید آنلاین طلا و جواهر با ضمانت اصالت کالا و فاکتور رسمی',
})

// برخلاف پنل ادمین، این صفحه سمت سرور هم رندر می‌شود (سئو و سرعت)
const { data, status } = useApiFetch<{
  status: string
  data: { sections: PublicHomeSection[] }
}>('/home', { key: 'home' })

const sections = computed(() => data.value?.data.sections ?? [])

const isLoading = computed(
  () => !data.value && (status.value === 'idle' || status.value === 'pending'),
)

const hasSlider = computed(() =>
  sections.value.some(section => section.type === 'SLIDER'),
)

const firstProductsId = computed(
  () => sections.value.find(section => section.type === 'PRODUCTS')?.id,
)

const DEFAULT_TITLES = {
  featured: 'محصولات ویژه',
  newest: 'جدیدترین محصولات',
  discount: 'پیشنهاد ویژه',
} as const

const defaultTitle = (source: PublicHomeProductsSection['source']) =>
  DEFAULT_TITLES[source]

const viewAllRoute = (section: PublicHomeProductsSection) => ({
  path: '/products',
  query: section.viewAll,
})
</script>