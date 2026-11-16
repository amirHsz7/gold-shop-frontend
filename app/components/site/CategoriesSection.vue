<template>
  <section
    v-if="items.length > 0"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
    :aria-labelledby="titleId"
  >
    <SiteSectionHeader
      :id="titleId"
      :title="title"
      :subtitle="subtitle"
      to="/products"
    />

    <ul
      class="m-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] lg:gap-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      <li
        v-for="category in items"
        :key="category.id"
        class="w-[22%] min-w-[4.75rem] shrink-0 snap-start lg:w-auto lg:min-w-0"
      >
        <NuxtLink
          :to="{ path: '/products', query: { category: category.slug } }"
          class="group flex flex-col items-center gap-2 lg:gap-3"
        >
          <span
            class="block w-full max-w-24 overflow-hidden rounded-full bg-nude/10 ring-1 ring-nude/20 transition-shadow group-hover:ring-2 group-hover:ring-burgundy/40 lg:max-w-32"
          >
            <BaseImg
              v-if="category.imageUrl"
              :src="assetUrl(category.imageUrl)"
              :alt="category.name"
              ratio="1"
              fit="cover"
              no-spinner
              native-loading="lazy"
              class="w-full transition-transform duration-500 group-hover:scale-105"
            >
              <template #error>
                <Icon name="lucide:gem" size="30px" class="text-nude" />
              </template>
            </BaseImg>

            <span
              v-else
              class="flex aspect-square w-full items-center justify-center text-nude"
              aria-hidden="true"
            >
              <Icon name="lucide:gem" size="30px" />
            </span>
          </span>

          <span
            class="text-center text-xs font-medium text-dark-brown transition-colors group-hover:text-burgundy lg:text-base"
          >
            {{ category.name }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { PublicCategory } from '~/types/site'

defineProps<{
  items: PublicCategory[]
  title: string
  subtitle?: string | null
}>()

const titleId = useId()
const assetUrl = useAssetUrl()
</script>