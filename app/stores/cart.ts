export type CartIssue = 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'QUANTITY_EXCEEDS_STOCK'

export type CartLine = {
  variantId: string
  productId: string
  name: string
  slug: string
  imageUrl: string | null
  imageAlt: string | null
  weight: number
  karat: number
  stock: number
  quantity: number
  effectiveQuantity: number
  unitPrice: number | null
  unitOriginalPrice: number | null
  lineTotal: number | null
  issue: CartIssue | null
}

export type CartSummary = {
  itemsTotal: number
  discountTotal: number
  subtotal: number
  shippingCost: number
  freeShipping: boolean
  totalWeight: number
  totalAmount: number
  freeShippingRemainingWeight: number | null
  freeShippingMinWeight: number | null
}

export type CartData = {
  items: CartLine[]
  summary: CartSummary | null
  pricesAvailable: boolean
  hasIssues: boolean
  priceVersion: number
  updatedAt: string
}

// تغییر قیمت یک کالا نسبت به آخرین دریافت
export type PriceChange = { variantId: string, name: string, from: number, to: number }

export const useCartStore = defineStore('cart', () => {
  const { $api } = useNuxtApp()
  const cartCount = useCartCount()

  const cart = ref<CartData | null>(null)
  const loading = ref(false)
  const busy = ref(false)
  const priceChanges = ref<PriceChange[]>([])

  const items = computed(() => cart.value?.items ?? [])
  const isEmpty = computed(() => items.value.length === 0)

  function apply(data: CartData, trackChanges = false) {
    if (trackChanges && cart.value) {
      const before = new Map(cart.value.items.map(item => [item.variantId, item.unitPrice]))

      const changes: PriceChange[] = []
      for (const item of data.items) {
        const old = before.get(item.variantId)
        if (old != null && item.unitPrice != null && old !== item.unitPrice) {
          changes.push({ variantId: item.variantId, name: item.name, from: old, to: item.unitPrice })
        }
      }
      priceChanges.value = changes
    }

    cart.value = data
    cartCount.value = data.items.reduce((sum, item) => sum + item.effectiveQuantity, 0)
  }

  function reset() {
    cart.value = null
    priceChanges.value = []
    cartCount.value = 0
  }

  // دریافت سبد؛ با trackChanges تغییر قیمت‌ها نسبت به قبل ثبت می‌شود
  async function fetchCart(trackChanges = false) {
    loading.value = true
    try {
      const res = await $api<{ data: CartData }>('/cart')
      apply(res.data, trackChanges)
    }
    finally {
      loading.value = false
    }
  }

  async function mutate(request: () => Promise<{ data: CartData }>) {
    busy.value = true
    try {
      const res = await request()
      apply(res.data)
    }
    finally {
      busy.value = false
    }
  }

  const addItem = (variantId: string, quantity = 1) =>
    mutate(() => $api('/cart/items', { method: 'POST', body: { variantId, quantity } }))

  const setQuantity = (variantId: string, quantity: number) =>
    mutate(() => $api(`/cart/items/${variantId}`, { method: 'PATCH', body: { quantity } }))

  const removeItem = (variantId: string) =>
    mutate(() => $api(`/cart/items/${variantId}`, { method: 'DELETE' }))

  const clearPriceChanges = () => {
    priceChanges.value = []
  }

  return {
    cart,
    items,
    isEmpty,
    loading,
    busy,
    priceChanges,
    fetchCart,
    addItem,
    setQuantity,
    removeItem,
    clearPriceChanges,
    reset,
  }
})