
// وضعیت باز/بسته بودن سایدبار در موبایل (مشترک بین هدر و سایدبار، SSR-safe)
export const useAdminSidebar = () => {
  const isOpen = useState<boolean>('admin-sidebar-open', () => false)
 
  const open = () => (isOpen.value = true)
  const close = () => (isOpen.value = false)
  const toggle = () => (isOpen.value = !isOpen.value)
 
  return { isOpen, open, close, toggle }
}