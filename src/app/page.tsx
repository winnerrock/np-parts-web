import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = [
  { label: 'น้ำมันเครื่อง',   href: '/products?category=น้ำมันเครื่อง',   icon: '🛢️' },
  { label: 'น้ำมันเกียร์',    href: '/products?category=น้ำมันเกียร์',    icon: '🔄' },
  { label: 'ระบบเบรค',        href: '/products?category=ระบบเบรค',        icon: '🔴' },
  { label: 'สายพาน',          href: '/products?category=สายพาน',          icon: '⚙️' },
  { label: 'หัวเทียน',        href: '/products?q=หัวเทียน',               icon: '⚡' },
  { label: 'น้ำยาหม้อน้ำ',    href: '/products?q=น้ำยาหม้อน้ำ',          icon: '💧' },
]

const BRANDS = ['CASTROL', 'SHELL', 'MOBIL', 'TOYOTA', 'HONDA', 'NGK', 'DENSO', 'BOSCH']

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-block bg-[#E8B84B] text-[#1A1A1A] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Since 1994
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              อะไหล่รถยนต์<br />
              <span className="text-[#E8B84B]">ครบวงจร</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              คลังสินค้ากว่า 147,000 รายการ ทุกยี่ห้อ ทุกรุ่น
              ราคายุติธรรม ส่งทั่วประเทศ
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/products"
                className="px-6 py-3 bg-[#E8B84B] hover:bg-[#C9971A] text-[#1A1A1A] font-bold rounded-lg transition-colors"
              >
                ดูสินค้าทั้งหมด
              </Link>
              <Link
                href="/products?category=น้ำมันเครื่อง"
                className="px-6 py-3 border border-[#E8B84B] text-[#E8B84B] hover:bg-[#E8B84B] hover:text-[#1A1A1A] font-semibold rounded-lg transition-colors"
              >
                น้ำมันเครื่อง
              </Link>
              <Link
                href="/products?category=น้ำมันเกียร์"
                className="px-6 py-3 border border-gray-500 text-gray-300 hover:bg-white hover:text-[#1A1A1A] font-semibold rounded-lg transition-colors"
              >
                น้ำมันเกียร์
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 relative">
              <Image
                src="/images/NP-logo-ตาล.png"
                alt="NP อะไหล่ยนต์"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category quick links */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">หมวดหมู่สินค้า</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#E8B84B] hover:shadow-md transition-all text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlight: น้ำมันเครื่อง */}
      <section className="bg-[#FDF3DC] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">🛢️ น้ำมันเครื่อง</h2>
              <p className="text-sm text-gray-500 mt-1">ครบทุกยี่ห้อ ทุกขนาด</p>
            </div>
            <Link
              href="/products?q=น้ำมันเครื่อง"
              className="text-sm text-[#C9971A] font-semibold hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {/* Brand pills */}
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <Link
                key={b}
                href={`/products?q=น้ำมันเครื่อง&brand=${b}`}
                className="px-4 py-2 bg-white border border-gray-200 hover:border-[#E8B84B] hover:bg-[#E8B84B] hover:text-[#1A1A1A] rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TikTok Videos */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">🎬 คลิปวิดีโอจาก TikTok</h2>
          <p className="text-sm text-gray-500 mt-1">ติดตามเราได้ที่ @npautoservice</p>
        </div>
        <div className="flex flex-wrap gap-6 justify-start">
          <iframe
            src="https://www.tiktok.com/embed/v2/7644188280656825621"
            className="rounded-xl border border-gray-100 shadow-sm"
            style={{ width: 325, height: 735 }}
            allowFullScreen
            allow="encrypted-media"
          />
          <iframe
            src="https://www.tiktok.com/embed/v2/7516842895660305671"
            className="rounded-xl border border-gray-100 shadow-sm"
            style={{ width: 325, height: 735 }}
            allowFullScreen
            allow="encrypted-media"
          />
          <iframe
            src="https://www.tiktok.com/embed/v2/7488993595882605832"
            className="rounded-xl border border-gray-100 shadow-sm"
            style={{ width: 325, height: 735 }}
            allowFullScreen
            allow="encrypted-media"
          />
          <iframe
            src="https://www.tiktok.com/embed/v2/7581806169463852309"
            className="rounded-xl border border-gray-100 shadow-sm"
            style={{ width: 325, height: 735 }}
            allowFullScreen
            allow="encrypted-media"
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '📦', title: 'สต็อกสินค้าจริง', desc: 'คลังสินค้ากว่า 147,000 รายการ พร้อมจัดส่งทันที' },
            { icon: '✅', title: 'ของแท้ มั่นใจได้', desc: 'อะไหล่แท้ห้าง OEM และ aftermarket คุณภาพดี' },
            { icon: '🚚', title: 'ส่งทั่วประเทศ', desc: 'ส่งสินค้าทุกวัน ผ่านขนส่งชั้นนำ รวดเร็ว มั่นใจ' },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="text-3xl flex-shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
