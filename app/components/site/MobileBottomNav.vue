<template>
  <nav
    aria-label="منوی پایین"
    dir="rtl"
    class="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-nude/20 bg-cream pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(48,37,34,0.1)] lg:hidden"
  >
    <ul class="m-0 grid list-none grid-cols-4 divide-x divide-nude/25 p-0">
      <li>
        <BaseBtn
          to="/"
          flat
          full
          no-caps
          color="dark-brown"
          class="!min-h-16 !rounded-none !px-1 !py-2 !text-xs [&.router-link-exact-active]:text-burgundy"
          inner-btn-class="!flex-col !gap-1"
        >
          <Icon name="lucide:house" size="24px" />
          خانه
        </BaseBtn>
      </li>

      <li>
        <BaseBtn
          to="/cart"
          flat
          full
          no-caps
          color="dark-brown"
          class="!min-h-16 !rounded-none !px-1 !py-2 !text-xs [&.router-link-active]:text-burgundy"
          inner-btn-class="!flex-col !gap-1"
        >
          <span class="relative">
            <Icon name="lucide:shopping-bag" size="24px" />

            <span
              v-if="cartCount > 0"
              class="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold leading-none text-white"
            >
              {{ toFaNumber(cartCount) }}
            </span>
          </span>
          سبد خرید
        </BaseBtn>
      </li>

      <li>
        <BaseBtn
          flat
          full
          no-caps
          color="dark-brown"
          class="!min-h-16 !rounded-none !px-1 !py-2 !text-xs"
          inner-btn-class="!flex-col !gap-1"
          @click="open({ categories: true })"
        >
          <Icon name="lucide:layout-grid" size="24px" />
          دسته‌بندی‌ها
        </BaseBtn>
      </li>

      <li>
        <BaseBtn
          to="/account"
          flat
          full
          no-caps
          color="dark-brown"
          class="!min-h-16 !rounded-none !px-1 !py-2 !text-xs [&.router-link-active]:text-burgundy"
          inner-btn-class="!flex-col !gap-1"
        >
          <Icon name="lucide:user-round" size="24px" />
          حساب کاربری
        </BaseBtn>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { toFaNumber } from '@/utils/formatNumber.ts'
import BaseBtn from '@/components/base/button/BaseBtn.vue'

const cartCount = useCartCount()
const { open } = useSiteMenu()
</script>