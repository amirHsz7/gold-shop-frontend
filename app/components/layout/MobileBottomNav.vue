<template>
  <nav
    dir="rtl"
    class="
      fixed inset-x-0 bottom-0 z-50
      flex items-center justify-around
      border-t border-nude/15
      bg-cream/95
      px-2 pb-[env(safe-area-inset-bottom)]
      pt-3
      shadow-[0_-4px_20px_rgba(48,37,34,0.06)]
      backdrop-blur-md
      md:hidden
    "
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="
        flex flex-1 flex-col items-center justify-center
        gap-1.5 py-1
        text-dark-brown/65
        transition-colors
      "
      active-class="!text-burgundy"
    >
      <div class="relative">
        <Icon
          :name="item.icon"
          class="size-6"
          stroke-width="1.6"
        />

        <span
          v-if="item.badge"
          class="
            absolute -right-2 -top-1
            flex size-4 items-center justify-center
            rounded-full bg-burgundy
            text-[10px] font-medium text-white
          "
        >
          {{ item.badge }}
        </span>
      </div>

      <span class="text-[11px] font-medium">
        {{ item.label }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const items = [
  {
    label: 'حساب کاربری',
    icon: 'lucide:user-round',
    to: '/account',
  },
  {
    label: 'دسته‌بندی‌ها',
    icon: 'lucide:layout-grid',
    to: '/categories',
  },
  {
    label: 'سبد خرید',
    icon: 'lucide:shopping-bag',
    to: '/cart',
    badge: 1,
  },
  {
    label: 'خانه',
    icon: 'lucide:house',
    to: '/',
  },
]
</script>