<template>
  <SiteProductSlider
    v-if="products.length > 0"
    title="محصولات مرتبط"
    :products="products"
    :view-all-to="viewAllTo"
    :eager-count="0"
  />
</template>

<script setup lang="ts">
import type { PublicProduct } from '~/types/product'

const props = defineProps<{
  productId: string
  categorySlug: string
}>()

const { data } = await useApiFetch<{ data: { items: PublicProduct[] } }>(
  '/products',
  {
    key: `related-${props.categorySlug}`,
    query: { category: props.categorySlug, limit: 9 },
    lazy: true,
  },
)

// خود محصول از لیست حذف می‌شود
const products = computed(() =>
  (data.value?.data.items ?? []).filter(item => item.id !== props.productId).slice(0, 8),
)

const viewAllTo = computed(() => ({
  path: '/products',
  query: { category: props.categorySlug },
}))
</script>