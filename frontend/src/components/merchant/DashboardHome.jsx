import React, { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Wallet, ShoppingBag, Users, TrendingUp, ShoppingCart, Sparkles,
  Lightbulb, AlertTriangle, ArrowUpRight, ChevronDown,
} from 'lucide-react'
import api from '../../api.js'
import StatCard from './StatCard.jsx'
import ProductsTable from './ProductsTable.jsx'

const RANGE_OPTIONS = [
  { days: 7, label: 'Last 7 Days' },
  { days: 30, label: 'This Month' },
  { days: 90, label: 'Last 90 Days' },
]

const CATEGORY_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']

const INSIGHT_ICON = { trend: TrendingUp, opportunity: Lightbulb, performance: Sparkles, alert: AlertTriangle }

function RangeDropdown({ days, setDays }) {
  const [open, setOpen] = useState(false)
  const current = RANGE_OPTIONS.find((o) => o.days === days) || RANGE_OPTIONS[1]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
      >
        {current.label} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.days}
              onClick={() => { setDays(o.days); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 ${o.days === days ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardHome({ merchantName, onNavigate }) {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])
  const [insights, setInsights] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [s, so, tc, ins] = await Promise.all([
        api.merchantStats(days),
        api.merchantSalesOverview(days),
        api.merchantTopCategories(days),
        api.merchantInsights(days),
      ])
      setStats(s)
      setSales(so.points)
      setCategories(tc.categories)
      setInsights(ins.insights)
    } catch (e) {
      setError(e.message)
    }
  }, [days])

  useEffect(() => { load() }, [load])

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {merchantName || 'Merchant'} 👋</h1>
          <p className="text-sm text-slate-500">Here's what's happening with your store today.</p>
        </div>
        <RangeDropdown days={days} setDays={setDays} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Wallet} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Total Revenue" value={inr(stats.revenue.value)} changePct={stats.revenue.change_pct} />
          <StatCard icon={ShoppingBag} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Orders Completed" value={stats.orders_completed.value.toLocaleString('en-IN')} changePct={stats.orders_completed.change_pct} />
          <StatCard icon={Users} iconBg="bg-amber-50" iconColor="text-amber-600" label="Active Customers" value={stats.active_customers.value.toLocaleString('en-IN')} changePct={stats.active_customers.change_pct} />
          <StatCard icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" label="Conversion Rate" value={`${stats.conversion_rate.value}%`} changePct={stats.conversion_rate.change_pct} />
          <StatCard icon={ShoppingCart} iconBg="bg-purple-50" iconColor="text-purple-600" label="AOV (Avg. Order Value)" value={inr(stats.aov.value)} changePct={stats.aov.change_pct} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Sales Overview</h2>
          </div>
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(d) => d.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelFormatter={(l) => l} />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-16 text-center">No sales in this period yet.</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Top Selling Categories</h2>
          </div>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} dataKey="pct" nameKey="category" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {categories.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 mt-2">
                {categories.map((c, i) => (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {c.category[0].toUpperCase() + c.category.slice(1)}
                    </span>
                    <span className="font-medium text-slate-900">{c.pct}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-400 py-16 text-center">No category sales yet.</p>
          )}
        </div>
      </div>

      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">AI Insights</h2>
        {insights.length === 0 ? (
          <p className="text-sm text-slate-500">Not enough activity yet to generate insights.</p>
        ) : (
          <ul className="space-y-3">
            {insights.map((ins, i) => {
              const Icon = INSIGHT_ICON[ins.type] || Sparkles
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Icon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  {ins.text}
                </li>
              )
            })}
          </ul>
        )}
        <button
          onClick={() => onNavigate('agent')}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-4"
        >
          View AI Agent details <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <ProductsTable pageSize={5} />
    </div>
  )
}
