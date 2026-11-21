import iranCities from 'iran-cities-json'

type GeoItem = { id: number, name: string, ostan?: number }

const { ostan, shahr } = iranCities as { ostan: GeoItem[], shahr: GeoItem[] }

const collator = new Intl.Collator('fa')

// حروف عربی را فارسی می‌کند و بعد از «و» اگر فاصله نیست، فاصله می‌گذارد
const clean = (value: string) =>
  value
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ (?=و\S)/g, ' ')
    .replace(/ و(?=\S)/g, ' و ')
    .replace(/\s+/g, ' ')
    .trim()

const provinces = ostan
  .map(province => ({ id: province.id, name: clean(province.name) }))
  .sort((a, b) => collator.compare(a.name, b.name))

const citiesByProvinceId = new Map<number, string[]>()

for (const city of shahr) {
  if (city.ostan == null) continue

  const list = citiesByProvinceId.get(city.ostan) ?? []
  list.push(clean(city.name))
  citiesByProvinceId.set(city.ostan, list)
}

for (const [id, list] of citiesByProvinceId) {
  citiesByProvinceId.set(id, [...new Set(list)].sort(collator.compare))
}

export const IRAN_PROVINCES = provinces.map(province => province.name)

export const citiesOf = (provinceName: string): string[] => {
  const province = provinces.find(item => item.name === provinceName)

  return province ? (citiesByProvinceId.get(province.id) ?? []) : []
}