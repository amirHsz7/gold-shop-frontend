<script setup lang="ts">
import { computed } from 'vue';
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import * as jalaali from 'jalaali-js' 
const props = defineProps({
  viewDate: { type: Date, required: true },
  locale: { type: String, required: true }
});
const emit = defineEmits(['select-month']);

const currentMonthIndex = computed(() => {
  if (props.locale === 'fa-IR') {
    return jalaali.toJalaali(props.viewDate).jm - 1; 
  }
  return props.viewDate.getMonth();
});

const months = computed(() => {
  if (props.locale === 'fa-IR') {
    return [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
  }
  
  const result = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2000, i, 1); 
    result.push(new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(d));
  }
  return result;
});
</script>

<template>
  <div class="py-4 h-full flex items-center">
    <div class="grid grid-cols-3 gap-4 w-full">
    <BaseBtn
        outline
        :color=" index === currentMonthIndex ? 'black' : 'white'"
        :text-color="index === currentMonthIndex ? 'white' : 'black'"
        :class="index === currentMonthIndex ? '!bg-black' : ' !bg-white'"
        v-for="(month, index) in months" 
        :key="index"
        @click="$emit('select-month', index)"
      >
        {{ month }}
      </BaseBtn>
    </div>
  </div>
</template>
