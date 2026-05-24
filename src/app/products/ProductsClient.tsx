'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'

interface ApiResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  brands: string[]
}

export default function ProductsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q        = searchParams.get('q') || ''
  const brand    = searchParams.get('brand') || ''
  const category = searchParams.get('category') || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)

  const [data, setData]       = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState(q)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q)        params.set('q', q)
    if (brand)    params.set('brand', brand)
    if (category) params.set('category', category)
    params.set('page', String(page))

    try {
      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [q, brand, category, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setSearch(q) }, [q])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (search.trim()) p.set('q', search.trim())
    router.push(`/products?${p}`)
  }

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.push(`/products?${p}`)
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {q ? `ค้นหา: "${q}"` : category || 'สินค้าทั้งหมด'}
        </h1>
        {data && (
          <p className="text-sm text-gray-500 mt-1">
            พบ {data.total.toLocaleString()} รายการ
          </p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'น้ำมันเครื่อง', 'น้ำมันเกียร์'].map((cat) => (
          <button
            key={cat}
            onClick={() => setParam('category', cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              category === cat
                ? 'bg-[#E8B84B] border-[#E8B84B] text-[#1A1A1A]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#E8B84B]'
            }`}
          >
            {cat || 'ทั้งหมด'}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filter */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
            <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3">กรองตามยี่ห้อ</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setParam('brand', '')}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm ${!brand ? 'bg-[#E8B84B] text-[#1A1A1A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  ทั้งหมด
                </button>
              </li>
              {data?.brands.map((b) => (
                <li key={b}>
                  <button
                    onClick={() => setParam('brand', b)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm truncate ${brand === b ? 'bg-[#E8B84B] text-[#1A1A1A] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {b}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาในหมวดนี้..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B] bg-white"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#E8B84B] hover:bg-[#C9971A] text-[#1A1A1A] font-semibold rounded-lg text-sm transition-colors"
            >
              ค้นหา
            </button>
          </form>

          {/* Mobile brand filter */}
          {data?.brands && data.brands.length > 0 && (
            <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setParam('brand', '')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${!brand ? 'bg-[#E8B84B] text-[#1A1A1A]' : 'bg-white border border-gray-200 text-gray-600'}`}
              >
                ทั้งหมด
              </button>
              {data.brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setParam('brand', b)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${brand === b ? 'bg-[#E8B84B] text-[#1A1A1A]' : 'bg-white border border-gray-200 text-gray-600'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-lg font-medium">ไม่พบสินค้าที่ค้นหา</p>
              <p className="text-sm mt-1">ลองใช้คำค้นหาอื่น</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.products.map((p) => (
                  <ProductCard key={p.bcode} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setParam('page', String(page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-[#E8B84B] transition-colors"
                  >
                    ← ก่อนหน้า
                  </button>
                  <span className="text-sm text-gray-500">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setParam('page', String(page + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-[#E8B84B] transition-colors"
                  >
                    ถัดไป →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
