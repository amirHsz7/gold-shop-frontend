// مبلغ را با ارقام فارسی و جداکننده‌ی هزارگان نشان می‌دهد (مثل ۲۸,۵۰۰,۰۰۰)
export const formatToman = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value).replace(/٬/g, ',')

// وزن را با حداکثر ۳ رقم اعشار نشان می‌دهد (مثل ۲٫۵۶)
export const formatWeight = (value: number) =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 3 }).format(value)