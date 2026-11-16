<template>
  <div class="rounded-2xl border border-nude/25 bg-white/65 p-4 text-sm">
    <button
      type="button"
      class="flex w-full items-center justify-between font-semibold text-dark-brown lg:cursor-default"
      :aria-expanded="open"
      @click="open = !open"
    >
      جزئیات قیمت
      <Icon
        name="lucide:chevron-up"
        class="transition-transform lg:hidden"
        :class="!open && 'rotate-180'"
      />
    </button>

    <div v-show="open" class="mt-3 flex flex-col gap-2.5 lg:block!">
      <div v-for="row in rows" :key="row.label" class="flex justify-between lg:mb-2.5">
        <span class="text-dark-brown/70">{{ row.label }}</span>
        <span>{{ formatToman(row.value) }}</span>
      </div>

      <div
        v-if="breakdown.discount > 0"
        class="flex justify-between text-burgundy lg:mb-2.5"
      >
        <span>تخفیف</span>
        <span>−{{ formatToman(breakdown.discount) }}</span>
      </div>

      <div class="flex justify-between border-t border-dashed border-nude/30 pt-2.5 font-semibold">
        <span>مبلغ قابل پرداخت</span>
        <span class="text-burgundy">{{ formatToman(breakdown.final) }} تومان</span>
      </div>

      <p class="text-xs text-dark-brown/60">
        قیمت نهایی لحظه‌ی ثبت سفارش بر اساس قیمت روز طلا محاسبه می‌شود.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
type Breakdown = {
  raw: number
  fee: number
  profit: number
  vat: number
  discount: number
  final: number
}

const props = defineProps<{ breakdown: Breakdown; weight: number }>()

// در موبایل بسته شروع می‌شود و در دسکتاپ همیشه باز است
const open = ref(false)

const rows = computed(() => [
  { label: `ارزش طلای خام (${formatWeight(props.weight)} گرم)`, value: props.breakdown.raw },
  { label: 'اجرت ساخت', value: props.breakdown.fee },
  { label: 'سود فروشنده', value: props.breakdown.profit },
  { label: 'مالیات بر ارزش افزوده', value: props.breakdown.vat },
])
</script>