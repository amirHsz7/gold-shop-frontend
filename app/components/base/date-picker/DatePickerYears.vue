<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import * as jalaali from 'jalaali-js';

const props = defineProps({
  viewDate: { type: Date, required: true },
  locale: { type: String, required: true }
});
const emit = defineEmits(['select-year']);

const currentYear = computed(() => {
  if (props.locale == 'fa-IR') {
    return jalaali.toJalaali(props.viewDate).jy;
  }
  return props.viewDate.getFullYear();
});

const startDecade = ref(currentYear.value - 7);
const transitionName = ref(''); 

const displayedYears = computed(() => {
  const years = [];
  for (let i = 0; i < 15; i++) {
    years.push(startDecade.value + i);
  }
  return years;
});

const formatYear = (y: number) => {
  return new Intl.NumberFormat(props.locale, { useGrouping: false }).format(y);
};

const prevDecade = () => {
  transitionName.value = 'slide-left'; 
  startDecade.value -= 15;
};

const nextDecade = () => {
  transitionName.value = 'slide-right';
  startDecade.value += 15;
};
</script>

<template>
  <div class="flex items-center justify-between h-full pb-2">
    
    <BaseBtn
      size="sm"
      color="gray"
      round
      flat
      @click="prevDecade"
      class="!text-black"
    >
      &lt;
    </BaseBtn>

    <div class="relative flex-1 overflow-hidden h-full min-h-[300px] px-2">
      <Transition :name="transitionName">
        <div 
          :key="startDecade" 
          class="grid grid-cols-3 gap-y-4 gap-x-2 absolute inset-0 w-full h-fit m-auto"
        >
          <BaseBtn
            outline
            :color="year === currentYear ? 'black' : 'white'"
            :text-color="year === currentYear ? 'white' : 'black'"
            :class="year === currentYear ? '!bg-black' : ' !bg-white'"
            v-for="year in displayedYears" 
            :key="year"
            @click="$emit('select-year', year)"
          >
            {{ formatYear(year) }}
          </BaseBtn>
        </div>
      </Transition>
    </div>

    <BaseBtn
      size="sm"
      color="gray"
      round
      flat
      @click="nextDecade"
      class="!text-black"
    >
      &gt;
    </BaseBtn>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
