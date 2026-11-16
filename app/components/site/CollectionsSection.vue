<template>
  <section
    v-if="items.length > 0"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
    :aria-labelledby="titleId"
  >
    <SiteSectionHeader :id="titleId" :title="title" :subtitle="subtitle" />

    <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3 lg:gap-5">
      <li v-for="collection in items" :key="collection.id">
        <NuxtLink
          :to="{ path: '/products', query: { collection: collection.slug } }"
          class="group relative isolate block aspect-[4/3] overflow-hidden rounded-2xl bg-burgundy"
        >
          <!-- تصویر -->
          <div
            v-if="collection.imageUrl"
            class="absolute inset-0 -z-20 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <BaseImg
              :src="assetUrl(collection.imageUrl)"
              :alt="collection.name"
              fit="cover"
              no-spinner
              native-loading="lazy"
              class="h-full w-full"
            />
          </div>

          <div
            v-else
            class="absolute inset-0 -z-20 flex items-center justify-center text-gold/60"
            aria-hidden="true"
          >
            <Icon name="lucide:gem" size="44px" />
          </div>

          <!-- لایه‌ی تیره برای خوانایی متن -->
          <div
            class="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/15 to-transparent"
            aria-hidden="true"
          />

          <!-- متن -->
          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-cream lg:gap-1.5 lg:p-5">
            <h3 class="m-0 text-base font-bold leading-tight text-gold lg:text-2xl">
              {{ collection.name }}
            </h3>

            <p
              v-if="collection.description"
              class="m-0 hidden text-sm text-cream/90 lg:line-clamp-2 lg:block"
            >
              {{ collection.description }}
            </p>

            <span class="text-xs text-cream/80 lg:text-sm">
              {{ toFaNumber(collection.productCount) }} محصول
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { toFaNumber } from '@/utils/formatNumber.ts'
import type { PublicCollection } from '~/types/site'

defineProps<{
  items: PublicCollection[]
  title: string
  subtitle?: string | null
}>()

const titleId = useId()
const assetUrl = useAssetUrl()
</script>