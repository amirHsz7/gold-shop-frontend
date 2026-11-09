<template>
  <div :dir="dir" :class="handleGeneralClasses">
    <!-- top section-->
    <div class="px-4 flex items-center justify-between">
      <slot name="top"/>
    </div>

    <!-- title -->
    <div 
      v-if="title"
      class="px-4 w-full" 
      :class="dense ? 'py-1.5' : 'py-3'"
    >
      {{title}}
    </div>

    <!-- loading -->
    <div 
      v-if="loading && !$slots.loading"
      class="absolute w-full py-1 overflow-hidden"
    >
      <div class="absolute top-0 left-0 w-full h-0.5 ">
        <div 
          class="absolute top-0 left-0 w-full h-full bg-primary-500 transform anim animate-[loading-bar_1.5s_ease-in-out_infinite]"
        ></div>
          <!-- :class="isCustomColor ? '' : `bg-${color}`"
          :style="isCustomColor ? { backgroundColor: color } : undefined" -->
      </div>
    </div>

    <slot name="loading" v-else-if="loading"></slot>


    <table class="w-full px-4 min-w-max">
      <!-- header -->
      <thead class="">
        <tr class="text-[12px] font-semibold [&>*:first-child]:border-r-0">
          <th 
            v-if="selection"
            :class="handleThClass">

            <BaseCheckbox 
              v-if="selection === 'multiple'"
              :modelValue="allRowsSelected" 
              @update:modelValue="toggleSelectAll()"
              toggleIndeterminate
              size="md"
              :color="'blue'"
            />
          </th>
          <slot name="header">

          </slot>
          <th v-if="!$slots.header" v-for="col in columns"
            :key="col.name"
            @click="col.sortable && sort(col.name)"
            :class="[
              handleThClass,
              col.align === 'center' ? 'text-center' : col.align === 'end' ? 'text-end' : 'text-start'
            ]">

            <div 
              class="flex items-center space-x-1 space-x-reverse"
              :class="col.align === 'center' ? 'justify-center' : col.align === 'end' ? 'justify-end' : 'justify-start'">
            
              <span>{{ col.label }}</span>

              <span v-if="col.sortable" class="select-none">
                <svg v-if="isSortedDesc(col.name)" :class="isSortedDesc(col.name) ? 'fill-black block' : 'fill-gray-600 '"  class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5 5 5-5H5z"/>
                </svg>

                <svg v-else-if="isSortedAsc(col.name)" class="w-3 h-3" :class="isSortedAsc(col.name) ? 'fill-black block' : 'fill-gray-600 '" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 12l5-5 5 5H5z"/>
                </svg>

                <svg v-else class="w-3 h-3 hover:fill-gray-600 block fill-none" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 12l5-5 5 5H5z"/>
                </svg>

              </span>
            </div>
          </th>
        </tr>
      </thead>

      <!-- body -->
      <tbody v-if="!error" class=" w-full overflow-y-auto [&>tr:last-child>td]:!border-b-0" :style="{maxHeight : maxHeight || 'none' }">
        <tr 
          v-for="(row, rowIndex) in paginatedAndSortedRows"
          :key="getRowKey(row, rowIndex)"
          @click="onRowClick(row, rowIndex)"
          class="[&>*:first-child]:border-r-0 bg-white cursor-pointer hover:bg-gray-100"
          :class="[
            { 'bg-gray-200': isSelected(row) },
            clickable || selection ? 'cursor-pointer hover:bg-gray-100' : '',
            tableRowClassFn ? tableRowClassFn(row) : '',
            tableRowClass
          ]">

          <td 
            v-if="selection" 
            :class="`${handleTdClass}`">

            <BaseCheckbox v-if="selection === 'multiple'" :modelValue="isSelected(row)" @update:modelValue="toggleRowSelection(row)" size="md" :color="'blue'"/>

            <BaseCheckbox v-else-if="selection === 'single'" :modelValue="isSelected(row)" @update:modelValue="selectSingleRow(row)" size="md" :color="'blue'"/>
          </td>

          <td 
            v-for="col in columns"
            :key="col.name"
            :class="[
              handleTdClass,
              col.align === 'center' ? 'text-center' : col.align === 'end' ? 'text-end' : 'text-start',
              tableRowClassFn ? tableRowClassFn(row) : ''
            ]">

            <slot :name="`body-cell(${col.name})`"
                  :row="row"
                  :value="getFieldValue(row, col)">
              {{ col.format ? col.format(getFieldValue(row, col)) : getFieldValue(row, col) }}
            </slot>
          </td>

        </tr>
      </tbody>
    </table>

    <slot v-if="!error && empty" name="empty">
      <div class="bg-white  h-[300px] w-full overflow-hidden flex flex-col justify-center items-center">
          <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="128"
                height="128"
                viewBox="0 0 64 64"
                fill="none"
              >
                <!-- کادر دیتا -->
                <rect
                  x="12"
                  y="12"
                  width="40"
                  height="40"
                  rx="6"
                  stroke="#9CA3AF"
                  stroke-width="2"
                />

                <!-- خطوط دیتای فرضی -->
                <line x1="20" y1="24" x2="44" y2="24" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
                <line x1="20" y1="32" x2="44" y2="32" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>

                <!-- خط no data -->
                <line
                  x1="18"
                  y1="46"
                  x2="46"
                  y2="18"
                  stroke="#9CA3AF"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
          </div>
          <div>موردی یافت نشد</div>
      </div>
    </slot>
    <slot v-if="error" name="error">
      <div class="bg-white h-[300px] w-full overflow-hidden flex flex-col justify-center items-center">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#F4F4F6"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>خطا در دریافت اطلاعات</div>
      </div>
    </slot>

    <slot name="firstloading" >
      <div v-if="firstloading" class="bg-white h-[800px] w-full p-4 overflow-hidden flex flex-col gap-3 ">
          <div
            v-for="i in pagination?.rowsPerPage" 
            :key="i"
            class="py-8 w-full bg-gray-100 rounded-lg transition-all transform animate-pulse duration-400">

          </div>
      </div>
    </slot>
    <!-- bottom section -->
    <div 
      v-if="!hideBottom"
      class="px-4 border-t flex items-center gap-4"
      :class="[
        dense ? 'py-1' : 'py-2',
        dir === 'rtl' ? 'flex-row-reverse ' : 'flex-row-reverse  justify-start'
      ]">
        <slot name="bottom">
            <template v-if="pagination && !hidePagination">
              <div class="flex gap-2">
                <BaseBtn
                  @click="prevPage"
                  :disabled="pagination.page <= 1"
                  round
                  flat
                  color="white"
                  text-color="black"
                >
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="dir === 'rtl' ? '-rotate-90' : 'rotate-90'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </BaseBtn>

                <BaseBtn
                  @click="nextPage"
                  :disabled="pagination.page >= pageCount"
                  round
                  flat
                  color="white"
                  text-color="black"
                >
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="dir === 'rtl' ? 'rotate-90' : '-rotate-90'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>          
                </BaseBtn>
              </div>

              <span class="text-gray-700">
                {{ (pagination.page - 1) * pagination.rowsPerPage + 1 }} - {{ Math.min(pagination.page * pagination.rowsPerPage, pagination.total || rows.length) }} / {{pagination.total}}
              </span>

              <div class="flex items-center">
                <BaseBtnDropdown
                  dense
                  flat
                  class="bg-transparent text-[13px] font-medium text-gray-700"
                  :label="`ردیف های هر صفحه   ${pagination.rowsPerPage} :`"
                >
                  <BaseList padding class="!pb-2">
                    <BaseItem
                      v-for="i in 10"
                      :key="i"
                      clickable
                      @click="updateRowsPerPage(i)"
                      class="!px-5 !py-2.5 hover:bg-gray-50 !gap-3"
                    >
                    {{i}}
                    </BaseItem>
                  </BaseList>
                </BaseBtnDropdown>
              </div>
            </template>
        </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, getCurrentInstance, watch } from 'vue'
