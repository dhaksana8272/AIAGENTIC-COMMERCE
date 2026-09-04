import React, { useCallback, useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import api from '../../api.js'

const RANGES = [7, 30, 90]

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    Promise.all([api.merchantSalesOverview(days), api.merchantTopCategories(days)])
      .then(([so, tc]) => { setSales(so.points); setCategories(tc.categories) })
      .catch((e) => setError(e.message))
  }, [days])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Revenue trend and category performance for your store.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${days === r ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Revenue Trend</h2>
        {sales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-slate-400 py-16 text-center">No data in this range.</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Revenue by Category</h2>
        {categories.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-slate-400 py-16 text-center">No category sales yet.</p>}
      </div>
    </div>
  )
}
