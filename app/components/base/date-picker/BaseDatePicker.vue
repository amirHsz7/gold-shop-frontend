<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import DatePickerDays from './DatePickerDays.vue';
import DatePickerMonths from './DatePickerMonths.vue';
import DatePickerYears from './DatePickerYears.vue';
import BaseInput from '@/components/base/inputs/base-input/BaseInput.vue'
import BaseDialog from '@/components/base/dialog/BaseDialog.vue'

import * as jalaali from 'jalaali-js'

const props = withDefaults(
  defineProps<{
    modelValue?: Date | string | null
    label?: string
    inputClass?: string
    showFullDays?: boolean
    placeholder?: string
    calendarType?: 'gregorian' | 'jalali'
    openInDialog?: boolean
    emitIsoString?: boolean 
    disablePastDates?: boolean 
  }>(),
  {
    emitIsoString: false,
    calendarType: 'gregorian', 
    showFullDays: true,
    openInDialog: false,
    disablePastDates: false 
  }
)

const emit = defineEmits(['update:modelValue']);

const parseDate = (val: Date | string | null | undefined): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

// State
const datePicker = ref(false)
const currentView = ref('days');

const initialDate = parseDate(props.modelValue);

const viewDate = ref<Date>(initialDate)
const selectedDate = ref<Date>(initialDate)
const isJalali = computed(() => props.calendarType === 'jalali');
const locale = computed(() => isJalali.value ? 'fa-IR' : 'en-US');
const transitionName = ref('slide-left');

watch(
  () => props.modelValue,
  (newVal) => {
    const d = newVal ? new Date(newVal) : new Date()

    if (isNaN(d.getTime())) return

    viewDate.value = d
    selectedDate.value = d
  }
)

const headerDate = computed(() => {
  return new Intl.DateTimeFormat(locale.value, { 
    weekday: 'short', month: 'short', day: 'numeric' 
  }).format(selectedDate.value);
});

const onDaySelect = (day: number) => {
  let newDate: Date;

  if (isJalali.value) {
    const { jy, jm } = jalaali.toJalaali(viewDate.value);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, day);
    newDate = new Date(gy, gm - 1, gd, 12, 0, 0);
  } else {
    newDate = new Date(viewDate.value);
    newDate.setDate(day);
    newDate.setHours(12, 0, 0, 0);
  }

  if (props.disablePastDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(newDate);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < today) {
      return; 
    }
  }

  selectedDate.value = newDate;
  viewDate.value = newDate;

  const emitValue = props.emitIsoString ? newDate.toISOString() : newDate;
  emit('update:modelValue', emitValue);
  
  datePicker.value = false
};

const onMonthSelect = (monthIndex: number) => {
  if (isJalali.value) {
    const { jy, jd } = jalaali.toJalaali(viewDate.value);
    const maxDay = jalaali.jalaaliMonthLength(jy, monthIndex + 1);
    const safeDay = Math.min(jd, maxDay);
    
    const { gy, gm, gd } = jalaali.toGregorian(jy, monthIndex + 1, safeDay);
    viewDate.value = new Date(gy, gm - 1, gd, 12, 0, 0);
  } else {
    const newDate = new Date(viewDate.value);
    newDate.setMonth(monthIndex);
    viewDate.value = newDate;
  }
  currentView.value = 'days';
};

const onYearSelect = (year: number) => {
  if (isJalali.value) {
    const { jm, jd } = jalaali.toJalaali(viewDate.value);
    const maxDay = jalaali.jalaaliMonthLength(year, jm);
    const safeDay = Math.min(jd, maxDay);
    
    const { gy, gm, gd } = jalaali.toGregorian(year, jm, safeDay);
    viewDate.value = new Date(gy, gm - 1, gd, 12, 0, 0);
  } else {
    const newDate = new Date(viewDate.value);
    newDate.setFullYear(year);
    viewDate.value = newDate;
  }
  
  currentView.value = 'days';
};

const popupRef = ref<HTMLElement | null>(null);
const popupStyle = ref<Record<string, string>>({});

