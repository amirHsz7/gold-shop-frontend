// تعداد آیتم‌های سبد؛ تا ماژول سبد خرید ساخته نشده همیشه صفر است
export const useCartCount = () => useState<number>('cart-count', () => 0)