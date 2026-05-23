import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'NP อะไหล่ยนต์ | จำหน่ายอะไหล่รถยนต์ นครราชสีมา',
  description: 'จำหน่ายอะไหล่รถยนต์ทุกยี่ห้อ ทุกรุ่น ราคายุติธรรม Since 1994 นครราชสีมา',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
