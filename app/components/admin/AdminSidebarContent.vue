<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string // مسیر path آیکون SVG (24x24 stroke)
}

defineProps<{ closable?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const items: NavItem[] = [
  { label: 'داشبورد', to: '/admin', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { label: 'محصولات', to: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11' },
  { label: 'دسته بندی ها', to: '/admin/categories', icon: 'M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11' },
  { label: 'کالکشن ها', to: '/admin/collections', icon: 'M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11' },
  { label: 'سفارش‌ها', to: '/admin/orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z' },
  { label: 'قیمت طلا', to: '/admin/gold-price', icon: 'M3 17l6-6 4 4 8-8M14 7h7v7' },
  { label: 'کاربران', to: '/admin/users', icon: 'M17 20h5v-2a4 4 0 00-5-3.9M9 20H2v-2a4 4 0 014-4h3a4 4 0 014 4v2zM12 7a4 4 0 11-8 0 4 4 0 018 0zm8 1a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'تنظیمات', to: '/admin/settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z' },
]

const route = useRoute()
// داشبورد فقط با مسیر دقیق فعال شود، بقیه با زیرمسیرها هم
const isActive = (to: string) =>
  to === '/admin' ? route.path === to : route.path.startsWith(to)
</script>

<template>
  <div class="flex h-full flex-col bg-white">
    <!-- لوگو -->
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
      <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-gray-900">
        <span class="grid size-8 place-items-center rounded-lg bg-amber-500 text-sm text-white">ط</span>
        پنل مدیریت
      </NuxtLink>
      <button
        v-if="closable"
        type="button"
        class="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        aria-label="بستن منو"
        @click="emit('close')"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <!-- منو -->
    <nav class="flex-1 space-y-1 overflow-y-auto p-3">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'bg-amber-50 text-amber-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
      >
        <svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path :d="item.icon" />
        </svg>
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>