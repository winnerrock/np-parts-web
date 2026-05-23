import { Suspense } from 'react'
import ProductsClient from './ProductsClient'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">กำลังโหลด...</div>}>
      <ProductsClient />
    </Suspense>
  )
}