const openDatePicker = async () => {
    datePicker.value = !datePicker.value;
    
    if (datePicker.value && !props.openInDialog) {
        popupStyle.value = {}; 
        
        await nextTick(); 
        if (popupRef.value) {
            const rect = popupRef.value.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                popupStyle.value = { right: '0', left: 'auto' };
            }
            else if (rect.left < 0) {
                popupStyle.value = { left: '0', right: 'auto' };
            }
        }
    }
}
const datePickerContainer = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (!datePicker.value || !datePickerContainer.value || props.openInDialog) return;

  const path = event.composedPath();
  const isClickInside = path.includes(datePickerContainer.value);

  if (!isClickInside) {
    datePicker.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const formattedInputDate = computed(() => {
  if (!props.modelValue) {
    return '';
  }

  const dateObj = new Date(props.modelValue);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  if (props.calendarType === 'jalali') {
    return new Intl.DateTimeFormat('fa-IR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(dateObj);
  } else {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(dateObj);
  }
});

const displayYear = computed(() => {
  return isJalali.value 
    ? jalaali.toJalaali(viewDate.value).jy 
    : viewDate.value.getFullYear();
});

const viewMonthKey = computed(() => {
  if (isJalali.value) {
    const { jy, jm } = jalaali.toJalaali(viewDate.value);
    return `${jy}-${jm}`;
  }
  return `${viewDate.value.getFullYear()}-${viewDate.value.getMonth()}`;
});

const onUpdateViewDate = (newDate: Date) => {
  if (newDate.getTime() > viewDate.value.getTime()) {
    transitionName.value = 'slide-left'; 
  } else if (newDate.getTime() < viewDate.value.getTime()) {
    transitionName.value = 'slide-right';
  }
  viewDate.value = newDate;
};


const hasSelection = computed(() => {
  if (!props.modelValue) return false

  return !isNaN(new Date(props.modelValue).getTime())
})

</script>

<template>
<div ref="datePickerContainer"  class="relative overflow-visible">
  <BaseInput
      readonly
      :modelValue="formattedInputDate"
      :label="label"
      @click="openDatePicker"
      :class="inputClass"
      :placeholder="placeholder"
      dense
      hide-bottom-space
  />

  <!-- حالت Dropdown (پیش‌فرض) -->
  <Transition name="fade-scale">
    <div 
      v-if="datePicker && !openInDialog" 
      @click.stop.prevent
      ref="popupRef"
      :style="popupStyle"
      class="absolute z-[9999] h-[400px] overflow-visible w-[300px] bg-white rounded-md shadow-lg font-sans select-none"
    >
      <!-- محتوای تقویم -->
      <div class="bg-black text-white p-4 flex flex-col gap-1">
        <div 
          class="text-sm text-white cursor-pointer hover:text-white transition-colors"
          :class="{ 'text-white font-bold': currentView === 'years' }"
          @click="currentView = 'years'"
        >
          {{ displayYear }}
        </div>
        <div 
          class="text-2xl font-medium cursor-pointer hover:opacity-80 transition-opacity"
          :class="{ 'opacity-100': currentView === 'days', 'text-black/20': currentView !== 'days' }"
          @click="currentView = 'days'"
        >
          {{ headerDate }}
        </div>
      </div>

      <div class="p-3 min-h-[300px] relative overflow-hidden">
        <div v-show="currentView === 'days'" class=" !overflow-hidden">
          <DatePickerDays 
            :showFullDays="showFullDays"
            :view-date="viewDate"
            :selected-date="selectedDate"
            :locale="locale"
            :disable-past-dates="disablePastDates"
            @change-view="currentView = $event"
            :has-selection="hasSelection"
            @select-day="onDaySelect"
            @update-view-date="onUpdateViewDate" 
          />
        </div>
        <DatePickerMonths 
          v-if="currentView === 'months'" 
          :view-date="viewDate"
          :locale="locale"
          @select-month="onMonthSelect"
        />
        <DatePickerYears 
          v-if="currentView === 'years'" 
          :view-date="viewDate"
          :locale="locale"
          @select-year="onYearSelect"
        />
      </div>
    </div>
  </Transition>

  <BaseDialog 
    v-if="openInDialog" 
    v-model="datePicker"
    transitionShow="fade-slide-up"
    transitionHide="fade-slide-down"
    position="center"
    custom-class="!max-w-[300px]"
    overflow="hidden"
  >
    <div class="h-[400px] w-[300px] bg-white overflow-visible font-sans select-none">
      
      <div class="bg-black text-white p-4 flex flex-col gap-1">
        <div 
          class="text-sm text-white cursor-pointer hover:text-white transition-colors"
          :class="{ 'text-white font-bold': currentView === 'years' }"
          @click="currentView = 'years'"
        >
          {{ displayYear }}
        </div>
        <div 
          class="text-2xl font-medium cursor-pointer hover:opacity-80 transition-opacity"
          :class="{ 'opacity-100': currentView === 'days', 'text-black/20': currentView !== 'days' }"
          @click="currentView = 'days'"
        >
          {{ headerDate }}
        </div>
      </div>

      <div class="p-3 min-h-[300px] relative overflow-hidden">
        <div v-show="currentView === 'days'" class=" !overflow-hidden">
          <DatePickerDays 
            :showFullDays="showFullDays"
            :view-date="viewDate"
            :selected-date="selectedDate"
            :locale="locale"
            @change-view="currentView = $event"
            :has-selection="hasSelection"
            @select-day="onDaySelect"
            @update-view-date="onUpdateViewDate" 
          />
        </div>
        <DatePickerMonths 
          v-if="currentView === 'months'" 
          :view-date="viewDate"
          :locale="locale"
          @select-month="onMonthSelect"
        />
        <DatePickerYears 
          v-if="currentView === 'years'" 
          :view-date="viewDate"
          :locale="locale"
          @select-year="onYearSelect"
        />
      </div>

    </div>
  </BaseDialog>
</div>
</template>

<style scoped>
.fade-scale-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
.fade-scale-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  width: calc(100% - 24px);
}
.slide-left-enter-from { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to { transform: translateX(-100%); opacity: 0; }
.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to { transform: translateX(100%); opacity: 0; }
</style>