import BaseCheckbox from '@/components/base/inputs/BaseCheckbox.vue'
import BaseBtn from '@/components/base/button/BaseBtn.vue'
import BaseBtnDropdown from '@/components/base/button/BaseBtnDropdown.vue'
import BaseList from '@/components/base/list/BaseList.vue'
import BaseItem from '@/components/base/item/BaseItem.vue'
import { separator, type Column} from './types'


interface Pagination {
  page: number
  rowsPerPage: number
  total?: number
}

const predefinedColors = ['blue', 'red', 'green', 'yellow', 'indigo', 'gray'] as const
type PredefinedColor = typeof predefinedColors[number]

interface Props {
  rows: any[]
  columns: Column[]
  rowKey?: string
  serverSide?: boolean
  pagination?: Pagination
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  modelValue?: any[]
  clickable?: boolean
  title?: string
  loading?:boolean
  firstloading?:boolean
  flat?: boolean
  bordered?: boolean
  square?: boolean
  dense?: boolean
  maxHeight?: string
  hidePagination?: boolean
  hideBottom?: boolean
  separator?: Separator
  color?: PredefinedColor | string
  tableHeaderClass?: string
  tableRowClassFn?: Function
  tableRowClass?: string
  tableClass?: string
  error?: boolean
  empty?:boolean
  dir?: 'ltr' | 'rtl'
  selection?: 'single' | 'multiple' | undefined
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  square: false,
  loading: false,
  dense: false,
  empty: false,
  hidePagination: false,
  firstloading: false,
  hideBottom: false,
  dir: 'rtl',
  separator: 'horizontal',
  selection: undefined,
  color: '',
  serverSide: false,
  error: false
});

