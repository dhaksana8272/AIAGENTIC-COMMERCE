// import React, { useEffect, useState } from 'react'
// import {
//   LayoutDashboard, Package, ShoppingBag, Users, Sparkles, BarChart3,
//   Megaphone, Tag, ClipboardList, Store, CreditCard, Truck, Puzzle,
//   UserCog, Receipt, Settings as SettingsIcon, Bot,
// } from 'lucide-react'
// import api from '../../api.js'

// const MAIN_ITEMS = [
//   { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//   { id: 'products', label: 'Products', icon: Package },
//   { id: 'orders', label: 'Orders', icon: ShoppingBag },
//   { id: 'customers', label: 'Customers', icon: Users },
//   { id: 'agent', label: 'AI Agent', icon: Sparkles },
//   { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//   { id: 'marketing', label: 'Marketing', icon: Megaphone },
//   { id: 'discounts', label: 'Discounts', icon: Tag },
//   { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
// ]

// const SETTINGS_ITEMS = [
//   { id: 'store-details', label: 'Store Details', icon: Store },
//   { id: 'payments', label: 'Payment & Payouts', icon: CreditCard },
//   { id: 'shipping', label: 'Shipping', icon: Truck },
//   { id: 'integrations', label: 'Integrations', icon: Puzzle },
//   { id: 'users-roles', label: 'Users & Roles', icon: UserCog },
//   { id: 'billing', label: 'Billing', icon: Receipt },
//   { id: 'settings', label: 'Settings', icon: SettingsIcon },
// ]

// export default function Sidebar({ page, setPage, collapsed }) {
//   const [agentActive, setAgentActive] = useState(true)

//   useEffect(() => {
//     let cancelled = false
//     api.merchantAgentStatus()
//       .then((s) => { if (!cancelled) setAgentActive(s.status === 'active') })
//       .catch(() => { if (!cancelled) setAgentActive(false) })
//     return () => { cancelled = true }
//   }, [])

//   function NavButton({ item }) {
//     const Icon = item.icon
//     const active = page === item.id
//     return (
//       <button
//         onClick={() => setPage(item.id)}
//         title={collapsed ? item.label : undefined}
//         className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
//           active ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
//         } ${collapsed ? 'justify-center' : ''}`}
//       >
//         <Icon className="w-4.5 h-4.5 shrink-0" />
//         {!collapsed && <span>{item.label}</span>}
//       </button>
//     )
//   }

//   return (
//     <aside className={`shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all ${collapsed ? 'w-[76px]' : 'w-64'}`}>
//       <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-100">
//         <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shrink-0">
//           <Sparkles className="w-5 h-5" />
//         </span>
//         {!collapsed && (
//           <span className="font-semibold text-base leading-tight">
//             Agentic <span className="text-indigo-600">Commerce</span>
//           </span>
//         )}
//       </div>

//       <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
//         <div>
//           {!collapsed && <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wide mb-2">MAIN</p>}
//           <div className="space-y-1">
//             {MAIN_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
//           </div>
//         </div>
//         <div>
//           {!collapsed && <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wide mb-2">STORE SETTINGS</p>}
//           <div className="space-y-1">
//             {SETTINGS_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
//           </div>
//         </div>
//       </nav>

//       <div className="p-3 border-t border-slate-100">
//         <div className={`bg-indigo-50 rounded-xl p-4 ${collapsed ? 'flex justify-center' : ''}`}>
//           {collapsed ? (
//             <Bot className="w-5 h-5 text-indigo-600" />
//           ) : (
//             <>
//               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
//                 <span className={`w-1.5 h-1.5 rounded-full ${agentActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
//                 AI Agent Status
//               </div>
//               <p className="text-xs text-indigo-600 font-semibold mb-2">{agentActive ? 'Active' : 'Offline'}</p>
//               <p className="text-[11px] text-slate-500 leading-snug mb-3">
//                 Your agent is learning and optimizing your store 24/7.
//               </p>
//               <button
//                 onClick={() => setPage('agent')}
//                 className="w-full text-[11px] font-medium bg-white border border-indigo-200 text-indigo-600 rounded-lg py-1.5 hover:bg-indigo-100 transition"
//               >
//                 View details
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </aside>
//   )
// }


import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Sparkles, BarChart3,
  Tag, ClipboardList, UserCog, Settings as SettingsIcon, Bot,
} from 'lucide-react'
import api from '../../api.js'

const MAIN_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'agent', label: 'AI Agent', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'discounts', label: 'Discounts', icon: Tag },
  { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
]

const SETTINGS_ITEMS = [
  { id: 'users-roles', label: 'Users & Roles', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ page, setPage, collapsed }) {
  const [agentActive, setAgentActive] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.merchantAgentStatus()
      .then((s) => { if (!cancelled) setAgentActive(s.status === 'active') })
      .catch(() => { if (!cancelled) setAgentActive(false) })
    return () => { cancelled = true }
  }, [])

  function NavButton({ item }) {
    const Icon = item.icon
    const active = page === item.id
    return (
      <button
        onClick={() => setPage(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
          active ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    )
  }

  return (
    <aside className={`shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-100">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shrink-0">
          <Sparkles className="w-5 h-5" />
        </span>
        {!collapsed && (
          <span className="font-semibold text-base leading-tight">
            Agentic <span className="text-indigo-600">Commerce</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wide mb-2">MAIN</p>}
          <div className="space-y-1">
            {MAIN_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
          </div>
        </div>
        <div>
          {!collapsed && <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wide mb-2">STORE SETTINGS</p>}
          <div className="space-y-1">
            {SETTINGS_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className={`bg-indigo-50 rounded-xl p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <Bot className="w-5 h-5 text-indigo-600" />
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${agentActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                AI Agent Status
              </div>
              <p className="text-xs text-indigo-600 font-semibold mb-2">{agentActive ? 'Active' : 'Offline'}</p>
              <p className="text-[11px] text-slate-500 leading-snug mb-3">
                Your agent is learning and optimizing your store 24/7.
              </p>
              <button
                onClick={() => setPage('agent')}
                className="w-full text-[11px] font-medium bg-white border border-indigo-200 text-indigo-600 rounded-lg py-1.5 hover:bg-indigo-100 transition"
              >
                View details
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}