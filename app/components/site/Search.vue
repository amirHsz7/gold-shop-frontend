<template>
  <form role="search" class="w-full" @submit.prevent="submit">
    <BaseInput
      v-model="term"
      dense
      clearable
      hide-bottom-space
      maxlength="100"
      placeholder="جستجوی محصولات..."
      aria-label="جستجوی محصولات"
      enterkeyhint="search"
      autocomplete="off"
      box-class="!rounded-full !border-transparent !bg-nude/15"
    >
      <template #append>
        <BaseBtn
          type="submit"
          flat
          round
          size="sm"
          color="nude"
          aria-label="جستجو"
        >
          <template #icon>
            <Icon name="lucide:search" size="20px" />
          </template>
        </BaseBtn>
      </template>
    </BaseInput>
  </form>
</template>

<script setup lang="ts">
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseInput from '@/components/base/inputs/base-input/BaseInput.vue'

const emit = defineEmits<{ submitted: [] }>()

const route = useRoute()

// اگر در صفحه‌ی نتایج جستجو هستیم، عبارت فعلی نمایش داده می‌شود
const term = ref(typeof route.query.search === 'string' ? route.query.search : '')

const submit = async () => {
  const search = String(term.value ?? '').trim()

  await navigateTo({
    path: '/products',
    query: search ? { search } : {},
  })

  emit('submitted')
}
</script>