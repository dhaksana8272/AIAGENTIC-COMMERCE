import React from 'react'
import ProductsTable from './ProductsTable.jsx'

export default function ProductsPage({ initialSearch = '' }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="text-sm text-slate-500">Manage your catalog — this feeds directly into the AI shopping agent.</p>
      </div>
      <ProductsTable pageSize={8} initialSearch={initialSearch} />
    </div>
  )
}
