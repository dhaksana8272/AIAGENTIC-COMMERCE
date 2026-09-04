import React, { useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'

export default function ProductCarousel({ products, onAddToCart, onAsk }) {
  const scrollRef = useRef(null)

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
  }

  if (!products || products.length === 0) return null

  return (
    <div className="relative mt-2">
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none]">
        {products.map((p) => (
          <ProductCard key={p.sku} product={p} onAddToCart={onAddToCart} onAsk={onAsk} />
        ))}
      </div>
      {products.length > 2 && (
        <button
          onClick={scrollNext}
          aria-label="See more products"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-indigo-600 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
