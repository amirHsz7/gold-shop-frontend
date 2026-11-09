<template>
  <div class="flex items-center gap-2">
    <!-- icon first -->
    <BaseBtn
      v-if="boundaryLinks"
      @click="firstPage"
      :outline="true"
      color="gray"
      :size="size"
      :disable="handlePrevBtn"
      text-color="black"
    >
      <slot name="first-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
          fill="none"
        >
          <!-- For LTR: show double left arrows, For RTL: show double right arrows -->
          <template v-if="dir === 'ltr'">
            <path
              d="M38 16 L22 32 L38 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M52 16 L36 32 L52 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>
          <template v-else>
            <path
              d="M26 16 L42 32 L26 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 16 L28 32 L12 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>
        </svg>
      </slot>
    </BaseBtn>

    <!-- icon prev -->
    <BaseBtn
      v-if="directionLinks"
      :disable="handlePrevBtn"
      @click="prevPage"
      :size="size"
      :outline="true"
      color="gray"
      text-color="black"
    >
      <slot name="prev-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
          fill="none"
        >
          <!-- For LTR: left arrow, For RTL: right arrow -->
          <path
            v-if="dir === 'ltr'"
            d="M38 16 L22 32 L38 48"
            stroke="black"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M26 16 L42 32 L26 48"
            stroke="black"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </BaseBtn>

    <!-- btns -->
    <BaseBtn
      v-for="page in handlePages"
      :disable="loading"
      :size="size"
      @click="emitPage(page)"
      :key="page"
      :outline="modelValue == page ? false : true"
      :color="modelValue == page ? 'black' : 'gray'"
      :text-color="modelValue == page ? 'white' : 'black'"
    >
      {{ locale == 'fa-IR' ? toFaNumber(page + 1) : page + 1 }}
    </BaseBtn>

    <!-- icon next -->
    <BaseBtn
      v-if="directionLinks"
      :disable="handleNextBtn"
      @click="nextPage"
      :size="size"
      :outline="true"
      color="gray"
      text-color="black"
    >
      <slot name="next-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
          fill="none"
        >
          <!-- For LTR: right arrow, For RTL: left arrow -->
          <path
            v-if="dir === 'ltr'"
            d="M26 16 L42 32 L26 48"
            stroke="black"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M38 16 L22 32 L38 48"
            stroke="black"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </BaseBtn>

    <!-- icon last -->
    <BaseBtn
      v-if="boundaryLinks"
      :disable="handleNextBtn"
      @click="lastPage"
      :size="size"
      :outline="true"
      color="gray"
      text-color="black"
    >
      <slot name="last-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
          fill="none"
        >
          <!-- For LTR: double right arrows, For RTL: double left arrows -->
          <template v-if="dir === 'ltr'">
            <path
              d="M26 16 L42 32 L26 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 16 L28 32 L12 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>
          <template v-else>
            <path
              d="M38 16 L22 32 L38 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M52 16 L36 32 L52 48"
              stroke="black"
              stroke-width="6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>
        </svg>
      </slot>
    </BaseBtn>
  </div>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import { toFaNumber } from '@/utils/formatNumber'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | string
    toFn?: Function
    maxPages?: number | string
    min?: number | string
    max?: number | string
    disable?: boolean
    locale?: string
    loading?: boolean
    directionLinks?: boolean
    boundaryLinks?: boolean
    scrollToTop?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
    dir?: 'ltr' | 'rtl'
  }>(),
  {
    toFn: (page) => {},
    modelValue: 1,
    maxPages: 5,
    size: 'md',
    min: 0,
    max: 10,
    directionLinks: true,
    boundaryLinks: true,
    scrollToTop: true,
    dir: 'ltr',
  },
)

const emit = defineEmits(['update:modelValue'])

const minimum = ref(+props.min)
const maximum = ref(+props.maxPages)
const handlePages = computed(() => {
  const current = +props.modelValue
  const total = +props.max - 1
  const maxVisible = +props.maxPages
  const min = +props.min

  if (total - min + 1 <= maxVisible) {
    return Array.from({ length: total - min + 1 }, (_, i) => min + i)
  }

  const half = Math.floor(maxVisible / 2)
  let start = Math.max(min, current - half)
  let end = Math.min(total, start + maxVisible - 1)

  if (end === total) {
    start = Math.max(min, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const emitPage = (page: number) => {
  emit('update:modelValue', page)
}

// go to first page
const firstPage = () => {
  emit('update:modelValue', props.min)
}

// go to last page
const lastPage = () => {
  emit('update:modelValue', +props.max - 1)
}

// go to prev page
const prevPage = () => {
  emit('update:modelValue', +props.modelValue - 1)
}

// go to next page
const nextPage = () => {
  emit('update:modelValue', +props.modelValue + 1)
}

const handlePrevBtn = computed(() => {
  return props.loading || +props.modelValue === +props.min
})

const handleNextBtn = computed(() => {
  return props.loading || +props.modelValue === +props.max - 1
})

watch(
  () => props.modelValue,
  () => {
    if (props.scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  },
)
</script>
