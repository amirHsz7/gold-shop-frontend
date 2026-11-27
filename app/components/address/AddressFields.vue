<script setup lang="ts">
import BaseInput from '~/components/base/inputs/base-input/BaseInput.vue'
import BaseSelect from '~/components/base/select/BaseSelect.vue'
import { IRAN_PROVINCES, citiesOf } from '~/utils/iran-geo'

const province = defineModel<string>('province', { required: true })
const city = defineModel<string>('city', { required: true })
const address = defineModel<string>('address', { required: true })
const postalCode = defineModel<string>('postalCode', { required: true })

defineProps<{ errors?: Record<string, string> }>()

const provinceOptions = IRAN_PROVINCES.map(name => ({ label: name, value: name }))
const cityOptions = computed(() =>
  citiesOf(province.value).map(name => ({ label: name, value: name })),
)

function selectProvince(value: string) {
  province.value = value
  if (!citiesOf(value).includes(city.value)) city.value = ''
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <BaseSelect
        :model-value="province"
        :options="provinceOptions"
        label="استان"
        placeholder="انتخاب استان"
        emit-value
        searchable
        :error="!!errors?.province"
        :error-message="errors?.province"
        @update:model-value="selectProvince"
      />
      <BaseSelect
        v-model="city"
        :options="cityOptions"
        label="شهر"
        placeholder="انتخاب شهر"
        emit-value
        searchable
        :error="!!errors?.city"
        :error-message="errors?.city"
      />
    </div>

    <BaseInput
      v-model="address"
      type="textarea"
      rows="3"
      maxlength="500"
      label="آدرس کامل"
      autocomplete="street-address"
      :error="!!errors?.address"
      :error-message="errors?.address"
    />

    <BaseInput
      v-model="postalCode"
      type="tel"
      label="کد پستی (۱۰ رقم)"
      autocomplete="postal-code"
      inputmode="numeric"
      maxlength="10"
      dir="ltr"
      input-class="text-right"
      :error="!!errors?.postalCode"
      :error-message="errors?.postalCode"
    />
  </div>
</template>