// آدرس نسبی فایل‌های بکند (مثل /uploads/...) را به آدرس کامل برای مرورگر تبدیل می‌کند
export const useAssetUrl = () => {
  const config = useRuntimeConfig()

  return (path: string | null | undefined) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path

    return `${config.public.apiBaseUrl}${path}`
  }
}