
<template>
  <section dir="rtl" class="w-full">
    <Swiper
      :modules="[Autoplay, Pagination]"
      :slides-per-view="1"
      :space-between="12"
      :loop="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      :pagination="{ clickable: true }"
      class="hero-swiper"
    >
      <SwiperSlide
        v-for="slide in slides"
        :key="slide.id"
      >
        <article
            class="relative isolate h-52 overflow-hidden rounded-2xl sm:h-72 lg:h-[520px] xl:h-[600px]"
        >
          <!-- Background image -->
          <img
            :src="slide.image"
            :alt="slide.title"
            class="absolute inset-0 -z-20 size-full object-cover"
          />

          <!-- Dark overlay -->
          <div
            class="absolute inset-0 -z-10 bg-gradient-to-l
                   from-black/80 via-black/35 to-transparent"
          />

          <!-- Content -->
          <div
            class="flex h-full flex-col items-start justify-end
                   px-5 pb-10 text-white sm:px-8 sm:pb-12"
          >
            <h2 class="text-xl font-bold sm:text-3xl">
              {{ slide.title }}
            </h2>

            <p class="mt-2 text-xs text-white/85 sm:text-sm">
              {{ slide.description }}
            </p>

            <NuxtLink
              :to="slide.link"
              class="mt-5 inline-flex items-center gap-3
                     rounded-full bg-gold/90 px-5 py-2.5
                     text-xs font-semibold text-dark-brown
                     transition hover:bg-gold/90 sm:text-sm"
            >
              مشاهده محصولات
              <Icon name="lucide:arrow-left" class="size-4" />
            </NuxtLink>
          </div>
        </article>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

const slides = [
  {
    id: 1,
    image: '/images/banners/banner-1.jpg',
    title: 'زیبایی ماندگار',
    description: 'طلا؛ انتخابی برای تمام لحظه‌های خاص',
    link: '/products',
  },
  {
    id: 2,
    image: '/images/banners/banner-2.jpg',
    title: 'درخشش جاودانه',
    description: 'با طلای ناب، خاص باشید',
    link: '/products',
  },
  {
    id: 3,
    image: '/images/banners/banner-3.jpg',
    title: 'خاص بودن را انتخاب کن',
    description: 'زیبایی در جزئیات نهفته است',
    link: '/products',
  },
]
</script>

<style>
.hero-swiper .swiper-pagination {
  bottom: 12px !important;
  left: 20px !important;
  right: auto !important;
  width: auto !important;
  text-align: left;
}
.hero-swiper .swiper-pagination-bullet {
  width: 6px;
  height: 6px;
  background: white;
  opacity: 0.5;
}

.hero-swiper .swiper-pagination-bullet-active {
  width: 22px;
  border-radius: 999px;
  background: #d6b36a;
  opacity: 1;
}
</style>
