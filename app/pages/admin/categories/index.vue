
<template>
  <main dir="rtl" class="mx-auto max-w-5xl px-4 py-6">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-800">دسته‌بندی‌ها</h1>

      <BaseBtn color="black" @click="openCreate">
        + افزودن دسته‌بندی
      </BaseBtn>
    </header>

    <p v-if="isLoading" class="py-10 text-center text-zinc-500">
      در حال بارگذاری...
    </p>

    <div v-else-if="error && !data" class="py-10 text-center text-red-600">
      <p>{{ errorText }}</p>
      <button
        type="button"
        class="mt-3 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
        @click="refresh()"
      >
        تلاش دوباره
      </button>
    </div>

    <BaseTree
      v-else
      :categories="categories"
      :image-base-url="config.public.apiBaseUrl"
      @edit="openEdit"
      @delete="openDelete"
    />
    <CategoryCreateDialog
      v-model="formOpen"
      :roots="categories"
      :category="editing"
      @saved="onSaved"
    />
    <CategoryDeleteDialog
      v-model="deleteOpen"
      :category="deleting"
      :roots="categories"
      @deleted="onDeleted"
    />
  </main>
</template>

<script setup lang="ts">
import CategoryCreateDialog from '~/components/admin/categories/CategoryCreateDialog.vue'
import CategoryDeleteDialog from '~/components/admin/categories/CategoryDeleteDialog.vue'
import BaseBtn from '~/components/base/button/BaseBtn.vue'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

type CategoryItem = {
  id: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  isActive: boolean
  imageUrl: string | null
  productCount: number
}

type CategoryNode = CategoryItem & { children: CategoryItem[] }
const { notify } = useToast()

const config = useRuntimeConfig()

const { data, status, error, refresh } = useApiFetch<{
  status: string
  data: CategoryNode[]
}>('/admin/categories', {
  key: 'admin-categories',
  server: false, // ادمین نیاز به SSR ندارد؛ درخواست فقط در مرورگر زده می‌شود
  lazy: true, // صفحه بدون منتظر ماندن برای درخواست باز می‌شود
})

const categories = computed(() => data.value?.data ?? [])

// فقط بارگذاری اول؛ در refresh های بعدی نمودار از بین نمی‌رود
const isLoading = computed(
  () => !data.value && (status.value === 'idle' || status.value === 'pending'),
)

const errorText = computed(
  () =>
    (error.value?.data as { message?: string } | undefined)?.message
    ?? 'دریافت لیست دسته‌بندی‌ها ناموفق بود',
)

// ───── فرم ساخت و ویرایش ─────
const formOpen = ref(false)
const editing = ref<CategoryItem | null>(null)

const notice = ref<{ kind: 'success' | 'warning'; text: string } | null>(null)

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (category: CategoryItem) => {
  editing.value = category
  formOpen.value = true
}

const onSaved = async (
  payload: { mode: 'create' | 'edit'; warning?: string },
) => {
  formOpen.value = false

  notice.value = payload.warning
    ? { kind: 'warning', text: payload.warning }
    : {
        kind: 'success',
        text: payload.mode === 'create'
          ? 'دسته‌بندی با موفقیت ساخته شد'
          : 'تغییرات دسته‌بندی ذخیره شد',
      }

  await refresh()
}

// ───── حذف ─────
const deleteOpen = ref(false)
const deleting = ref<CategoryItem | null>(null)

const openDelete = (category: CategoryItem) => {
  deleting.value = category
  deleteOpen.value = true
}

const onDeleted = async (name: string) => {
  deleteOpen.value = false
  notify({ message: `دسته‌بندی «${name}» حذف شد` , color: 'green', textColor: '#ffffff', position: 'top', timeout: 3000 })
  await refresh()
}
</script>
