export type PublicCategory = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  productCount: number
  totalProductCount: number
  children: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
    productCount: number
  }[]
}


export type ShopInfo = {
  address: string | null
  latitude: number | null
  longitude: number | null
  phones: string[]
  email: string | null
  workingHours: string | null
  instagram: string | null
  telegram: string | null
  whatsapp: string | null
}