import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import api from '../../api.js'

const emptyForm = { sku: '', name: '', category: '', price_inr: '', stock: '', cross_sell_sku: '' }

export default function ProductFormModal({ isOpen, onClose, onSaved, product }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(product)

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price_inr: product.price_inr,
        stock: product.stock,
        cross_sell_sku: product.cross_sell_sku || '',
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [product, isOpen])

  if (!isOpen) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.category.trim() || form.price_inr === '' || form.stock === '') {
      setError('Please fill in name, category, price, and stock.')
      return
    }
    if (!isEdit && !form.sku.trim()) {
      setError('Please provide a SKU.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim().toLowerCase(),
        price_inr: parseFloat(form.price_inr),
        stock: parseInt(form.stock, 10),
        cross_sell_sku: form.cross_sell_sku.trim() || null,
      }
      if (isEdit) {
        await api.merchantUpdateProduct(product.sku, payload)
      } else {
        await api.merchantCreateProduct({ sku: form.sku.trim(), ...payload })
      }
      onSaved()
    } catch (e2) {
      setError(e2.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-slate-900 mb-5">{isEdit ? 'Edit Product' : 'Add Product'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="e.g. HOOD-BLU-M"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Product name"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <input
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                placeholder="apparel"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price_inr}
                onChange={(e) => update('price_inr', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cross-sell SKU</label>
              <input
                value={form.cross_sell_sku}
                onChange={(e) => update('cross_sell_sku', e.target.value)}
                placeholder="optional"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </form>
      </div>
    </div>
  )
}
