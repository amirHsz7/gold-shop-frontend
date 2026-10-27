<template>
  <header class="w-full" dir="rtl">
    <!-- Desktop announcement bar -->
    <div
      class="hidden h-[30px] items-center justify-between
             bg-burgundy px-6 text-[11px] text-cream
             lg:flex lg:px-8 xl:px-12"
    >
      <div class="flex items-center gap-2">
        <Icon name="lucide:chart-no-axes-combined" size="15px" />
        <span>قیمت طلا امروز: هر گرم ۷,۴۵۰,۰۰۰ تومان</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon name="lucide:truck" size="16px" />
        <span>ارسال رایگان برای سفارش‌های بالای ۱۰ میلیون تومان</span>
      </div>
    </div>

    <!-- Main navigation -->
    <div
      class="relative z-30 flex h-[68px] items-center
             justify-between bg-burgundy px-4 text-cream
             lg:h-[60px] lg:flex-row lg:bg-cream
             lg:px-6 lg:text-dark-brown xl:px-12"
    >
      <!-- Mobile menu button -->
      <button
        type="button"
        class="flex size-10 shrink-0 items-center justify-start lg:hidden"
        aria-label="باز کردن منو"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = true"
      >
        <Icon name="lucide:menu" size="23px" />
      </button>

      <!-- Logo -->
      <NuxtLink
        to="/"
        class="absolute left-1/2 top-1/2 flex
               -translate-x-1/2 -translate-y-1/2
               flex-col items-center justify-center
               lg:static lg:translate-x-0 lg:translate-y-0"
        aria-label="صفحه اصلی Golden"
      >
        <Icon
          name="lucide:flower-2"
          class="text-gold lg:text-burgundy"
          size="23px"
        />

        <span
          class="font-serif text-[20px] leading-5
                 tracking-[0.16em] text-gold
                 lg:text-[22px] lg:text-burgundy"
        >
          GOLDEN
        </span>

        <span
          class="mt-1 text-[6px] tracking-[0.24em]
                 text-cream/75 lg:text-[7px]
                 lg:text-dark-brown/70"
        >
          JEWELRY &amp; GOLD
        </span>
      </NuxtLink>

      <!-- Desktop navigation -->
      <nav
        class="hidden items-center gap-5 text-[12px]
               lg:flex xl:gap-7"
        aria-label="ناوبری اصلی"
      >
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-1.5
                 py-5 transition-colors hover:text-burgundy"
          active-class="font-semibold text-burgundy"
        >
          {{ item.label }}

          <Icon
            v-if="item.hasDropdown"
            name="lucide:chevron-down"
            size="13px"
          />
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div
        class="flex shrink-0 items-center gap-3
               lg:flex-row lg:gap-4"
      >
        <!-- Search -->
        <button
          type="button"
          class="flex size-8 items-center justify-center
                 transition-opacity hover:opacity-60"
          aria-label="جست‌وجو"
          @click="isSearchOpen = !isSearchOpen"
        >
          <Icon name="lucide:search" size="21px" />
        </button>

        <!-- Account -->
        <NuxtLink
          to="/account"
          class="hidden size-8 items-center justify-center
                 transition-opacity hover:opacity-60
                 lg:flex"
          aria-label="حساب کاربری"
        >
          <Icon name="lucide:user-round" size="19px" />
        </NuxtLink>

        <!-- Cart -->
        <NuxtLink
          to="/cart"
          class="relative flex size-8 items-center
                 justify-center transition-opacity
                 hover:opacity-60"
          aria-label="سبد خرید"
        >
          <Icon name="lucide:shopping-bag" size="22px" />

          <span
            class="absolute -right-0.5 -top-0.5
                   flex size-[15px] items-center
                   justify-center rounded-full
                   bg-gold text-[9px] font-bold
                   text-dark-brown"
          >
            ۲
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Search panel -->
    <div
      v-if="isSearchOpen"
      class="relative z-20 border-b border-nude/30
             bg-cream px-4 py-3 lg:px-8"
    >
      <label class="sr-only" for="header-search">
        جست‌وجوی محصولات
      </label>

      <div
        class="mx-auto flex max-w-3xl items-center gap-3
               rounded-lg bg-white px-4"
      >
        <Icon
          name="lucide:search"
          class="shrink-0 text-nude"
          size="19px"
        />

        <input
          id="header-search"
          type="search"
          placeholder="جست‌وجو در محصولات..."
          class="min-w-0 flex-1 bg-transparent py-3
                 text-sm text-dark-brown outline-none
                 placeholder:text-dark-brown/45"
        />

        <button
          type="button"
          class="text-xs text-dark-brown/60"
          @click="isSearchOpen = false"
        >
          بستن
        </button>
      </div>
    </div>

    <!-- Mobile menu -->

    <BaseDialog
      v-model="isMenuOpen"
      position="right"
      transition-show="slide-right"
      transition-hide="slide-left"
      :full-height="true"
      :custom-class="'!m-0 !h-[100dvh] !max-h-none !w-[85vw] !max-w-[360px] !rounded-none !bg-cream'"
      custom-main-class="lg:hidden"
    >
      <div dir="rtl" class="flex h-full flex-col text-dark-brown">
        <!-- Menu header -->
        <div class="flex items-center justify-between bg-burgundy px-5 py-5 text-cream">
          <NuxtLink
            to="/"
            class="flex flex-col"
            @click="isMenuOpen = false"
          >
            <span class="text-xl tracking-[0.16em] text-gold">
              GOLDEN
            </span>
            <span class="text-[8px] tracking-[0.2em] text-cream/70">
              JEWELRY & GOLD
            </span>
          </NuxtLink>

          <button
            type="button"
            aria-label="بستن منو"
            class="flex size-9 items-center justify-center"
            @click="isMenuOpen = false"
          >
            <Icon name="lucide:x" size="22px" />
          </button>
        </div>

        <!-- Navigation links -->
        <nav class="flex-1 overflow-y-auto px-5 py-4">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="flex items-center justify-between border-b border-nude/25 py-5 text-sm transition-colors hover:text-burgundy"
            @click="isMenuOpen = false"
          >
            <span>{{ item.label }}</span>

            <Icon
              name="lucide:chevron-left"
              size="17px"
              class="text-nude"
            />
          </NuxtLink>

          <NuxtLink
            to="/account"
            class="mt-5 flex items-center gap-3 py-3 text-sm"
            @click="isMenuOpen = false"
          >
            <Icon name="lucide:user-round" size="19px" />
            حساب کاربری
          </NuxtLink>
        </nav>

        <!-- Menu footer -->
        <div class="border-t border-nude/25 px-5 py-4">
          <p class="text-xs leading-6 text-dark-brown/65">
            زیبایی ماندگار، انتخابی برای همیشه
          </p>
        </div>
      </div>
    </BaseDialog>

  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseDialog from '@/components/base/dialog/BaseDialog.vue'

const isMenuOpen = ref(false)
const isSearchOpen = ref(false)

const navigation = [
  { label: 'خانه', to: '/' },
  { label: 'محصولات', to: '/products', hasDropdown: true },
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
]
</script>
