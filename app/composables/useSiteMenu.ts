// وضعیت منوی کشویی موبایل (بین هدر و نوار پایین مشترک است)
export const useSiteMenu = () => {
  const isOpen = useState('site-menu-open', () => false)
  const categoriesOpen = useState('site-menu-categories', () => false)

  const open = (options?: { categories?: boolean }) => {
    categoriesOpen.value = options?.categories ?? false
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { isOpen, categoriesOpen, open, close }
}