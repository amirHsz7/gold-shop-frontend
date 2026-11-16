<template>
  <section
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
    :aria-labelledby="titleId"
  >
    <SiteSectionHeader :id="titleId" :title="title" :subtitle="subtitle" />

    <div class="grid overflow-hidden rounded-3xl border border-nude/20 bg-white/60 lg:grid-cols-2">
      <!-- اطلاعات -->
      <ul
        v-if="hasInfo"
        class="m-0 flex list-none flex-col justify-center gap-5 p-6 text-sm text-dark-brown lg:p-10 lg:text-base"
      >
        <li v-if="address" class="flex items-start gap-3">
          <Icon name="lucide:map-pin" size="22px" class="mt-0.5 shrink-0 text-burgundy" />
          <span class="leading-7">{{ address }}</span>
        </li>

        <li v-for="phone in phones" :key="phone">
          <a
            :href="toTelHref(phone)"
            class="flex items-center gap-3 transition-colors hover:text-burgundy"
          >
            <Icon name="lucide:phone" size="22px" class="shrink-0 text-burgundy" />
            <span dir="ltr">{{ phone }}</span>
          </a>
        </li>

        <li v-if="workingHours" class="flex items-start gap-3">
          <Icon name="lucide:clock" size="22px" class="mt-0.5 shrink-0 text-burgundy" />
          <span class="leading-7">{{ workingHours }}</span>
        </li>
      </ul>

      <!-- مسیریابی -->
      <div
        class="flex min-h-56 flex-col items-center justify-center gap-5 bg-burgundy p-8 text-center text-cream"
        :class="{ 'lg:col-span-2': !hasInfo }"
      >
        <span class="flex size-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Icon name="lucide:map-pin" size="34px" />
        </span>

        <p class="m-0 text-base font-medium lg:text-lg">
          فروشگاه ما را روی نقشه پیدا کنید
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <BaseBtn
            v-for="(link, index) in mapLinks"
            :key="link.key"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            :color="index === 0 ? 'gold' : 'cream'"
            :outline="index !== 0"
            no-caps
            class="!rounded-full"
          >
            {{ link.label }}
            <Icon name="lucide:arrow-up-left" size="18px" />
          </BaseBtn>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'

const props = defineProps<{
  location: { latitude: number; longitude: number }
  address: string | null
  phones: string[]
  workingHours: string | null
  title: string
  subtitle?: string | null
}>()

const titleId = useId()

const hasInfo = computed(
  () => !!props.address || props.phones.length > 0 || !!props.workingHours,
)

// لینک‌های مسیریابی؛ برای نشان یا بلد، قالب لینک را از مستندات خودشان بردار و اینجا اضافه کن
const mapLinks = computed(() => {
  const { latitude, longitude } = props.location

  return [
    {
      key: 'google',
      label: 'مسیریابی با گوگل‌مپ',
      href: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    },
    {
      key: 'osm',
      label: 'نمایش روی OpenStreetMap',
      href: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
    },
  ]
})
</script>