<template>
  <div class="px-4 py-8 lg:px-12">
    <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-5">
      <li v-for="(product, index) in products" :key="product.id">
        <SiteProductCard :product="product" :priority="index < 4" wishlist />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PublicProduct } from '~/types/product'

const { data } = useApiFetch<{
  status: string
  data: { items: PublicProduct[] }
}>('/products?limit=8', { key: 'card-test' })

const products = computed(() => data.value?.data.items ?? [])
</script>