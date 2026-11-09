<template>
  <div class="pb-4 md:py-10 md:px-4 lg:px-[60px] transition flex flex-col w-full min-h-screen gap-4 overflow-hidden h-full bg-[#F9FAFA]" :class="customClass">

    <!-- Header & Actions -->
    <div
      class="flex px-4 md:py-4 md:px-0 flex-col md:flex-row md:items-center gap-0 md:gap-2 w-full md:justify-between"
      :class="!showBackToPrevVersionBtn && 'mt-4'"
    >
      <div class="flex items-center flex-wrap gap-2 w-full">
        <div
          class="text-xl flex-1 md:text-[28px] lg:text-[34px] flex items-center gap-2 font-semibold text-nowrap"
          :class="titleClass"
        >
        <BaseBtn
          v-if="showBackBtn"
          text-color="gray"
          unelevated
          :size="isMobile ? 'sm' : 'md'"
          color="gray"
          :outline="false"
          round
          class="!bg-transparent sm:!w-fit"
          @click="$emit('back')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </BaseBtn>

        <span class="text-center">{{ title }}</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <slot name="header-title-actions" />

          <BaseBtn
            v-if="showAddBtn"
            color="black"
            :size="isMobile ? 'sm' : 'md'"
            class="sm:!w-fit !sticky  !top-0"
            @click="$emit('add')"
          >
            {{ isMobile ? 'جدید' : addBtnText}}
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </BaseBtn>
        </div>
      </div>

      <div
        class="flex items-center gap-2 w-full md:w-fit md:justify-end flex-wrap sm:flex-nowrap"
      >
        <slot name="header-actions" />

      </div>
    </div>

    <!-- Search & Table Details -->
    <div class="flex mx-4 md:mx-0 flex-col  gap-3 md:gap-4">
      <!-- Search & Filters -->
      <div class="flex items-center gap-2">
        <BaseInput
          v-if="showSearchInput"
          v-model="searchQuery"
          class="w-full md:max-w-[420px] bg-white"
          :placeholder="searchPlaceholder"
          dense
          hide-bottom-space
        >
          <template #prepend>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 64 64"
              fill="none"
            >
              <circle
                cx="28"
                cy="28"
                r="16"
                stroke="#555966"
                stroke-width="6"
              />
              <line
                x1="39"
                y1="39"
                x2="52"
                y2="52"
                stroke="#555966"
                stroke-width="6"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </BaseInput>

        <slot name="filters" />
      </div>

      <!-- Results & Actions -->
      <div
        class="flex items-center justify-between gap-2 flex-wrap w-full"
        :class="actionsClass"
      >
        <div class="text-primary-text text-xs md:text-sm shrink-0">
          <template v-if="firstloading || loading">
            درحال دریافت اطلاعات...
          </template>
          <template v-else>
            {{ toFaNumber(totalElements) }} {{ entityName }} یافت شد
          </template>
        </div>

        <slot name="actions" />
      </div>
    </div>
    <!-- </div> -->

    <!-- Main Table -->
    <BaseTable
      :rows="paginatedRows"
      dir="rtl"
      :columns="columns"
      serverSide
      :pagination="internalPagination"

      :sort-by="sortBy"
      :sort-order="sortOrder"
      @update:sort-by="$emit('update:sortBy', $event)"
      @update:sort-order="$emit('update:sortOrder', $event)"

      v-model:modelValue="internalSelectedRows"
      :separator="separator"
      tableHeaderClass="bg-[#F4F4F6] "
      tableRowClass="py-8"
      tableClass="rounded-none md:rounded-xl"
      :showPagination="false"
      @row-click="handleRowClick"
      hideBottom
      :loading="loading"
      :firstloading="firstloading"
      :error="error"
      :selection="selection"
      :row-key="rowKey" 
      flat
      :empty="!firstloading && filteredRows.length < 1"
    >
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps || {}" />
      </template>
    </BaseTable>

    <!-- Pagination Footer -->
    <div v-if="!serverSidePagination && totalElements > 10" class="py-5 px-4 grid grid-cols-2 gap-3 items-center md:flex md:justify-between border border-[#EDEEF0] bg-white md:rounded-[10px]">
      
      <div class="col-span-1 text-nowrap flex gap-2 items-center text-primary-text text-sm">
        <span>نمایش</span>
        <BaseBtnDropdown
          padding="8px" dense anchor="bottom start" self="top start" color="gray" outline dropDownIconSize="10px"
          class="!rounded-xl !text-sm" :label="toFaNumber(rowsPerPage)"
        >
          <BaseList padding class="!pb-2">
            <BaseItem v-for="i in rowsPerPageOptions" :key="i" clickable @click="$emit('update:rowsPerPage', i); $emit('update:page', 0)" class="!px-2 hover:bg-gray-50 !gap-3">              {{ toFaNumber(i) }}
                </BaseItem>
            </BaseList>
        </BaseBtnDropdown>
        <span>از ۵۰</span>
      </div>

      <div class="col-span-1 text-primary-text text-sm text-end">
        <template v-if="totalElements > 0">
          {{ toFaNumber(page * rowsPerPage + 1) }} - {{ toFaNumber(page * rowsPerPage + paginatedRows.length) }} از {{ toFaNumber(totalElements) }} مورد
        </template>
        <template v-else>۰ مورد</template>
      </div>

      <BasePagination 
        class="col-span-2 justify-center"
         scrollToTop 
        :loading="loading" 
        size="sm" 
        :maxPages="isMobile ? 2 : 5" 
        :modelValue="page" 
        @update:modelValue="$emit('update:page', $event)" 
        :max="totalPages"
        locale="fa-IR"
        dir="rtl"
      />
    </div>
    <slot name="pagination"></slot>
    <BaseToast />
    <slot name="dialogs"></slot>

    <div id="local-root" class="!z-[9999]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseTable from '@/components/base/table/BaseTable.vue'
