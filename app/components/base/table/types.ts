export interface Column {
  name: string
  label: string
  field: string | ((row: any) => any)
  sortable?: boolean
  align?: 'center' | 'start' | 'end'
  format?: (value: any) => string | number;
}



// base props types
export const separator = {
  horizontal:   'border-b',
  vertical:    'border-r',
  cell:  'border-b border-r',
  none: 'border-none',
} as const


export type SeparatorKey = keyof typeof separator; 