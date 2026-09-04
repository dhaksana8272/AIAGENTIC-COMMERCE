import React, { useState } from 'react'
import { Heart, Star, Plus } from 'lucide-react'

const CATEGORY_GRADIENT = {
  apparel: 'from-indigo-200 to-blue-100',
  accessories: 'from-amber-100 to-orange-100',
}
const DEFAULT_GRADIENT = 'from-slate-100 to-slate-200'

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="text-xs font-medium bg-red-50 text-red-600 rounded-full px-2.5 py-1">Out of Stock</span>
  if (stock <= 10) return <span className="text-xs font-medium bg-amber-50 text-amber-600 rounded-full px-2.5 py-1">Low Stock</span>
  return <span className="text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-1">In Stock</span>
}

export default function ProductCard({ product, onAddToCart, onAsk }) {
  const [wished, setWished] = useState(false)
  const gradient = CATEGORY_GRADIENT[product.category] || DEFAULT_GRADIENT
  const fullStars = Math.round(product.rating)

  return (
    <div className="w-56 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden group">
      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
        <button
          onClick={() => setWished((w) => !w)}
          aria-label="Save for later"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-full pl-2 pr-3 py-1.5 opacity-0 group-hover:opacity-100 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="p-3.5">
        <p className="font-medium text-sm text-slate-900 truncate">{product.name}</p>
        <p className="text-base font-bold text-slate-900 mt-1">₹{product.price_inr.toLocaleString('en-IN')}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
          ))}
          <span className="text-xs text-slate-400 ml-0.5">{product.rating} ({product.review_count})</span>
        </div>
        <div className="mt-2">
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </div>
  )
}
