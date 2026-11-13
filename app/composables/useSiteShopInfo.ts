import type { ShopInfo } from '~/types/site'

// اطلاعات تماس فروشگاه؛ با یک کلید بین فوتر و بخش‌های دیگر مشترک است
export const useSiteShopInfo = () => {
  const { data } = useApiFetch<{ status: string; data: ShopInfo }>(
    '/shop-info',
    { key: 'site-shop-info' },
  )

  return computed(() => data.value?.data ?? null)
}