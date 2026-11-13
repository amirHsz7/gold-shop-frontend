<template>
  <footer class="border-t border-nude/15 bg-cream pb-24 lg:pb-0" dir="rtl">
    <div class="py-10 lg:py-14" :class="SITE_GUTTER">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <!-- برند و شبکه‌های اجتماعی -->
        <div
          class="flex flex-col items-center gap-4 text-center lg:col-span-4 lg:items-start lg:text-start"
        >
          <NuxtLink to="/" aria-label="صفحه‌ی اصلی گلدن">
            <SiteLogo size="lg" />
          </NuxtLink>

          <p class="m-0 text-base text-dark-brown/80">{{ SITE_TAGLINE }}</p>

          <ul
            v-if="socials.length > 0"
            class="m-0 flex list-none items-center gap-1 p-0"
          >
            <li v-for="social in socials" :key="social.key">
              <BaseBtn
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                flat
                round
                size="md"
                color="burgundy"
                :aria-label="social.label"
              >
                <template #icon>
                  <Icon :name="social.icon" size="22px" />
                </template>
              </BaseBtn>
            </li>
          </ul>
        </div>

        <!-- دسترسی سریع: در موبایل یک ردیف با جداکننده -->
        <nav aria-label="دسترسی سریع" class="lg:col-span-2">
          <h3 class="mb-4 mt-0 hidden text-sm font-semibold text-dark-brown lg:block">
            دسترسی سریع
          </h3>

          <ul
            class="m-0 flex list-none flex-wrap items-center justify-center p-0 lg:flex-col lg:items-start lg:gap-3"
          >
            <li
              v-for="link in FOOTER_LINKS"
              :key="link.to"
              class="px-3 text-sm not-last:border-e not-last:border-nude/40 lg:px-0 lg:not-last:border-e-0"
            >
              <NuxtLink
                :to="link.to"
                class="text-dark-brown/80 transition-colors hover:text-burgundy"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- دسته‌بندی‌ها (فقط دسکتاپ) -->
        <nav
          v-if="categories.length > 0"
          aria-label="دسته‌بندی‌ها"
          class="hidden lg:col-span-3 lg:block"
        >
          <h3 class="mb-4 mt-0 text-sm font-semibold text-dark-brown">دسته‌بندی‌ها</h3>

          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            <li v-for="root in categories.slice(0, 6)" :key="root.id" class="text-sm">
              <NuxtLink
                :to="{ path: '/products', query: { category: root.slug } }"
                class="text-dark-brown/80 transition-colors hover:text-burgundy"
              >
                {{ root.name }}
              </NuxtLink>
            </li>

            <li class="text-sm">
              <NuxtLink
                to="/products"
                class="inline-flex items-center gap-1 font-medium text-burgundy hover:underline"
              >
                همه‌ی محصولات
                <Icon name="lucide:arrow-left" size="15px" />
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- اطلاعات تماس (فقط دسکتاپ) -->
        <div v-if="hasContact" class="hidden lg:col-span-3 lg:block">
          <h3 class="mb-4 mt-0 text-sm font-semibold text-dark-brown">تماس با ما</h3>

          <ul class="m-0 flex list-none flex-col gap-3 p-0 text-sm text-dark-brown/80">
            <li v-if="shopInfo?.address" class="flex items-start gap-2">
              <Icon name="lucide:map-pin" size="17px" class="mt-0.5 shrink-0 text-burgundy" />
              <span>{{ shopInfo.address }}</span>
            </li>

            <li v-for="phone in shopInfo?.phones ?? []" :key="phone">
              <a
                :href="toTelHref(phone)"
                class="flex items-center gap-2 transition-colors hover:text-burgundy"
              >
                <Icon name="lucide:phone" size="17px" class="shrink-0 text-burgundy" />
                <span dir="ltr">{{ phone }}</span>
              </a>
            </li>

            <li v-if="shopInfo?.email">
              <a
                :href="`mailto:${shopInfo.email}`"
                class="flex items-center gap-2 transition-colors hover:text-burgundy"
              >
                <Icon name="lucide:mail" size="17px" class="shrink-0 text-burgundy" />
                <span dir="ltr">{{ shopInfo.email }}</span>
              </a>
            </li>

            <li v-if="shopInfo?.workingHours" class="flex items-start gap-2">
              <Icon name="lucide:clock" size="17px" class="mt-0.5 shrink-0 text-burgundy" />
              <span>{{ shopInfo.workingHours }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- کپی‌رایت -->
      <p class="mb-0 mt-10 border-t border-nude/25 pt-6 text-center text-xs text-dark-brown/70">
        © {{ year }} {{ SITE_NAME }}. تمامی حقوق محفوظ است.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'

const categories = useSiteCategories()
const shopInfo = useSiteShopInfo()

// سال شمسی (مثلاً ۱۴۰۵)
const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())

const hasContact = computed(() => {
  const info = shopInfo.value

  return !!info && (
    !!info.address
    || info.phones.length > 0
    || !!info.email
    || !!info.workingHours
  )
})

// فقط شبکه‌هایی که ادمین پر کرده نمایش داده می‌شوند
const socials = computed(() => {
  const info = shopInfo.value

  if (!info) return []

  const entries = [
    { key: 'instagram', label: 'اینستاگرام', icon: 'simple-icons:instagram', href: buildSocialUrl('instagram', info.instagram) },
    { key: 'telegram', label: 'تلگرام', icon: 'simple-icons:telegram', href: buildSocialUrl('telegram', info.telegram) },
    { key: 'whatsapp', label: 'واتساپ', icon: 'simple-icons:whatsapp', href: buildSocialUrl('whatsapp', info.whatsapp) },
  ] as const

  return entries.flatMap(entry =>
    entry.href ? [{ ...entry, href: entry.href }] : [],
  )
})
</script>