// کلاس مشترک لینک‌های منوی دسکتاپ (ارتفاع کامل هدر، تا خط زیرین به لبه‌ی پایین برسد)
export const NAV_LINK_CLASS
  = 'relative flex h-full items-center gap-1 text-[15px] text-dark-brown transition-colors hover:text-burgundy'

// لینک فعال: رنگ بنفش و خط زیرین
export const NAV_ACTIVE_CLASS
  = 'text-burgundy! font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-burgundy'

// حاشیه‌ی کناری مشترک همه‌ی بخش‌های سایت (هدر، فوتر، صفحه‌ی اصلی)؛ صفحه تمام‌عرض است
export const SITE_GUTTER = 'px-4 lg:px-6 xl:px-12'

export const SITE_NAME = 'فروشگاه طلای گلدن'
export const SITE_TAGLINE = 'زیبایی، سرمایه ماندگار شما'

// صفحه‌هایی که هنوز ساخته نشده‌اند تا ساخته شدن ۴۰۴ می‌دهند
export const FOOTER_LINKS = [
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
  { label: 'قوانین و مقررات', to: '/terms' },
  { label: 'سوالات متداول', to: '/faq' },
] as const

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

// ارقام فارسی و عربی را به لاتین تبدیل می‌کند
export const toLatinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, digit => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String(ARABIC_DIGITS.indexOf(digit)))

// شماره‌ی تلفن برای لینک tel:
export const toTelHref = (phone: string) =>
  `tel:${toLatinDigits(phone).replace(/[^\d+]/g, '')}`

// نام کاربری یا لینکی که ادمین وارد کرده را به لینک کامل تبدیل می‌کند
export const buildSocialUrl = (
  kind: 'instagram' | 'telegram' | 'whatsapp',
  raw: string | null,
) => {
  const value = raw?.trim()

  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value

  // مثلاً t.me/goldshop بدون https
  if (/^[\w-]+(\.[\w-]+)+\//.test(value)) return `https://${value}`

  if (kind === 'whatsapp') {
    const digits = toLatinDigits(value).replace(/\D/g, '')

    if (!digits) return null

    // شماره‌ی موبایل ایران را به قالب بین‌المللی تبدیل می‌کند
    const international = digits.startsWith('0') ? `98${digits.slice(1)}` : digits

    return `https://wa.me/${international}`
  }

  const handle = value.replace(/^@/, '').replace(/^\/+/, '')

  return kind === 'instagram'
    ? `https://instagram.com/${handle}`
    : `https://t.me/${handle}`
}