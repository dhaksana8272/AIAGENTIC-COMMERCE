import React, { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api.js'

const STATUS_BADGE = {
  created: 'bg-blue-50 text-blue-600',
  paid: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
  cancelled: 'bg-slate-100 text-slate-500',
}

const PAGE_SIZE = 8

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.orders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let rows = orders
    if (status) rows = rows.filter((o) => o.status === status)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter((o) => o.id.toLowerCase().includes(s) || (o.razorpay_payment_link_id || '').toLowerCase().includes(s))
    }
    return rows
  }, [orders, search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, status])

  const statuses = useMemo(() => Array.from(new Set(orders.map((o) => o.status))), [orders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">Every order created through the buyer AI agent's checkout flow.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or payment ID…"
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-64"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setStatus('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400 py-8 text-center">Loading orders…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">No orders match.</td></tr>
                  )}
                  {pageRows.map((o) => {
                    let items = []
                    try { items = JSON.parse(o.items_json || '[]') } catch { /* ignore */ }
                    return (
                      <tr key={o.id} className="border-t border-slate-100">
                        <td className="py-3 pr-3 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}…</td>
                        <td className="py-3 pr-3 font-medium text-slate-900">₹{o.amount_inr.toLocaleString('en-IN')}</td>
                        <td className="py-3 pr-3 text-slate-600">{items.map((it) => it.name).join(', ') || '—'}</td>
                        <td className="py-3 pr-3">
                          <span className={`text-xs font-medium capitalize rounded-full px-2.5 py-1 ${STATUS_BADGE[o.status] || 'bg-slate-100 text-slate-500'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              <span>{filtered.length} order(s)</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
