<template>
  <div>
    <!-- هنگام بارگذاری اولیه (مثلاً ناوبری سمت کلاینت) -->
    <template v-if="isLoading">
      <SiteHeroSlider :items="[]" loading />
      <SiteProductSlider
        title="جدیدترین محصولات"
        :products="[]"
        loading
      />
    </template>

    <template v-for="section in sections" :key="section.id">
      <SiteHeroSlider
        v-if="section.type === 'SLIDER'"
        :items="section.items"
        :autoplay-ms="section.autoplayMs"
      />

      <SiteProductSlider
        v-else-if="section.type === 'PRODUCTS'"
        :title="section.title || defaultTitle(section.source)"
        :subtitle="section.subtitle"
        :products="section.items"
        :view-all-to="viewAllRoute(section)"
        :eager-count="section.id === firstProductsId ? 4 : 0"
      />
    </template>

    <!-- بنر، دسته‌های گرد، نوار ویژگی‌ها و بقیه‌ی بخش‌ها در مرحله‌های بعد اضافه می‌شوند -->
  </div>
</template>

<script setup lang="ts">
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