<script setup lang="ts">
type CategoryItem = {
  id: string
  name: string
  productCount: number
}

type RootCategory = {
  id: string
  children: { id: string }[]
}

const props = defineProps<{
  category: CategoryItem | null
  roots: RootCategory[]
}>()

const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ deleted: [name: string] }>()

const { request } = useApiRequest()

const isDeleting = ref(false)
const errorMessage = ref<string | null>(null)

const getErrorMessage = (error: unknown) => {
  const data = (error as { data?: { message?: string } } | null)?.data

  return data?.message ?? 'خطایی رخ داد؛ دوباره تلاش کنید'
}

// تعداد زیردسته‌های دسته از روی همان لیست درختی
const childCount = computed(
  () =>
    props.roots.find(root => root.id === props.category?.id)?.children.length
    ?? 0,
)

// دلیل‌هایی که بکند حتماً حذف را رد می‌کند
const blockedReason = computed(() => {
  if (!props.category) return null

  if (childCount.value > 0) {
    return `این دسته ${childCount.value} زیردسته دارد؛ ابتدا زیردسته‌ها را حذف یا منتقل کنید.`
  }

  if (props.category.productCount > 0) {
    return `این دسته ${props.category.productCount} محصول دارد؛ ابتدا محصولات را به دسته‌ی دیگری منتقل کنید.`
  }

  return null
})

// هر بار که دیالوگ باز می‌شود وضعیت قبلی پاک می‌شود
watch(open, (isOpen) => {
  if (!isOpen) return

  errorMessage.value = null
  isDeleting.value = false
})

const confirm = async () => {
  if (!props.category || isDeleting.value || blockedReason.value) return

  const { id, name } = props.category

  isDeleting.value = true
  errorMessage.value = null

  try {
    await request(`/admin/categories/${id}`, { method: 'DELETE' })

    emit('deleted', name)
  }
  catch (error) {
    // مثلاً: دسته محصول حذف‌شده دارد، یا دسته قبلاً حذف شده است
    errorMessage.value = getErrorMessage(error)
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <BaseDialog v-model="open" :persistent="isDeleting" position="center">
    <div dir="rtl" class="flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 class="text-base font-semibold text-gray-800">
          حذف دسته‌بندی
        </h2>
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

      <!-- Body -->
      <div class="flex flex-col gap-3 p-5 text-sm text-gray-700">
        <p>
          آیا از حذف دسته‌بندی «<strong class="text-gray-900">{{ category?.name }}</strong>»
          مطمئن هستید؟ این کار قابل بازگشت نیست و تصویر دسته هم پاک می‌شود.
        </p>

        <p
          v-if="blockedReason"
          class="rounded-lg bg-amber-50 px-3 py-2 text-amber-800"
        >
          {{ blockedReason }}
        </p>

        <p
          v-if="errorMessage"
          class="rounded-lg bg-red-50 px-3 py-2 text-red-700"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </div>

      <!-- Footer -->
      <div class="flex justify-start gap-2 border-t border-gray-200 px-5 py-3">
        <BaseBtn
          color="red"
          text-color="white"
          :disabled="isDeleting || !!blockedReason"
          @click="confirm"
        >
          {{ isDeleting ? 'در حال حذف...' : 'بله، حذف شود' }}
        </BaseBtn>
        <BaseBtn
          color="gray"
          outline
          text-color="black"
          :disabled="isDeleting"
          @click="open = false"
        >
          انصراف
        </BaseBtn>
      </div>
    </div>
  </BaseDialog>
</template>