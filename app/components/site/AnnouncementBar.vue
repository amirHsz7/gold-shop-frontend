<template>
  <div
    class="hidden h-9 bg-burgundy text-cream lg:block"
    role="region"
    aria-label="اطلاعیه‌ها"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div class="flex h-full items-center justify-between" :class="SITE_GUTTER">
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-gold"
        aria-label="اطلاعیه‌ی قبلی"
        @click="prev"
      >
        <Icon name="lucide:chevron-right" size="18px" />
      </button>

      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150"
        leave-to-class="opacity-0"
      >
        <ul
          :key="index"
          class="m-0 flex list-none items-center justify-center p-0 text-[13px]"
          aria-live="polite"
        >
          <template v-for="(item, position) in visibleItems" :key="item.id">
            <li
              v-if="position > 0"
              class="mx-6 h-4 w-px bg-cream/30"
              aria-hidden="true"
            />

            <li class="flex items-center gap-2">
              <Icon :name="item.icon" size="17px" class="shrink-0 text-gold" />
              <span>{{ item.text }}</span>
            </li>
          </template>
        </ul>
      </Transition>

      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-gold"
        aria-label="اطلاعیه‌ی بعدی"
        @click="next"
      >
        <Icon name="lucide:chevron-left" size="18px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const AUTOPLAY_MS = 5000

// قیمت هر گرم طلا: فعلاً ثابت است و بعد از ماژول قیمت از API خوانده می‌شود
const goldPricePerGram = 7450000

const formatPrice = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value).replace(/٬/g, ',')

const announcements = [
  {
    id: 'free-shipping',
    icon: 'lucide:gem',
    text: 'ارسال رایگان برای خرید بالای ۱۰ میلیون تومان',
  },
  {
    id: 'gold-price',
    icon: 'lucide:chart-no-axes-combined',
    text: `قیمت طلا امروز: هر گرم ${formatPrice(goldPricePerGram)} تومان`,
  },
  {
    id: 'authenticity',
    icon: 'lucide:shield-check',
    text: 'ضمانت اصالت کالا همراه با فاکتور رسمی',
  },
]

const index = ref(0)
const paused = ref(false)

// دو اطلاعیه‌ی پشت‌سر‌هم کنار هم نمایش داده می‌شوند
const visibleItems = computed(() => {
  const count = announcements.length
  const first = announcements[index.value % count]
  const second = announcements[(index.value + 1) % count]

  return first && second && count > 1 ? [first, second] : announcements
})

const next = () => {
  index.value = (index.value + 1) % announcements.length
}

const prev = () => {
  index.value = (index.value - 1 + announcements.length) % announcements.length
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) next()
  }, AUTOPLAY_MS)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>