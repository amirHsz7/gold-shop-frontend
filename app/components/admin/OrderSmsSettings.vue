<script setup lang="ts">
type Manager = {
  id: string
  fullName: string
  mobile: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  receivesOrderSms: boolean
}

const { $api } = useNuxtApp()
const toast = useFormToast()
const { getMessage } = useApiError()

const { data, status, refresh } = useApiFetch<{ data: Manager[] }>(
  '/admin/order-sms',
  { server: false },
)

const saving = ref<string | null>(null)

async function update(manager: Manager) {
  if (saving.value) return

  saving.value = manager.id

  try {
    const enabled = !manager.receivesOrderSms

    await $api(`/admin/order-sms/${manager.id}`, {
      method: 'PATCH',
      body: { receivesOrderSms: enabled },
    })

    await refresh()
    toast.success('تنظیم پیامک ذخیره شد.')
  }
  catch (error) {
    toast.error(getMessage(error))
    await refresh()
  }
  finally {
    saving.value = null
  }
}
</script>

<template>
  <section class="mt-6 max-w-xl rounded-xl border border-gray-200 bg-white p-5">
    <h2 class="font-semibold">گیرندگان پیامک سفارش جدید</h2>

    <p v-if="status === 'error'" role="alert">
      دریافت فهرست مدیرها انجام نشد.
      <button type="button" class="underline" @click="refresh()">
        تلاش مجدد
      </button>
    </p>

    <p v-else-if="!data">در حال دریافت مدیرها…</p>

    <ul v-else class="divide-y">
      <li
        v-for="manager in data.data"
        :key="manager.id"
        class="flex items-center justify-between gap-4 py-3"
      >
        <span>
          {{ manager.fullName }} · <bdi>{{ manager.mobile }}</bdi>
        </span>

        <button
          type="button"
          role="switch"
          :aria-label="`پیامک سفارش برای ${manager.fullName}`"
          :aria-checked="manager.receivesOrderSms"
          :disabled="saving !== null || status === 'pending'"
          class="rounded-lg border px-3 py-2"
          @click="update(manager)"
        >
          {{ saving === manager.id
            ? 'در حال ذخیره…'
            : manager.receivesOrderSms ? 'فعال' : 'غیرفعال' }}
        </button>
      </li>
    </ul>
  </section>
</template>