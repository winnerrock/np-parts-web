'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  urls: string[]
  alt: string
}

export default function ImageGallery({ urls, alt }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
        <Image
          key={urls[active]}
          src={urls[active]}
          alt={alt}
          fill
          className="object-contain p-4"
          sizes="320px"
          priority
        />
      </div>

      {/* Thumbnails */}
      {urls.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {urls.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                active === i ? 'border-[#E8B84B]' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <Image src={url} alt={`${alt} ${i + 1}`} fill className="object-contain p-1" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
