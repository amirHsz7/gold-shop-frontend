<script setup lang="ts">
import { computed, ref } from 'vue';
import * as jalaali from 'jalaali-js'
import BaseBtn from '@/components/base/button/BaseBtn.vue'

const props = defineProps({
  viewDate: { type: Date, required: true },
  selectedDate: { type: Date, required: true },
  showFullDays: { type: Boolean, required: true },
  disablePastDates: { type: Boolean, required: false },
  hasSelection: { type: Boolean, default: true },
  locale: { type: String, required: true }
});

const emit = defineEmits(['change-view', 'select-day', 'update-view-date']);
const transitionName = ref('slide-left');

const currentMonthName = computed(() => 
  new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(props.viewDate)
);
const currentYear = computed(() => 
  new Intl.DateTimeFormat(props.locale, { year: 'numeric' }).format(props.viewDate)
);

const daysInMonth = computed(() => {
    if (props.locale === 'fa-IR') {
        const { jy, jm } = jalaali.toJalaali(props.viewDate);
        return jalaali.jalaaliMonthLength(jy, jm); 
    } else {
        return new Date(props.viewDate.getFullYear(), props.viewDate.getMonth() + 1, 0,  0, 0).getDate();
    }
});

// --- بخش اضافه شده برای بررسی تاریخ‌های گذشته ---
const todayNormalized = computed(() => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
});

const isPastDate = (day: number) => {
  if (!props.disablePastDates) return false;
  
  let targetDate: Date;
  if (props.locale === 'fa-IR') {
    const { jy, jm } = jalaali.toJalaali(props.viewDate);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, day);
    targetDate = new Date(gy, gm - 1, gd, 0, 0, 0);
  } else {
    targetDate = new Date(props.viewDate.getFullYear(), props.viewDate.getMonth(), day, 0, 0, 0);
  }
  return targetDate < todayNormalized.value;
};

const disablePrevMonth = computed(() => {
  if (!props.disablePastDates) return false;
  const t = todayNormalized.value;
  if (props.locale === 'fa-IR') {
    const todayJ = jalaali.toJalaali(t);
    const viewJ = jalaali.toJalaali(props.viewDate);
    return viewJ.jy < todayJ.jy || (viewJ.jy === todayJ.jy && viewJ.jm <= todayJ.jm);
  } else {
    return props.viewDate.getFullYear() < t.getFullYear() || 
           (props.viewDate.getFullYear() === t.getFullYear() && props.viewDate.getMonth() <= t.getMonth());
  }
});

const disablePrevYear = computed(() => {
  if (!props.disablePastDates) return false;
  const t = todayNormalized.value;
  if (props.locale === 'fa-IR') {
    return jalaali.toJalaali(props.viewDate).jy <= jalaali.toJalaali(t).jy;
  } else {
    return props.viewDate.getFullYear() <= t.getFullYear();
  }
});
// ----------------------------------------------

const previousMonthTrailingDays = computed(() => {
  const offset = firstDayOffset.value;
  if (offset === 0) return [];

  let prevMonthLength = 31; 

  if (props.locale === 'fa-IR') {
    const currentJalali = jalaali.toJalaali(props.viewDate);
    let pMonth = currentJalali.jm - 1;
    let pYear = currentJalali.jy;
    if (pMonth < 1) {
      pMonth = 12;
      pYear -= 1;
    }
    prevMonthLength = jalaali.jalaaliMonthLength(pYear, pMonth);
  } else {
    const year = props.viewDate.getFullYear();
    const month = props.viewDate.getMonth(); 
    prevMonthLength = new Date(year, month, 0).getDate();
  }

  const days = [];
  for (let i = prevMonthLength - offset + 1; i <= prevMonthLength; i++) {
    days.push(i);
  }
  return days;
});

const nextMonthLeadingDays = computed(() => {
  const totalDisplayedSoFar = firstDayOffset.value + daysInMonth.value; 
  const remainingCells = totalDisplayedSoFar % 7 === 0 ? 0 : 7 - (totalDisplayedSoFar % 7);

  const days = [];
  for (let i = 1; i <= remainingCells; i++) {
    days.push(i);
  }
  return days;
});

const handleWeekDays = computed(() => {
    if (props.locale === 'fa-IR') {
        return ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    }
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
});

const firstDayOffset = computed(() => {
    if (props.locale === 'fa-IR') {
        const { jy, jm } = jalaali.toJalaali(props.viewDate);
        const { gy, gm, gd } = jalaali.toGregorian(jy, jm, 1);
        const firstDayDate = new Date(gy, gm - 1, gd,  0, 0);
        const jsDay = firstDayDate.getDay();
        return (jsDay + 1) % 7;
    } else {
        return new Date(props.viewDate.getFullYear(), props.viewDate.getMonth(), 1,  0, 0).getDay();
    }
});

const isSelectedDay = (day: number) => {
  if (!props.hasSelection) return false

  if (props.locale === 'fa-IR') {
    const selectedJalali = jalaali.toJalaali(props.selectedDate);
    const viewJalali = jalaali.toJalaali(props.viewDate);
    
    return selectedJalali.jd === day &&
           selectedJalali.jm === viewJalali.jm &&
           selectedJalali.jy === viewJalali.jy;
  } else {
    return props.selectedDate.getDate() === day &&
           props.selectedDate.getMonth() === props.viewDate.getMonth() &&
           props.selectedDate.getFullYear() === props.viewDate.getFullYear();
  }
};