const emit = defineEmits<{
  (e: 'update:pagination', payload: Pagination): void
  (e: 'update:sortBy', payload: string): void
  (e: 'update:sortOrder', payload: 'asc'|'desc'): void
  (e: 'update:modelValue', payload: any[]): void
  (e: 'row-click', payload: { row: any, index: number}): void
}>()

const { rows, columns, pagination, sortBy, sortOrder, selection, modelValue, clickable, rowKey , loading } = toRefs(props)

// Get unique ID for radio group
const instance = getCurrentInstance()
const _uid = instance?.uid || Math.random().toString(36).substr(2, 9)

const internalSortBy = ref<string>('')
const internalSortOrder = ref<'asc' | 'desc'>('asc')

const isSortControlled = computed(() =>
  props.sortBy !== undefined && props.sortOrder !== undefined
)


const activeSortBy = computed({
  get: () =>
    isSortControlled.value
      ? sortBy.value || ''
      : internalSortBy.value,

  set: (val) => {
    if (!isSortControlled.value) {
      internalSortBy.value = val
    }

    emit('update:sortBy', val)
  }
})

const activeSortOrder = computed({
  get: () =>
    isSortControlled.value
      ? sortOrder.value || 'asc'
      : internalSortOrder.value,

  set: (val) => {
    if (!isSortControlled.value) {
      internalSortOrder.value = val
    }

    emit('update:sortOrder', val)
  }
})




function getFieldValue(row: any, col: Column) {
  return typeof col.field === 'function'
    ? col.field(row)
    : row[col.field]
}

function sort(colName: string) {
  if (activeSortBy.value === colName) {
    activeSortOrder.value =
      activeSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    activeSortBy.value = colName
    activeSortOrder.value = 'asc'
  }
}

function isSortedAsc(colName: string) {
  return activeSortBy.value === colName && activeSortOrder.value === 'asc'
}
function isSortedDesc(colName: string) {
  return activeSortBy.value === colName && activeSortOrder.value === 'desc'
}

