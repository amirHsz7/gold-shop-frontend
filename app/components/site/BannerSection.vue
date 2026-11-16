<template>
  <section
    v-if="items.length > 0"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
    :aria-labelledby="title ? titleId : undefined"
  >
    <SiteSectionHeader
      v-if="title"
      :id="titleId"
      :title="title"
      :subtitle="subtitle"
    />

    <ul class="m-0 grid list-none gap-3 p-0 lg:gap-5" :class="gridClass">
      <li v-for="item in items" :key="item.id">
        <article
          class="relative isolate overflow-hidden rounded-2xl bg-dark-brown"
          :class="aspectClass"
        >
          <!-- تصویر؛ زیر ۱۰۲۴ پیکسل عکس موبایل (در صورت وجود) -->
          <picture>
            <source
              v-if="item.mobileImageUrl"
              :srcset="assetUrl(item.mobileImageUrl)"
              media="(max-width: 1023px)"
            />
            <img
              :src="assetUrl(item.imageUrl)"
              :alt="item.alt ?? ''"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 -z-20 h-full w-full object-cover"
            />
          </picture>

          <!-- لایه‌ی تیره از سمت متن برای خوانایی -->
          <div
            class="absolute inset-0 -z-10 bg-linear-to-l from-black/70 via-black/25 to-transparent"
            aria-hidden="true"
          />

          <!-- اگر دکمه ندارد ولی لینک دارد، کل بنر قابل کلیک است -->
          <component
            :is="isExternalUrl(item.linkUrl) ? 'a' : NuxtLink"
            v-if="item.linkUrl && !item.buttonText"
            v-bind="linkProps(item.linkUrl)"
            class="absolute inset-0 z-10"
            :aria-label="item.title ?? 'مشاهده'"
          />

          <!-- متن -->
          <div
            class="relative flex h-full flex-col items-start justify-center gap-1.5 px-5 lg:gap-3"
            :class="compact ? 'lg:px-6' : 'lg:px-12'"
          >
            <h3
              v-if="item.title"
              class="m-0 font-bold leading-tight text-gold"
              :class="compact ? 'text-lg lg:text-2xl' : 'text-xl lg:text-4xl'"
            >
              {{ item.title }}
            </h3>

            <p
              v-if="item.subtitle"
              class="m-0 max-w-sm text-cream/90"
              :class="compact ? 'text-xs lg:text-sm' : 'text-sm lg:text-lg'"
            >
              {{ item.subtitle }}
            </p>

            <BaseBtn
              v-if="item.linkUrl && item.buttonText"
              v-bind="btnLinkProps(item.linkUrl)"
              color="gold"
              no-caps
              :size="compact ? 'sm' : 'md'"
              class="mt-1 !rounded-full lg:mt-2"
            >
              {{ item.buttonText }}
              <Icon name="lucide:arrow-left" size="18px" />
            </BaseBtn>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { PublicHomeImageItem } from '~/types/public-home'

const props = withDefaults(
  defineProps<{
    items: PublicHomeImageItem[]
    // تعداد ستون در دسکتاپ (۱ تا ۴)
    columns?: number
    title?: string | null
    subtitle?: string | null
  }>(),
  { columns: 2, title: null, subtitle: null },
)

// کلاس‌ها باید به‌صورت رشته‌ی کامل نوشته شوند تا Tailwind آن‌ها را بسازد
const GRID_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

// نسبت‌ها با نسبت برش عکس در پنل یکی است
const ASPECT_CLASSES: Record<number, string> = {
  1: 'aspect-[2/1] lg:aspect-[4/1]',
  2: 'aspect-[2/1]',
  3: 'aspect-[3/2]',
  4: 'aspect-square',
}

const titleId = useId()
const assetUrl = useAssetUrl()

const columnCount = computed(() => Math.min(Math.max(props.columns, 1), 4))

const gridClass = computed(() => GRID_CLASSES[columnCount.value])
const aspectClass = computed(() => ASPECT_CLASSES[columnCount.value])

// در ستون‌های باریک متن کوچک‌تر است
const compact = computed(() => columnCount.value >= 3)

const linkProps = (url: string) =>
  isExternalUrl(url)
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: url }

const btnLinkProps = (url: string) =>
  isExternalUrl(url)
    ? { href: url, target: '_blank' }
    : { to: url }
</script>