import type { PublicCategory } from '~/types/site'

// دسته‌بندی‌های عمومی؛ با یک کلید، بین هدر، منو و فوتر مشترک است
export const useSiteCategories = () => {
  const { data } = useApiFetch<{ status: string; data: PublicCategory[] }>(
    '/categories',
    { key: 'site-categories' },
  )

  return computed(() => data.value?.data ?? [])
}