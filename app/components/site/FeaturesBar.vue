<template>
  <section
    aria-label="مزایای خرید از گلدن"
    :class="[SECTION_SPACING, SITE_GUTTER]"
    dir="rtl"
  >
    <ul class="m-0 grid list-none grid-cols-4 p-0">
      <li
        v-for="feature in SITE_FEATURES"
        :key="feature.key"
        class="flex flex-col items-center gap-2 px-1 text-center not-last:border-e not-last:border-nude/30 lg:gap-3 lg:px-4"
      >
        <Icon :name="feature.icon" size="30px" class="text-burgundy lg:text-[34px]" />

        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-semibold leading-5 text-dark-brown lg:text-base">
            {{ feature.title }}
          </span>

          <!-- زیرعنوان فقط در دسکتاپ (طبق طرح موبایل) -->
          <span class="hidden text-xs text-dark-gray lg:block">
            {{ feature.description }}
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>