const sortedRows = computed(() => {
  if (isSortControlled.value || !activeSortBy.value) {
    return rows.value
  }

  const col = columns.value.find(c => c.name === activeSortBy.value)

  if (!col) return rows.value

  return [...rows.value].sort((a, b) => {
    const va = getFieldValue(a, col)
    const vb = getFieldValue(b, col)
    if (va < vb) return activeSortOrder.value === 'asc' ? -1 : 1
    if (va > vb) return activeSortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})


// pagination 
const pageCount = computed(() => {
  if (!pagination.value || !pagination.value.rowsPerPage) {
    return 1
  }
  const total = pagination.value.total ?? rows.value.length
  return Math.ceil(total / pagination.value.rowsPerPage)
})

const paginatedAndSortedRows = computed(() => {
    if (props.serverSide) {  
    return sortedRows.value
  }
  if(pagination.value){
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
    return sortedRows.value.slice(start, start + pagination.value.rowsPerPage)
  }
  else return sortedRows.value
})

function prevPage () {
  if (pagination.value && pagination.value.page > 1) {
    emit('update:pagination', { ...pagination.value, page: pagination.value.page - 1 })
  }
}

function nextPage () {
  if (pagination.value && pagination.value.page < pageCount.value) {
    emit('update:pagination', { ...pagination.value, page: pagination.value.page + 1 })
  }
}

function updateRowsPerPage(i: number) {
  if (pagination.value) {
      emit('update:pagination', { ...pagination.value, rowsPerPage: i })
  }
}

// selection
const selectedRows = ref<any[]>(modelValue.value ?? [])

function isSelected(row: any) {
  const key = getRowKey(row, 0)

  if (selection.value === 'single') {
    return (
      selectedRows.value.length > 0 &&
      getRowKey(selectedRows.value[0], 0) === key
    )
  }

  return selectedRows.value.some(
    r => getRowKey(r, 0) === key
  )
}
function toggleRowSelection(row: any) {
  if (selection.value === 'multiple') {
    const idx = selectedRows.value.indexOf(row)
    if (idx > -1) {
      selectedRows.value.splice(idx, 1)
    } else {
      selectedRows.value.push(row)
    }
    emit('update:modelValue', [...selectedRows.value])
  }
}

function selectSingleRow(row: any) {
  if (selection.value === 'single') {
    if (selectedRows.value.length > 0 && selectedRows.value[0] === row) {
      selectedRows.value = []
    } else {
      selectedRows.value = [row]
    }
    emit('update:modelValue', [...selectedRows.value])
  }
}

const allRowsSelected = computed(() => {
  if (selection.value !== 'multiple') return false
  if (paginatedAndSortedRows.value.length === 0) return false
  
  const selectedCount = paginatedAndSortedRows.value.filter(r => isSelected(r)).length
  
  if (selectedCount === 0) return false
  if (selectedCount === paginatedAndSortedRows.value.length) return true
  return null 
})

function toggleSelectAll() {
  if (selection.value !== 'multiple') return
  
  if (allRowsSelected.value || allRowsSelected.value == null) {
    // Deselect all
    paginatedAndSortedRows.value.forEach(r => {
      const i = selectedRows.value.indexOf(r)
      if (i > -1) selectedRows.value.splice(i, 1)
    })
  }
  else {
    // Select all
    paginatedAndSortedRows.value.forEach(r => {
      if (!isSelected(r)) selectedRows.value.push(r)
    })
  }
  emit('update:modelValue', [...selectedRows.value])
}

function getRowKey(row: any, idx: number) {
  return row[rowKey.value ?? 'id'] ?? idx
}

function onRowClick(row: any, index: number) {
  if (selection.value === 'single') {
    selectSingleRow(row)
  }
  if (selection.value === 'multiple') {
    toggleRowSelection(row)
  }
  emit('row-click', { row, index })
}

type Separator  = keyof typeof separator

const isCustomColor = computed(() => {
  return !predefinedColors.includes(props.color as PredefinedColor)
})

const handleTdClass = computed(() => {
  const spMode = separator[props.separator!]
  return [
    'px-4 text-wrap border-gray-200  whitespace-nowrap ',
    props.dense ? 'py-2' : 'py-4',
    spMode
  ].join(' ')
})

const handleThClass = computed(() => {
  const spMode = separator[props.separator!]

  return [
    'px-4 font-medium text-gray-700 uppercase tracking-wider select-none border-gray-200 whitespace-nowrap',
    props.dense ? 'py-2' : 'py-4',
    spMode,
    props.tableHeaderClass,
    props.separator === 'vertical' || props.separator === 'cell' ? 'border-y' : ''
  ].join(' ')
})

const handleGeneralClasses = computed(() => {
  const baseClasses = [
    'w-full relative ',
    props.flat ? 'shadow-none' : 'shadow-md',
    props.bordered ? 'border' : '',
    props.square ? '' : 'rounded',
    props.tableClass,
    props.error || props.empty ? 'overflow-hidden' : 'overflow-x-auto'
  ]

  if (!isCustomColor.value) {
    baseClasses.push(`bg-${props.color}`)
  }

  return baseClasses
})

const handleGeneralStyle = computed(() => {
  if (isCustomColor.value) {
    return { backgroundColor: props.color }
  }
  return undefined
})

// Watch for external modelValue changes
watch(modelValue, (newValue) => {
  if (newValue) {
    selectedRows.value = [...newValue]
  } else {
    selectedRows.value = []
  }
}, { deep: true })


watch([sortBy, sortOrder], ([newSortBy, newSortOrder]) => {
  if (isSortControlled.value) {
    internalSortBy.value = newSortBy || ''
    internalSortOrder.value = newSortOrder || 'asc'
  }
})


defineExpose({
  sort
})
</script>

<style scoped>
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.animate-loading-loading-bar {
  animation: loading-bar 1.5s ease-in-out infinite;
}

</style>
