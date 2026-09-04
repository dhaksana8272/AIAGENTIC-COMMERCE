import React, { useCallback, useEffect, useState } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api.js'
import ProductFormModal from './ProductFormModal.jsx'

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-600',
  low_stock: 'bg-amber-50 text-amber-600',
  inactive: 'bg-slate-100 text-slate-500',
}
const STATUS_LABEL = { active: 'Active', low_stock: 'Low Stock', inactive: 'Inactive' }
const STATUS_DOT = { active: 'bg-emerald-500', low_stock: 'bg-amber-500', inactive: 'bg-slate-400' }

const TABS = [
  { id: '', label: 'All Products' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'low_stock', label: 'Low Stock' },
]

export default function ProductsTable({ pageSize = 5, initialSearch = '', showAddButton = true }) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.merchantProducts({ search, status: status || undefined, page, page_size: pageSize })
      setRows(res.products)
      setTotal(res.total)
      setTotalPages(res.total_pages)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, page, pageSize])

  useEffect(() => { load() }, [load])
  useEffect(() => { setSearch(initialSearch) }, [initialSearch])
  useEffect(() => { setPage(1) }, [search, status])

  async function handleDelete(sku) {
    if (!window.confirm(`Delete product ${sku}? This can't be undone.`)) return
    try {
      await api.merchantDeleteProduct(sku)
      load()
    } catch (e) {
      alert(`Couldn't delete: ${e.message}`)
    }
  }

  function openAdd() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold text-lg text-slate-900">Products</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-48"
            />
          </div>
          {showAddButton && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-slate-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              status === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Stock</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Sales</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-400">No products match.</td></tr>
            )}
            {!loading && rows.map((p) => (
              <tr key={p.sku} className="border-t border-slate-100">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-1">{p.category}</span>
                </td>
                <td className="py-3 pr-3 text-slate-700">₹{p.price_inr.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3">
                  <span className={p.status === 'low_stock' ? 'text-amber-600 font-medium' : 'text-slate-700'}>{p.stock}</span>
                </td>
                <td className="py-3 pr-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_BADGE[p.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status]}`} />
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="py-3 pr-3 text-slate-700">{p.sales}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-indigo-600 transition" aria-label={`Edit ${p.name}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.sku)} className="text-slate-400 hover:text-red-600 transition" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
        <span>
          Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {(page - 1) * pageSize + rows.length} of {total} products
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition ${
                n === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); load() }}
        product={editingProduct}
      />
    </div>
  )
}
