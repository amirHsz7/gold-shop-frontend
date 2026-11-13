<template>
  <BaseDialog v-model="open" :persistent="isDeleting" position="center">
    <div dir="rtl" class="flex flex-col">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 class="text-base font-semibold text-gray-800">حذف بخش</h2>
        <button
          type="button"
          class="text-2xl leading-none text-gray-500 hover:text-gray-800 disabled:opacity-50"
          aria-label="بستن"
          :disabled="isDeleting"
          @click="open = false"
        >
          ×
        </button>
      </div>

      <div class="flex flex-col gap-3 p-5 text-sm text-gray-700">
        <p>
          آیا از حذف بخش «<strong class="text-gray-900">{{ displayName }}</strong>»
          مطمئن هستید؟ این کار قابل بازگشت نیست.
        </p>

        <p
          v-if="itemCount > 0"
          class="rounded-lg bg-amber-50 px-3 py-2 text-amber-800"
        >
          {{ toFaNumber(itemCount) }} آیتم تصویری این بخش هم همراه عکس‌هایشان پاک می‌شوند.
          اگر فقط می‌خواهید از سایت پنهان شود، بخش را خاموش کنید.
        </p>
      </div>

      <div class="flex justify-start gap-2 border-t border-gray-200 px-5 py-3">
        <BaseBtn
          color="red"
          text-color="white"
          :loading="isDeleting"
          @click="confirm"
        >
          بله، حذف شود
        </BaseBtn>
        <BaseBtn
          color="gray"
          outline
          text-color="black"
          :disable="isDeleting"
          @click="open = false"
        >
          انصراف
        </BaseBtn>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import { toFaNumber } from '@/utils/formatNumber.ts'
import { HOME_TYPE_LABELS, type HomeSection } from '~/types/home'

const props = defineProps<{ section: HomeSection | null }>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{ deleted: [name: string] }>()

const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage } = useApiError()

const isDeleting = ref(false)

const displayName = computed(() =>
  props.section
    ? props.section.title || HOME_TYPE_LABELS[props.section.type]
    : '',
)

const itemCount = computed(() => props.section?.items?.length ?? 0)

const confirm = async () => {
  if (!props.section || isDeleting.value) return

  const name = displayName.value

  isDeleting.value = true

  try {
    await request(`/admin/home/sections/${props.section.id}`, {
      method: 'DELETE',
    })

    emit('deleted', name)
  }
  catch (error) {
    toast.error(getMessage(error))
  }
  finally {
    isDeleting.value = false
  }
}
</script>