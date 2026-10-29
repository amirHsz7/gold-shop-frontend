
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const EN_DIGITS = '0123456789'

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return ''

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function toFaNumber(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return ''

  return String(value).replace(/\d/g, (digit) => {
    return FA_DIGITS[Number(digit)] ?? digit
  })
}

export function toEnNumber(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return ''

  return String(value).replace(/[۰-۹]/g, (digit) => {
    return EN_DIGITS[FA_DIGITS.indexOf(digit)] ?? digit
  })
}
