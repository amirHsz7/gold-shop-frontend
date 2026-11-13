<template>
  <header class="sticky top-0 z-40 border-b border-nude/15 bg-cream" dir="rtl">
    <div class="relative flex h-16 items-center lg:h-20" :class="SITE_GUTTER">
      <!-- دکمه‌ی منو (موبایل) -->
      <BaseBtn
        class="lg:hidden"
        flat
        round
        size="md"
        color="burgundy"
        aria-label="باز کردن منو"
        :aria-expanded="isMenuOpen"
        @click="openMenu()"
      >
        <template #icon>
          <Icon name="lucide:menu" size="26px" />
        </template>
      </BaseBtn>

      <!-- لوگو: وسط در موبایل، کنار منو در دسکتاپ -->
      <NuxtLink
        to="/"
        class="absolute left-1/2 -translate-x-1/2 lg:static lg:me-10 lg:translate-x-0"
        aria-label="صفحه‌ی اصلی گلدن"
      >
        <SiteLogo />
      </NuxtLink>

      <!-- منوی دسکتاپ -->
      <nav class="hidden h-full items-center gap-8 lg:flex" aria-label="ناوبری اصلی">
        <NuxtLink
          to="/"
          :class="NAV_LINK_CLASS"
          active-class=""
          :exact-active-class="NAV_ACTIVE_CLASS"
        >
          خانه
        </NuxtLink>

        <SiteCategoryMenu :categories="categories" />

        <NuxtLink to="/about" :class="NAV_LINK_CLASS" :active-class="NAV_ACTIVE_CLASS">
          درباره ما
        </NuxtLink>

        <NuxtLink to="/contact" :class="NAV_LINK_CLASS" :active-class="NAV_ACTIVE_CLASS">
          تماس با ما
        </NuxtLink>
      </nav>

      <!-- جستجو (دسکتاپ) -->
      <SiteSearch class="ms-auto hidden w-72 lg:block xl:w-80" />

      <!-- سبد و حساب کاربری -->
      <div class="ms-auto flex items-center gap-1 lg:ms-4">
        <!-- نشانگر بیرون از دکمه است، چون BaseBtn لبه‌ها را می‌برد (overflow-hidden) -->
        <span class="relative">
          <BaseBtn
            to="/cart"
            flat
            round
            size="md"
            color="dark-brown"
            aria-label="سبد خرید"
          >
            <template #icon>
              <Icon name="lucide:shopping-bag" size="24px" />
            </template>
          </BaseBtn>

          <span
            v-if="cartCount > 0"
            class="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold leading-none text-white"
          >
            {{ toFaNumber(cartCount) }}
          </span>
        </span>

        <BaseBtn
          to="/account"
          flat
          round
          size="md"
          color="dark-brown"
          aria-label="حساب کاربری"
        >
          <template #icon>
            <Icon name="lucide:user-round" size="24px" />
          </template>
        </BaseBtn>
      </div>
    </div>

    <!-- منوی کشویی موبایل -->
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
        <!-- سربرگ منو -->
        <div class="flex items-center justify-between bg-burgundy px-5 py-4">
          <NuxtLink to="/" aria-label="صفحه‌ی اصلی گلدن" @click="isMenuOpen = false">
            <SiteLogo tone="gold" />
          </NuxtLink>

          <BaseBtn
            flat
            round
            size="md"
            color="cream"
            aria-label="بستن منو"
            @click="isMenuOpen = false"
          >
            <template #icon>
              <Icon name="lucide:x" size="22px" />
            </template>
          </BaseBtn>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5">
          <SiteSearch @submitted="isMenuOpen = false" />

          <nav class="mt-4 flex flex-col" aria-label="منوی موبایل">
            <NuxtLink
              to="/"
              class="flex items-center justify-between border-b border-nude/25 py-4 text-sm"
              active-class=""
              exact-active-class="text-burgundy! font-semibold"
            >
              خانه
              <Icon name="lucide:chevron-left" size="17px" class="text-nude" />
            </NuxtLink>

            <!-- دسته‌بندی‌ها -->
            <div class="border-b border-nude/25">
              <BaseBtn
                flat
                full
                no-caps
                color="dark-brown"
                class="!min-h-14 !rounded-none !px-0 !text-sm !font-normal"
                inner-btn-class="w-full justify-between"
                :aria-expanded="categoriesOpen"
                @click="categoriesOpen = !categoriesOpen"
              >
                دسته‌بندی‌ها
                <Icon
                  name="lucide:chevron-down"
                  size="17px"
                  class="text-nude transition-transform"
                  :class="{ 'rotate-180': categoriesOpen }"
                />
              </BaseBtn>

              <div v-if="categoriesOpen" class="flex flex-col pb-3">
                <NuxtLink
                  to="/products"
                  class="py-2 text-sm font-medium text-burgundy"
                >
                  همه‌ی محصولات
                </NuxtLink>

                <div
                  v-for="root in categories"
                  :key="root.id"
                  class="flex flex-col py-1"
                >
                  <!-- دسته‌ی اصلی با تصویر -->
                  <NuxtLink
                    :to="categoryLink(root.slug)"
                    class="flex items-center gap-3 py-2"
                  >
                    <BaseImg
                      v-if="root.imageUrl"
                      :src="assetUrl(root.imageUrl)"
                      :alt="root.name"
                      width="40px"
                      height="40px"
                      fit="cover"
                      no-spinner
                      class="shrink-0 rounded-full bg-nude/10 ring-1 ring-nude/20"
                    >
                      <template #error>
                        <Icon name="lucide:gem" size="18px" class="text-nude" />
                      </template>
                    </BaseImg>

                    <span
                      v-else
                      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-nude/10 text-nude ring-1 ring-nude/20"
                      aria-hidden="true"
                    >
                      <Icon name="lucide:gem" size="18px" />
                    </span>

                    <span class="text-sm font-medium">{{ root.name }}</span>
                  </NuxtLink>

                  <!-- زیردسته‌ها زیر اسم دسته‌ی اصلی (هم‌تراز با متن، نه تصویر) -->
                  <NuxtLink
                    v-for="child in root.children"
                    :key="child.id"
                    :to="categoryLink(child.slug)"
                    class="py-1.5 ps-[52px] text-sm text-dark-gray"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <NuxtLink
              to="/about"
              class="flex items-center justify-between border-b border-nude/25 py-4 text-sm"
              active-class="text-burgundy! font-semibold"
            >
              درباره ما
              <Icon name="lucide:chevron-left" size="17px" class="text-nude" />
            </NuxtLink>

            <NuxtLink
              to="/contact"
              class="flex items-center justify-between border-b border-nude/25 py-4 text-sm"
              active-class="text-burgundy! font-semibold"
            >
              تماس با ما
              <Icon name="lucide:chevron-left" size="17px" class="text-nude" />
            </NuxtLink>

            <NuxtLink to="/account" class="mt-3 flex items-center gap-3 py-3 text-sm">
              <Icon name="lucide:user-round" size="19px" />
              حساب کاربری
            </NuxtLink>
          </nav>
        </div>

        <div class="border-t border-nude/25 px-5 py-4">
          <p class="m-0 text-xs leading-6 text-dark-brown/65">
            زیبایی ماندگار، انتخابی برای همیشه
          </p>
        </div>
      </div>
    </BaseDialog>
  </header>
</template>

<script setup lang="ts">
import { toFaNumber } from '@/utils/formatNumber.ts'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseDialog from '@/components/base/dialog/BaseDialog.vue'

const route = useRoute()
const categories = useSiteCategories()
const cartCount = useCartCount()
const assetUrl = useAssetUrl()

const { isOpen: isMenuOpen, categoriesOpen, open: openMenu } = useSiteMenu()

const categoryLink = (slug: string) => ({
  path: '/products',
  query: { category: slug },
})

// با رفتن به صفحه‌ی دیگر منو بسته می‌شود
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})
</script>