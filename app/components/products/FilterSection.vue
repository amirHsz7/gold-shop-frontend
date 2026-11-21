<template>
  <section class="border-b border-gray" :aria-label="title">
    <BaseBtn
      flat
      no-caps
      dense
      full
      align="between"
      inner-btn-class="w-full justify-between"
      class="ps-2! py-3.5!"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <span class="flex items-center gap-2 text-sm font-bold text-burgundy">
        {{ title }}
        <span
          v-if="active"
          class="size-1.5 rounded-full bg-burgundy"
          role="img"
          aria-label="فیلتر فعال"
        />
      </span>

      <Icon
        name="lucide:chevron-down"
        size="18px"
        class="text-dark-gray transition-transform duration-200 motion-reduce:transition-none"
        :class="{ 'rotate-180': open }"
      />
    </BaseBtn>

    <!-- باز و بسته شدن نرم با انیمیشن ارتفاع؛ وقتی بسته است محتوا قابل فوکوس نیست -->
    <div
      :id="panelId"
      class="grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!open"
    >
      <div class="-mx-1 min-h-0 overflow-hidden px-1">
        <div class="pb-4">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'

const props = withDefaults(
  defineProps<{
    title: string
    // در شروع باز باشد
    defaultOpen?: boolean
    // فیلتر این بخش فعال است (نقطه کنار عنوان؛ بخش بسته هم باز می‌شود)
    active?: boolean
  }>(),
  { defaultOpen: false, active: false },
)

const panelId = `filter-panel-${useId()}`

const open = ref(props.defaultOpen || props.active)

// وقتی فیلتر بخش فعال شد (مثلاً از آدرس یا چیپ)، باز می‌شود تا کاربر ببیند
watch(
  () => props.active,
  (value) => {
    if (value) open.value = true
  },
)
</script>