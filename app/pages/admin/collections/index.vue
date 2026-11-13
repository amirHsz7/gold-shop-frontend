<template>
  <BaseListPage
    title="کالکشن‌ها"
    entity-name="کالکشن"
    add-btn-text="افزودن کالکشن"
    search-placeholder="جستجوی کالکشن..."
    :show-back-btn="false"
    :columns="columns"
    v-model:page="page"
    v-model:rowsPerPage="rowsPerPage"
    :rows="collections"
    :firstloading="isFirstLoading"
    :loading="isRefreshing"
    :error="!!error"
    @add="openCreate"
    @row-click="openEdit"
  >
    <!-- تصویر -->
<!-- تصویر -->
<template #body-cell(image)="props">
  <BaseImg
    v-if="props.row.imageUrl"
    :src="assetUrl(props.row.imageUrl)"
    :alt="props.row.name"
    width="40px"
    height="40px"
    fit="cover"
    no-spinner
    class="shrink-0 rounded-md border border-gray-200 bg-gray-100"
  >
    <!-- آیکون پیش‌فرض خطا ۴۰ پیکسل است و از کادر بیرون می‌زند -->
    <template #error>
      <svg
        class="h-5 w-5 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </template>
  </BaseImg>

  <span
    v-else
    class="flex shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400"
    style="width: 40px; height: 40px"
    aria-hidden="true"
  >
    —
  </span>
</template>

    <!-- اسلاگ -->
    <template #body-cell(slug)="props">
      <span dir="ltr" class="text-xs text-gray-500">{{ props.row.slug }}</span>
    </template>

    <!-- تعداد محصول -->
    <template #body-cell(productCount)="props">
      <span>{{ toFaNumber(props.row.productCount) }}</span>
    </template>

    <!-- ترتیب -->
    <template #body-cell(sortOrder)="props">
      <span>{{ toFaNumber(props.row.sortOrder) }}</span>
    </template>

    <!-- وضعیت -->
    <template #body-cell(isActive)="props">
      <span
        class="rounded-full px-2.5 py-0.5 text-xs"
        :class="props.row.isActive
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'"
      >
        {{ props.row.isActive ? 'فعال' : 'غیرفعال' }}
      </span>
    </template>

    <!-- عملیات -->
    <template #body-cell(actions)="props">
      <div class="flex items-center gap-1.5">
        <BaseBtn
          size="sm"
          outline
          color="gray"
          text-color="black"
          class="!bg-white"
          @click.stop="openEdit(props.row)"
        >
          ویرایش
        </BaseBtn>
        <BaseBtn
          size="sm"
          outline
          color="gray"
          class="!bg-white !text-red-600"
          @click.stop="askDelete(props.row)"
        >
          حذف
        </BaseBtn>
      </div>
    </template>
    <template #actions>
      <p
        v-if="notice"
        class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
        :class="notice.kind === 'success'
          ? 'bg-green-50 text-green-800'
          : 'bg-amber-50 text-amber-800'"
        role="status"
      >
        <span>{{ notice.text }}</span>
        <button type="button" aria-label="بستن پیام" @click="notice = null">×</button>
      </p>
    </template>

    <!-- دیالوگ‌ها -->
    <template #dialogs>
      <CollectionFormDialog
        v-model="formOpen"
        :collection="editing"
        @saved="onSaved"
      />
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import BaseListPage from '@/components/base/list-page/BaseListPage.vue' // مسیر واقعی BaseListPage خودت
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import type { Column } from '@/components/base/table/types'
import { toFaNumber } from '@/utils/formatNumber.ts'
import CollectionFormDialog from '~/components/admin/collections/CollectionFormDialog.vue'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

type CollectionRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  imageUrl: string | null
  productCount: number
}
const config = useRuntimeConfig()
const page = ref(0) // صفحه از صفر شروع می‌شود
const rowsPerPage = ref(10)

const { data, status, error , refresh } = useApiFetch<{
  status: string
  data: CollectionRow[]
}>('/admin/collections', {
  key: 'admin-collections',
  server: false, // ادمین نیاز به SSR ندارد
  lazy: true,
})

const collections = computed(() => data.value?.data ?? [])

// فقط بارگذاری اول؛ بعد از refresh ها جدول از بین نمی‌رود
const isFirstLoading = computed(
  () => !data.value && (status.value === 'idle' || status.value === 'pending'),
)
const isRefreshing = computed(() => !!data.value && status.value === 'pending')

// imageUrl بکند نسبی است (/uploads/...)
const assetUrl = (path: string) => `${config.public.apiBaseUrl}${path}`

const columns: Column[] = [
  { name: 'image', label: 'تصویر', field: 'imageUrl' },
  { name: 'name', label: 'نام کالکشن', field: 'name' },
  { name: 'slug', label: 'اسلاگ', field: 'slug' },
  { name: 'productCount', label: 'تعداد محصول', field: 'productCount' },
  { name: 'sortOrder', label: 'ترتیب', field: 'sortOrder' },
  { name: 'isActive', label: 'وضعیت', field: 'isActive' },
  { name: 'actions', label: 'عملیات', field: 'id' },
]

// فرم ساخت و ویرایش و دیالوگ حذف در مرحله‌ی بعد وصل می‌شوند
const formOpen = ref(false)
const editing = ref<CollectionRow | null>(null)

const notice = ref<{ kind: 'success' | 'warning'; text: string } | null>(null)

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (row: CollectionRow) => {
  editing.value = row
  formOpen.value = true
}

const toast = useFormToast()

const onSaved = async (
  payload: { mode: 'create' | 'edit'; warning?: string },
) => {
  formOpen.value = false

  if (payload.warning) {
    toast.warning(payload.warning)
  }
  else {
    toast.success(
      payload.mode === 'create'
        ? 'کالکشن با موفقیت ساخته شد'
        : 'تغییرات کالکشن ذخیره شد',
    )
  }

  await refresh()
}
const askDelete = (row: CollectionRow) => {
  console.log('delete collection', row)
}
</script>