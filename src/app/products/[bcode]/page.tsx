import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import pool from '@/lib/db'
import { Product } from '@/lib/types'

interface Props {
  params: Promise<{ bcode: string }>
}

async function getProduct(bcode: string): Promise<Product | null> {
  try {
    const res = await pool.query('SELECT * FROM products WHERE bcode = $1', [bcode])
    return res.rows[0] ?? null
  } catch {
    return null
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { bcode } = await params
  const product = await getProduct(bcode)

  if (!product) notFound()

  const inStock = product.qtyoh2 > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[#C9971A]">หน้าแรก</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#C9971A]">สินค้า</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{product.descr}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 flex-shrink-0 bg-gray-50 flex items-center justify-center p-8 min-h-64">
            {product.image_url ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={product.image_url}
                  alt={product.descr}
                  fill
                  className="object-contain"
                  sizes="320px"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">ยังไม่มีรูปสินค้า</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8">
            {product.brand && (
              <span className="inline-block text-xs text-[#C9971A] font-bold uppercase tracking-wider bg-[#FDF3DC] px-2 py-1 rounded mb-3">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">{product.descr}</h1>

            {product.model && (
              <p className="text-gray-500 text-sm mb-4">รุ่นรถ: {product.model}</p>
            )}

            {/* Price */}
            <div className="bg-[#FDF3DC] rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">ราคาขายหน้าร้าน</p>
              <p className="text-3xl font-bold text-[#1A1A1A]">
                ฿{product.price2.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ราคาส่ง: <span className="font-medium">กรุณาติดต่อหน้าร้าน</span>
              </p>
            </div>

            {/* Details table */}
            <table className="w-full text-sm mb-6">
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: 'รหัสสินค้า',    value: product.bcode },
                  { label: 'เบอร์แท้ / OEM', value: product.pcode || '-' },
                  { label: 'ยี่ห้อ',          value: product.brand || '-' },
                  { label: 'ซัพพลายเออร์',   value: product.vendor || '-' },
                  { label: 'ที่เก็บ',         value: product.location1 || '-' },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-2 text-gray-400 w-36">{row.label}</td>
                    <td className="py-2 font-medium text-[#1A1A1A]">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${
              inStock ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-gray-400'}`} />
              {inStock ? `มีสินค้าในสต็อก` : 'สั่งพิเศษได้'}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <a
                href="tel:044291419"
                className="flex-1 py-3 bg-[#E8B84B] hover:bg-[#C9971A] text-[#1A1A1A] font-bold rounded-lg text-center transition-colors"
              >
                📞 โทรสั่งซื้อ 044-291-419
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/products"
          className="text-sm text-[#C9971A] hover:underline"
        >
          ← กลับหน้ารายการสินค้า
        </Link>
      </div>
    </div>
  )
}
