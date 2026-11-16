<template>
  <section
    v-if="items.length > 0"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
    :aria-labelledby="titleId"
  >
    <SiteSectionHeader :id="titleId" :title="title" :subtitle="subtitle" />

    <div class="relative">
      <ul
        ref="trackRef"
        class="m-0 grid list-none snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-3 overflow-x-auto p-0 pb-3 [scrollbar-width:none] md:auto-cols-[calc((100%_-_1.25rem)/2)] md:gap-5 lg:auto-cols-[calc((100%_-_2.5rem)/3)] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="update"
      >
        <li v-for="item in items" :key="item.id" class="snap-start">
          <article class="flex h-full flex-col gap-4 rounded-2xl border border-nude/20 bg-white/60 p-5 lg:p-6">
            <div class="flex items-start justify-between gap-3">
              <!-- ستاره‌ها -->
              <div
                v-if="item.rating"
                class="flex items-center gap-0.5 text-gold"
                role="img"
                :aria-label="`امتیاز ${toFaNumber(item.rating)} از ۵`"
              >
                <svg
                  v-for="star in 5"
                  :key="star"
                  viewBox="0 0 24 24"
                  class="size-4"
                  :class="star <= (item.rating ?? 0) ? 'fill-current' : 'fill-nude/25'"
                  aria-hidden="true"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span v-else />

              <Icon name="lucide:quote" size="22px" class="shrink-0 text-nude/50" />
            </div>

            <p class="m-0 line-clamp-5 flex-1 text-sm leading-7 text-dark-brown/90">
              {{ item.body }}
            </p>

            <footer class="flex items-center gap-3 border-t border-nude/20 pt-4">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-burgundy text-base font-semibold text-cream"
                aria-hidden="true"
              >
                {{ initial(item.author.name) }}
              </span>

              <div class="flex min-w-0 flex-col gap-0.5">
                <span class="text-sm font-semibold text-dark-brown">
                  {{ item.author.name }}
                </span>

                <NuxtLink
                  :to="`/products/${item.product.slug}`"
                  class="truncate text-xs text-dark-gray transition-colors hover:text-burgundy"
                >
                  {{ item.product.name }}
                </NuxtLink>
              </div>

              <time
                :datetime="item.createdAt"
                class="ms-auto shrink-0 text-xs text-dark-gray/80"
              >
                {{ formatDate(item.createdAt) }}
              </time>
            </footer>
          </article>
        </li>
      </ul>

      <!-- فلش‌ها (فقط دسکتاپ). در راست‌به‌چپ «قبلی» سمت راست است -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="canPrev"
          class="absolute start-2 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
        >
          <BaseBtn
            round
            size="md"
            color="white"
            class="shadow-md"
            aria-label="نظرات قبلی"
            @click="scrollPage(-1)"
          >
            <template #icon>
              <Icon name="lucide:chevron-right" size="22px" />
            </template>
          </BaseBtn>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="canNext"
          class="absolute end-2 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
        >
          <BaseBtn
            round
            size="md"
            color="white"
            class="shadow-md"
            aria-label="نظرات بعدی"
            @click="scrollPage(1)"
          >
            <template #icon>
              <Icon name="lucide:chevron-left" size="22px" />
            </template>
          </BaseBtn>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import { toFaNumber } from '@/utils/formatNumber.ts'
import type { PublicTestimonial } from '~/types/public-home'

const props = defineProps<{
  items: PublicTestimonial[]
  title: string
  subtitle?: string | null
}>()

const titleId = useId()
const { trackRef, canPrev, canNext, update, scrollPage } = useScrollRow()

const dateFormatter = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })

const formatDate = (value: string) => dateFormatter.format(new Date(value))

// حرف اول اسم برای دایره‌ی آواتار
const initial = (name: string) => Array.from(name.trim())[0] ?? '?'

watch(
  () => props.items,
  () => nextTick(update),
)
</script>