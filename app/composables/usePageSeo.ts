type MaybeText = MaybeRefOrGetter<string | null | undefined>

type PageSeoOptions = {
  title: MaybeText
  description?: MaybeText
  // آدرس عکس؛ نسبی یا کامل
  image?: MaybeText
  type?: 'website' | 'article'
  // صفحه‌هایی که نباید در گوگل بیایند (ورود، پنل، ...)
  noindex?: boolean
}

const MAX_DESCRIPTION = 160

const cleanText = (value: string | null | undefined) =>
  (value ?? '').replace(/\s+/g, ' ').trim()

// توضیح متا را حداکثر ۱۶۰ کاراکتر و سر کلمه می‌برد
const shorten = (text: string, max: number) => {
  if (text.length <= max) return text

  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export const usePageSeo = (options: PageSeoOptions) => {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteUrl = String(config.public.siteUrl || '').replace(/\/+$/, '')

  const toAbsolute = (url: string) =>
    /^https?:\/\//.test(url) ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`

  const title = computed(() => cleanText(toValue(options.title)) || undefined)

  const description = computed(
    () => shorten(cleanText(toValue(options.description)), MAX_DESCRIPTION) || undefined,
  )

  const image = computed(() => {
    const value = toValue(options.image)

    return value ? toAbsolute(value) : undefined
  })

  // آدرس یکتا بدون کوئری؛ تا وقتی دامنه تنظیم نشده canonical گذاشته نمی‌شود
  const canonical = computed(() => {
    if (!siteUrl) return undefined

    const path = route.path.length > 1 ? route.path.replace(/\/+$/, '') : ''

    return `${siteUrl}${path || '/'}`
  })

  useSeoMeta({
    title,
    description,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow',
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonical,
    ogType: options.type ?? 'website',
    ogSiteName: SITE_NAME,
    ogLocale: 'fa_IR',
    twitterCard: () => (image.value ? 'summary_large_image' : 'summary'),
  })

  useHead({
    link: computed(() =>
      canonical.value && !options.noindex
        ? [{ rel: 'canonical', href: canonical.value }]
        : [],
    ),
  })
}