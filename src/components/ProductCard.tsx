import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const inStock = product.qtyoh2 > 0

  return (
    <Link href={`/products/${product.bcode}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8B84B] transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.descr}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">ยังไม่มีรูป</span>
            </div>
          )}

          {/* Stock badge */}
          <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {inStock ? `มีสินค้า` : 'สั่งได้'}
          </span>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-1">
          {product.brand && (
            <span className="text-xs text-[#C9971A] font-semibold uppercase tracking-wide">{product.brand}</span>
          )}
          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
            {product.descr}
          </p>
          {product.model && (
            <p className="text-xs text-gray-400 truncate">{product.model}</p>
          )}
          <div className="mt-2 flex items-end justify-between">
            <span className="text-lg font-bold text-[#1A1A1A]">
              ฿{product.price2.toLocaleString()}
            </span>
            {product.pcode && (
              <span className="text-xs text-gray-400 truncate ml-2">{product.pcode}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
