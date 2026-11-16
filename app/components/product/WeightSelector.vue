<template>
  <div class="flex flex-col gap-3">
    <span class="text-sm font-semibold text-dark-brown">انتخاب وزن</span>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        :disabled="item.stock <= 0"
        :aria-pressed="item.id === modelValue"
        class="flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px] text-sm transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:border-nude/30 disabled:bg-transparent disabled:text-dark-brown/40"
        :class="
          item.id === modelValue
            ? 'border-burgundy bg-burgundy text-cream'
            : 'border-gold bg-white text-dark-brown hover:border-burgundy'
        "
        @click="emit('update:modelValue', item.id)"
      >
        <span class="font-semibold" :class="item.stock <= 0 && 'line-through'">
          {{ formatWeight(item.weight) }} گرم
        </span>
        <span class="text-xs opacity-80">
          {{ item.stock <= 0 ? 'ناموجود' : price(item) }}
        </span>
      </button>
    </div>

    <p v-if="lowStock" class="text-xs text-burgundy">
      فقط {{ toFa(lowStock) }} عدد از این وزن در انبار مانده است
    </p>
  </div>
</template>

<script setup lang="ts">
type WeightItem = {
  id: string
  weight: number
  stock: number
  price: number | null
}

const props = defineProps<{
  items: WeightItem[]
  modelValue: string | null
}>()

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

const toFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

const price = (item: WeightItem) =>
  item.price === null ? '—' : formatToman(item.price)

// هشدار کمبود موجودی برای وزن انتخاب‌شده (حداکثر ۳ عدد)
const lowStock = computed(() => {
  const selected = props.items.find(item => item.id === props.modelValue)

  return selected && selected.stock > 0 && selected.stock <= 3
    ? selected.stock
    : 0
})
</script>