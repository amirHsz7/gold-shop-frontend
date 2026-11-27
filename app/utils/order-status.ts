export const orderStatusLabels = {
  PENDING_PAYMENT: 'در انتظار پرداخت',
  PREPARING: 'در حال آماده‌سازی',
  SHIPPED: 'ارسال‌شده',
  CANCELLED: 'لغوشده',
  EXPIRED: 'منقضی‌شده',
  NEEDS_REVIEW: 'نیازمند بررسی',
} as const

export type AdminOrderStatus = keyof typeof orderStatusLabels