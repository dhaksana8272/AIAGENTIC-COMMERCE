import React, { useCallback, useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api.js'

const PAGE_SIZE = 10

export default function CustomersPage() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.merchantCustomers({ search, page, page_size: PAGE_SIZE })
      setRows(res.customers)
      setTotal(res.total)
      setTotalPages(res.total_pages)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Buyers who've placed at least one order through your store's agent.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="relative mb-4 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {loading && <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Orders</th>
                    <th className="pb-3 font-medium">Total Spent</th>
                    <th className="pb-3 font-medium">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">No customers yet.</td></tr>
                  )}
                  {rows.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                            {c.name?.[0]?.toUpperCase() || '?'}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{c.orders}</td>
                      <td className="py-3 pr-3 font-medium text-slate-900">₹{c.total_spent_inr.toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-3 text-slate-500">{c.last_order ? new Date(c.last_order).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              <span>{total} customer(s)</span>
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
