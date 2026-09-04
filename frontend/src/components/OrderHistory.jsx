// import React, { useEffect, useState, useCallback } from 'react'
// import api from '../api.js'

// const statusBadge = {
//   paid: 'bg-emerald-900 text-emerald-300 border-emerald-700',
//   created: 'bg-slate-800 text-slate-300 border-slate-700',
//   failed: 'bg-red-900 text-red-300 border-red-700',
//   cancelled: 'bg-red-900 text-red-300 border-red-700',
// }

// export default function OrderHistory({ userId, refreshKey }) {
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(false)

//   const load = useCallback(async () => {
//     if (!userId) return
//     setLoading(true)
//     try {
//       const res = await api.orders(userId)
//       setOrders(res)
//     } catch (e) {
//       // history is a nice-to-have — don't block the chat UI on a failed fetch
//     } finally {
//       setLoading(false)
//     }
//   }, [userId])

//   useEffect(() => {
//     load()
//   }, [load, refreshKey])

//   if (!userId) {
//     return (
//       <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
//         <h2 className="font-semibold text-sm mb-1">Your Order History</h2>
//         <p className="text-xs text-slate-500">Chat with the agent to start a session — your orders will appear here.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="font-semibold text-sm">Your Order History</h2>
//         <button onClick={load} className="text-xs text-slate-500 hover:text-slate-300">
//           Refresh
//         </button>
//       </div>

//       {loading && orders.length === 0 && <p className="text-xs text-slate-500">Loading…</p>}
//       {!loading && orders.length === 0 && (
//         <p className="text-xs text-slate-500">No past orders yet in this session.</p>
//       )}

//       <ul className="space-y-2">
//         {orders.map((o) => {
//           let items = []
//           try {
//             items = JSON.parse(o.items_json || '[]')
//           } catch {
//             items = []
//           }
//           return (
//             <li key={o.id} className="text-xs bg-slate-900 rounded-lg p-2">
//               <div className="flex justify-between items-center mb-1">
//                 <span className="text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
//                 <span className={`px-2 py-0.5 rounded-full border ${statusBadge[o.status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
//                   {o.status}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-300">
//                   {items.length > 0 ? items.map((it) => it.name || it.sku).join(', ') : 'Order'}
//                 </span>
//                 <span className="font-medium">₹{o.amount_inr}</span>
//               </div>
//             </li>
//           )
//         })}
//       </ul>
//     </div>
//   )
// }


import React, { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Clock, XCircle, RefreshCw, ShoppingBag } from 'lucide-react'
import api from '../api.js'

const STATUS_META = {
  paid: {
    label: 'Payment Completed',
    sub: 'Order done',
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  created: {
    label: 'Awaiting Payment',
    sub: 'Order placed — payment pending',
    icon: Clock,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
  },
  failed: {
    label: 'Payment Failed',
    sub: 'Order not completed',
    icon: XCircle,
    badge: 'bg-red-50 text-red-700 border-red-200',
    iconColor: 'text-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    sub: 'Order not completed',
    icon: XCircle,
    badge: 'bg-red-50 text-red-700 border-red-200',
    iconColor: 'text-red-500',
  },
}

function metaFor(status) {
  return STATUS_META[status] || {
    label: status,
    sub: '',
    icon: Clock,
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    iconColor: 'text-slate-400',
  }
}

export default function OrderHistory({ userId, refreshKey }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await api.orders(userId)
      setOrders(res)
    } catch (e) {
      // history is a nice-to-have — don't block the chat UI on a failed fetch
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  // Keep polling gently while any order is still awaiting payment, so a
  // buyer sitting on this tab sees the status flip without a manual refresh.
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === 'created')
    if (!hasPending) return
    const t = setInterval(load, 6000)
    return () => clearInterval(t)
  }, [orders, load])

  if (!userId) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="font-semibold text-slate-900 text-sm mb-1">Your Order History</h2>
        <p className="text-xs text-slate-400">Chat with the agent to start a session — your orders will appear here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-4.5 h-4.5 text-indigo-600" /> Your Order History
        </h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && orders.length === 0 && <p className="text-sm text-slate-400">Loading…</p>}
      {!loading && orders.length === 0 && (
        <p className="text-sm text-slate-400">No past orders yet.</p>
      )}

      <ul className="space-y-3">
        {orders.map((o) => {
          let items = []
          try {
            items = JSON.parse(o.items_json || '[]')
          } catch {
            items = []
          }
          const meta = metaFor(o.status)
          const Icon = meta.icon
          return (
            <li key={o.id} className="border border-slate-100 rounded-xl p-3.5 hover:border-slate-200 transition">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {items.length > 0 ? items.map((it) => it.name || it.sku).join(', ') : 'Order'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <span className="font-semibold text-slate-900 text-sm whitespace-nowrap">
                  ₹{Number(o.amount_inr).toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.badge}`}>
                <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                {meta.label}
                {meta.sub && <span className="opacity-70 font-normal">· {meta.sub}</span>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}