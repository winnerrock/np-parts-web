export interface Product {
  bcode: string
  pcode: string
  descr: string
  model: string
  brand: string
  vendor: string
  price1: number
  price5: number
  costlast: number
  qtyoh2: number
  location1: string
  image_url: string | null
  category: string
}

export interface SearchParams {
  q?: string
  brand?: string
  page?: string
}
