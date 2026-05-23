'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="bg-[#1A1A1A] shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#E8B84B] py-1 px-4 text-xs text-center text-[#1A1A1A] font-medium">
        หจก.นพอะไหล่ยนต์ &nbsp;|&nbsp; โทร. 044-291-419 &nbsp;|&nbsp; 7/1 ม.1 ต.โคกกรวด อ.เมือง จ.นครราชสีมา 30280
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="NP อะไหล่ยนต์"
            width={56}
            height={56}
            className="rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </Link>

        {/* Brand name */}
        <Link href="/" className="flex-shrink-0 hidden sm:block">
          <div className="text-[#E8B84B] font-bold text-lg leading-tight">
            NP อะไหล่ยนต์
          </div>
          <div className="text-gray-400 text-xs">Since 1994 · นครราชสีมา</div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาอะไหล่ เช่น น้ำมันเครื่อง, CASTROL, VIGO..."
            className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#E8B84B] hover:bg-[#C9971A] text-[#1A1A1A] font-semibold rounded-lg text-sm transition-colors"
          >
            ค้นหา
          </button>
        </form>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm flex-shrink-0">
          <Link href="/products" className="text-gray-300 hover:text-[#E8B84B] transition-colors">
            สินค้าทั้งหมด
          </Link>
        </nav>
      </div>
    </header>
  )
}