const changeMonth = (offset: number) => {
  transitionName.value = offset > 0 ? 'slide-right' : 'slide-left';
  if (props.locale === 'fa-IR') {
    let { jy, jm } = jalaali.toJalaali(props.viewDate);
    jm += offset;
    
    if (jm > 12) {
      jm -= 12;
      jy++;
    } else if (jm < 1) {
      jm += 12;
      jy--;
    }
    
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, 1);
    emit('update-view-date', new Date(gy, gm - 1, gd,  0, 0));
  } else {
    const d = new Date(props.viewDate);
    d.setMonth(d.getMonth() + offset);
    emit('update-view-date', d);
  }
};

const changeYear = (offset: number) => {
  transitionName.value = offset > 0 ? 'slide-right' : 'slide-left';

  if (props.locale === 'fa-IR') {
    let { jy, jm } = jalaali.toJalaali(props.viewDate);
    jy += offset;
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, 1);
    emit('update-view-date', new Date(gy, gm - 1, gd,  0, 0));
  } else {
    const d = new Date(props.viewDate);
    d.setFullYear(d.getFullYear() + offset);
    emit('update-view-date', d);
  }
};
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-4 px-1">
      <!-- Month Control -->
      <div class="flex items-center gap-1">
        <BaseBtn
          size="sm"
          color="gray"
          round
          flat
          :disable="disablePrevMonth"
          @click="!disablePrevMonth && changeMonth(-1)"
          class="!text-black"
          :class="{ 'opacity-30 cursor-not-allowed': disablePrevMonth }"
        >
          &lt;        
        </BaseBtn>

        <div class="relative w-14 h-6 overflow-hidden flex justify-center items-center">
          <Transition :name="transitionName">
            <span 
              :key="currentMonthName" 
              class="absolute text-sm font-medium cursor-pointer hover:text-blue-600 text-center" 
              @click="$emit('change-view', 'months')"
            >
              {{ currentMonthName }}
            </span>
          </Transition>
        </div>

        <BaseBtn
          size="sm"
          color="gray"
          round
          flat
          @click="changeMonth(1)" 
          class="!text-black"
        >
          &gt;
        </BaseBtn>
      </div>
      
      <!-- Year Control -->
      <div class="flex items-center gap-1">
        <BaseBtn
          size="sm"
          color="gray"
          round
          flat
          :disable="disablePrevYear"
          @click="!disablePrevYear && changeYear(-1)"
          class="!text-black"
          :class="{ 'opacity-30 cursor-not-allowed': disablePrevYear }"
        >
          &lt;        
        </BaseBtn>

        <div class="relative w-14 h-6 overflow-hidden flex justify-center items-center">
          <Transition :name="transitionName">
            <span 
              :key="currentYear" 
              class="absolute text-sm font-medium cursor-pointer hover:text-blue-600 text-center" 
              @click="$emit('change-view', 'years')"
            >
              {{ currentYear }}
            </span>
          </Transition>
        </div>

        <BaseBtn
          size="sm"
          color="gray"
          round
          flat
          @click="changeYear(1)"
          class="!text-black"
        >
          &gt;        
        </BaseBtn>
      </div>
    </div>

    <!-- Weekdays Header -->
    <Transition :name="transitionName">
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="day in handleWeekDays" :key="day" class="text-gray-400 text-center" :class="props.locale == 'fa-IR' ? 'text-nowrap text-[8px]' : 'text-xs'">
          {{ day }}
        </div>
      </div>
    </Transition>

    <!-- Days Grid -->
    <div class="relative w-full h-64 overflow-hidden mt-2">
      <Transition :name="transitionName">
        <div 
          :key="`${currentYear}-${currentMonthName}`" 
          class="absolute top-0 left-0 w-full grid grid-cols-7 gap-1"
        >
          <BaseBtn
            v-for="day in previousMonthTrailingDays" 
            :key="'prev-' + day"
            outline
            size="sm"
            round
            disable
            color="white"
            text-color="black"
            class="!text-center !leading-none !text-[12px] !grid !place-items-center bg-white opacity-30 cursor-not-allowed"
          >
            {{ showFullDays ? day : '-' }}
          </BaseBtn>

          <BaseBtn
            outline
            size="sm"
            round
            :disable="isPastDate(day)"
            :color=" isSelectedDay(day) ? 'black' : 'white'"
            :text-color="isSelectedDay(day) ? 'white' : 'black'"
            v-for="day in daysInMonth" :key="'day-'+day"
            @click="!isPastDate(day) && $emit('select-day', day)"
            class="!text-center !leading-none !text-[12px] !grid !place-items-center transition-opacity"
            :class="[
              isSelectedDay(day) ? '!bg-black' : '!bg-white',
              isPastDate(day) ? 'opacity-30 cursor-not-allowed' : 'hover:!bg-gray-100'
            ]"
          >
            {{ day }}
          </BaseBtn>

          <BaseBtn
            v-for="day in nextMonthLeadingDays" 
            v-if="showFullDays"
            :key="'next-' + day"
            outline
            size="sm"
            round
            disable
            color="white"
            text-color="black"
            class="!text-center !leading-none !text-[12px] !grid !place-items-center bg-white opacity-30 cursor-not-allowed"
          >
            {{ day }}
          </BaseBtn>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to { transform: translateX(-100%); opacity: 0; }

.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to { transform: translateX(100%); opacity: 0; }
</style>
