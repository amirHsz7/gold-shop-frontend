<template>
  <section
    v-if="loading || items.length > 0"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
  >
    <!-- حالت بارگذاری با همان نسبت ابعاد، تا صفحه نپرد -->
    <div
      v-if="loading"
      class="aspect-[4/3] animate-pulse rounded-2xl bg-nude/15 lg:aspect-[3/1]"
      aria-hidden="true"
    />

    <div v-else class="relative">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="12"
        :loop="items.length > 1"
        :speed="600"
        :grab-cursor="true"
        :autoplay="autoplayOptions"
        :pagination="{ clickable: true }"
        :a11y="a11yOptions"
        class="hero-swiper overflow-hidden rounded-2xl"
        :aria-label="label"
        @swiper="onSwiper"
      >
        <SwiperSlide v-for="(item, index) in items" :key="item.id">
          <article class="relative isolate aspect-[4/3] overflow-hidden bg-dark-brown lg:aspect-[3/1]">
            <!-- تصویر؛ زیر ۱۰۲۴ پیکسل عکس موبایل (در صورت وجود) -->
            <picture>
              <source
                v-if="item.mobileImageUrl"
                :srcset="assetUrl(item.mobileImageUrl)"
                media="(max-width: 1023px)"
              />
              <img
                :src="assetUrl(item.imageUrl)"
                :alt="item.alt || item.title || ''"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                decoding="async"
                class="absolute inset-0 -z-20 h-full w-full object-cover"
              />
            </picture>

            <!-- لایه‌ی تیره برای خوانایی متن؛ در موبایل از پایین و در دسکتاپ از سمت متن -->
            <div
              class="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent lg:bg-linear-to-l lg:from-black/65 lg:via-black/25"
              aria-hidden="true"
            />

            <!-- اگر دکمه ندارد ولی لینک دارد، کل اسلاید قابل کلیک است -->
            <NuxtLink
              v-if="item.linkUrl && !item.buttonText"
              :to="item.linkUrl"
              class="absolute inset-0 z-10"
              :aria-label="item.title ?? 'مشاهده'"
            />

            <!-- متن -->
            <div
              class="relative flex h-full flex-col items-start justify-end gap-2 px-5 pb-12 text-white sm:px-8 lg:justify-center lg:gap-4 lg:px-16 lg:pb-0"
            >
              <h2
                v-if="item.title"
                class="m-0 text-2xl font-bold leading-tight text-gold lg:text-5xl"
              >
                {{ item.title }}
              </h2>

              <p
                v-if="item.subtitle"
                class="m-0 max-w-md text-sm text-white/90 lg:max-w-xl lg:text-xl"
              >
                {{ item.subtitle }}
              </p>

              <BaseBtn
                v-if="item.linkUrl && item.buttonText"
                :to="isExternal(item.linkUrl) ? undefined : item.linkUrl"
                :href="isExternal(item.linkUrl) ? item.linkUrl : undefined"
                :target="isExternal(item.linkUrl) ? '_blank' : undefined"
                color="gold"
                no-caps
                size="md"
                class="!rounded-full mt-2 lg:mt-4"
              >
                {{ item.buttonText }}
                <Icon name="lucide:arrow-left" size="18px" />
              </BaseBtn>
            </div>
          </article>
        </SwiperSlide>
      </Swiper>

      <!-- فلش‌ها (فقط دسکتاپ). در راست‌به‌چپ «قبلی» سمت راست و «بعدی» سمت چپ است -->
      <template v-if="items.length > 1">
        <div class="absolute start-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
          <BaseBtn
            flat
            round
            size="md"
            color="white"
            aria-label="اسلاید قبلی"
            @click="swiper?.slidePrev()"
          >
            <template #icon>
              <Icon name="lucide:chevron-right" size="28px" />
            </template>
          </BaseBtn>
        </div>

        <div class="absolute end-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
          <BaseBtn
            flat
            round
            size="md"
            color="white"
            aria-label="اسلاید بعدی"
            @click="swiper?.slideNext()"
          >
            <template #icon>
              <Icon name="lucide:chevron-left" size="28px" />
            </template>
          </BaseBtn>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { A11y, Autoplay, Pagination } from 'swiper/modules'
import type SwiperClass from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { PublicHomeImageItem } from '~/types/public-home'

const props = withDefaults(
  defineProps<{
    items: PublicHomeImageItem[]
    // ۰ یعنی بدون پخش خودکار
    autoplayMs?: number
    loading?: boolean
    label?: string
  }>(),
  { autoplayMs: 5000, loading: false, label: 'اسلایدر اصلی' },
)

const modules = [Autoplay, Pagination, A11y]

const assetUrl = useAssetUrl()

const swiper = ref<SwiperClass | null>(null)

const isExternal = (url: string) => /^https?:\/\//i.test(url)

// پخش خودکار فقط وقتی بیشتر از یک اسلاید داریم و ادمین خاموشش نکرده
const autoplayOptions = computed(() =>
  props.autoplayMs > 0 && props.items.length > 1
    ? { delay: props.autoplayMs, disableOnInteraction: false, pauseOnMouseEnter: true }
    : false,
)

const a11yOptions = {
  prevSlideMessage: 'اسلاید قبلی',
  nextSlideMessage: 'اسلاید بعدی',
  paginationBulletMessage: 'رفتن به اسلاید {{index}}',
}

const onSwiper = (instance: SwiperClass) => {
  swiper.value = instance

  // کاربرانی که «کاهش حرکت» را در سیستم روشن کرده‌اند، پخش خودکار نمی‌بینند
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    instance.autoplay?.stop()
  }
}
</script>

<style>
/* نقطه‌ها پایین سمت چپ، مثل طرح */
.hero-swiper .swiper-pagination {
  bottom: 16px !important;
  left: 20px !important;
  right: auto !important;
  width: auto !important;
  text-align: left;
}

.hero-swiper .swiper-pagination-bullet {
  width: 6px;
  height: 6px;
  background: #fff;
  opacity: 0.5;
}

.hero-swiper .swiper-pagination-bullet-active {
  width: 22px;
  border-radius: 999px;
  /* برای نقطه‌ی طلایی (مثل نسخه‌ی خودت) این را var(--color-gold) کن */
  background: #fff;
  opacity: 1;
}
</style>