
<script setup lang="ts">
const quickLinks = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'محصولات', to: '/products' },
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
]

const guideLinks = [
  { label: 'روش‌های پرداخت', to: '/payment-methods' },
  { label: 'ارسال و تحویل', to: '/shipping' },
  { label: 'بازگشت کالا', to: '/returns' },
  { label: 'سوالات متداول', to: '/faq' },
]

const contactItems = [
  {
    icon: 'lucide:phone',
    label: 'تلفن تماس',
    value: '۰۲۱-۱۲۳۴۵۶۷۸',
    href: 'tel:02112345678',
  },
  {
    icon: 'lucide:mail',
    label: 'ایمیل',
    value: 'info@golden-jewelry.ir',
    href: 'mailto:info@golden-jewelry.ir',
  },
  {
    icon: 'lucide:map-pin',
    label: 'آدرس',
    value: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    href: undefined,
  },
]

const socialLinks = [
  { icon: 'lucide:instagram', label: 'اینستاگرام', href: '#' },
  { icon: 'lucide:send', label: 'تلگرام', href: '#' },
  { icon: 'lucide:linkedin', label: 'لینکدین', href: '#' },
  { icon: 'lucide:youtube', label: 'یوتیوب', href: '#' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer dir="rtl" class="bg-burgundy text-cream">
    <!-- Main footer -->
    <div
      class="mx-auto grid max-w-[1440px] grid-cols-1
             gap-9 px-5 py-10
             sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10
             lg:grid-cols-4 lg:gap-8
             lg:px-10 lg:py-12 xl:px-16"
    >
      <!-- Brand -->
      <div
        class="flex flex-col items-center text-center
               sm:col-span-2 lg:col-span-1
               lg:items-start lg:text-right"
      >
        <NuxtLink
          to="/"
          class="flex flex-col items-center lg:items-start"
          aria-label="صفحه اصلی گلدن"
        >
          <Icon
            name="lucide:flower-2"
            size="38px"
            class="mb-1 text-gold"
          />

          <span
            class="font-serif text-[27px] leading-8
                   tracking-[0.15em] text-gold"
          >
            GOLDEN
          </span>

          <span
            class="mt-1 text-[8px] tracking-[0.25em]
                   text-cream/70"
          >
            JEWELRY &amp; GOLD
          </span>
        </NuxtLink>

        <p
          class="mt-4 max-w-[260px] text-xs leading-7
                 text-cream/65"
        >
          زیبایی ماندگار، انتخابی برای همیشه.
          همراه شما در انتخاب زیورآلاتی ارزشمند.
        </p>

        <div class="mt-4 flex items-center gap-4">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            :aria-label="social.label"
            class="flex size-8 items-center justify-center
                   text-cream/75 transition-colors
                   hover:text-gold"
          >
            <Icon :name="social.icon" size="19px" />
          </a>
        </div>
      </div>

      <!-- Quick links -->
      <div class="text-right">
        <h2 class="mb-5 text-sm font-semibold text-gold">
          دسترسی سریع
        </h2>

        <ul class="space-y-3">
          <li v-for="item in quickLinks" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="text-xs text-cream/75
                     transition-colors hover:text-gold"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Customer guide -->
      <div class="text-right">
        <h2 class="mb-5 text-sm font-semibold text-gold">
          راهنمای خرید
        </h2>

        <ul class="space-y-3">
          <li v-for="item in guideLinks" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="text-xs text-cream/75
                     transition-colors hover:text-gold"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="text-right">
        <h2 class="mb-5 text-sm font-semibold text-gold">
          تماس با ما
        </h2>

        <ul class="space-y-4">
          <li
            v-for="item in contactItems"
            :key="item.label"
            class="flex items-start gap-3"
          >
            <Icon
              :name="item.icon"
              size="16px"
              class="mt-0.5 shrink-0 text-gold"
            />

            <div class="min-w-0">
              <p class="mb-1 text-[10px] text-cream/50">
                {{ item.label }}
              </p>

              <a
                v-if="item.href"
                :href="item.href"
                dir="auto"
                class="break-words text-xs leading-6
                       text-cream/85 transition-colors
                       hover:text-gold"
              >
                {{ item.value }}
              </a>

              <p
                v-else
                class="text-xs leading-6 text-cream/85"
              >
                {{ item.value }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright bar -->
    <div class="border-t border-white/15">
      <div
        class="mx-auto flex max-w-[1440px] flex-col
               items-center gap-3 px-5 py-5
               text-center text-[10px] text-cream/60
               sm:flex-row sm:justify-between
               sm:text-right lg:px-10 xl:px-16"
      >
        <p>
          © {{ currentYear }} تمامی حقوق برای گلدن محفوظ است.
        </p>

        <p class="flex items-center gap-1">
          طراحی و توسعه با
          <Icon
            name="lucide:heart"
            size="12px"
            class="fill-red-500 text-red-500"
          />
          توسط تیم ما
        </p>
      </div>
    </div>
  </footer>
</template>