import BaseToast from '@/components/base/toast/BaseToast.vue'
import BasePagination from '@/components/base/pagination/BasePagination.vue'
import BaseBtnDropdown from '@/components/base/button/BaseBtnDropdown.vue'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseList from '@/components/base/list/BaseList.vue'
import BaseItem from '@/components/base/item/BaseItem.vue'
import BaseInput from '@/components/base/inputs/base-input/BaseInput.vue'

import { toFaNumber } from '@/utils/formatNumber.ts'
import { useMobile } from '@/composables/useMobile'
import type { Column, SeparatorKey } from '../table/types'

const { isMobile } = useMobile()

export interface Props {
  title: string;
  titleClass?: string;
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  customClass?: string;
  entityName?: string;
  actionsClass?: string;
  addBtnText?: string;
  backBtnText?: string;
  showAddBtn?: boolean;
  showBackBtn?: boolean;
  search?: string
  showBackToPrevVersionBtn?: boolean;
  rowKey?: string
  showSearchInput?: boolean;
  rowClick?: (payload: { row: any; index: number }) => void
  searchPlaceholder?: string;
  columns: Column[]; 
  rows: any[];    
  loading?: boolean;
  separator?: SeparatorKey;
  firstloading?: boolean;
  error?: boolean;
  empty?: boolean;
  page?: number;
  rowsPerPage?: number;
  selectedRows?: any[];
  selection?: 'single' | 'multiple' | undefined
  serverSidePagination?: boolean
  serverSideSearch?: boolean
  totalElements?: number
  totalPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  entityName: 'مورد',
  addBtnText: 'افزودن جدید',
  backBtnText: 'بازگشت',
  showAddBtn: true,
  separator:'horizontal',
  showBackBtn: true,
  showBackToPrevVersionBtn: true,
  serverSideSearch: false,
  searchPlaceholder: 'جستجو...',
  search: '',
  loading: false,
  sortBy: undefined,
  sortOrder: undefined,
  showSearchInput: true,
  rowKey: 'id',
  firstloading: false,
  error: false,
  empty: false,
  page: 0,
  rowsPerPage: 10,
  selection: undefined,
  selectedRows: () => [],
  serverSidePagination: false,
  totalElements: undefined,
  totalPages: undefined,
});

const emit = defineEmits([
  'back',
  'add',
  'backToPrevVersion',
  'update:page',
  'update:rowsPerPage',
  'update:selectedRows',
  'update:sortBy',
  'update:sortOrder',
  'update:search',
  'rowClick'
])

const rowsPerPageOptions = [10, 20, 50]
const searchQuery = ref(props.search)

let searchTimeout: ReturnType<typeof setTimeout>

watch(
  () => props.search,
  (value) => {
    if (value !== searchQuery.value) {
      searchQuery.value = value
    }
  }
)

watch(searchQuery, (value) => {
  if (!props.serverSideSearch) {
    if (props.page !== 0) {
      emit('update:page', 0)
    }
    return
  }

  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    if (props.page !== 0) {
      emit('update:page', 0)
    }

    emit('update:search', value)
  }, 400)
})

const filteredRows = computed(() => {
  if (props.serverSideSearch) {
    return props.rows
  }

  if (!searchQuery.value) {
    return props.rows
  }

  const query = searchQuery.value.toLowerCase()

  return props.rows.filter(row => {
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(query)
    )
  })
})

const totalElements = computed(() => {
  if (props.serverSidePagination) {
    return props.totalElements ?? 0
  }

  return filteredRows.value.length
})

const totalPages = computed(() => {
  if (props.serverSidePagination) {
    return props.totalPages ?? 0
  }

  return Math.ceil(
    filteredRows.value.length / props.rowsPerPage
  ) || 0
})

const paginatedRows = computed(() => {
  if (props.serverSidePagination) {
    // API خودش pagination را انجام داده
    return props.rows
  }

  // Client-side pagination
  const start = props.page * props.rowsPerPage
  const end = start + props.rowsPerPage

  return filteredRows.value.slice(start, end)
})

const internalPagination = computed(() => ({
  page: props.page,
  rowsPerPage: props.rowsPerPage,
  totalElements: totalElements.value,
  totalPages: totalPages.value,
}))

const internalSelectedRows = computed({
  get: () => props.selectedRows,
  set: (val) => emit('update:selectedRows', val)
})

const handleRowClick = (payload: { row: any; index: number }) => {
  
  emit('rowClick' , payload.row)
}
</script>
