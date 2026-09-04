// import React from 'react'
// import { MessageCircle, ShoppingCart, Package, Sparkles } from 'lucide-react'

// const NAV_ITEMS = [
//   { id: 'chat', label: 'Chat', icon: MessageCircle },
//   { id: 'cart', label: 'My Cart', icon: ShoppingCart, badgeKey: 'cartCount' },
//   { id: 'orders', label: 'My Orders', icon: Package },
// ]

// export default function Sidebar({ page, setPage, cartCount }) {
//   return (
//     <aside className="w-64 shrink-0 flex flex-col gap-4 p-4">
//       <nav className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1">
//         {NAV_ITEMS.map((item) => {
//           const Icon = item.icon
//           const active = page === item.id
//           return (
//             <button
//               key={item.id}
//               onClick={() => setPage(item.id)}
//               className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition ${
//                 active ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
//               }`}
//             >
//               <span className="flex items-center gap-2.5">
//                 <Icon className="w-4.5 h-4.5" /> {item.label}
//               </span>
//               {item.badgeKey === 'cartCount' && cartCount > 0 && (
//                 <span className="bg-indigo-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//           )
//         })}
//       </nav>

//       <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white mt-auto">
//         <Sparkles className="w-6 h-6 mb-3 opacity-90" />
//         <p className="font-semibold leading-snug mb-2">AI that shops<br />so you grow.</p>
//         <p className="text-xs text-indigo-100 leading-relaxed">
//           Smart recommendations. Safe payments. Happy you.
//         </p>
//       </div>
//     </aside>
//   )
// }


import React from 'react'
import { MessageCircle, ShoppingCart, Package, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'cart', label: 'My Cart', icon: ShoppingCart, badgeKey: 'cartCount' },
  { id: 'orders', label: 'My Orders', icon: Package },
]

export default function Sidebar({ page, setPage, cartCount, collapsed }) {
  return (
    <aside className={`shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                active ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
              } ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              <span className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                <Icon className="w-4.5 h-4.5 shrink-0" /> {!collapsed && item.label}
              </span>
              {item.badgeKey === 'cartCount' && cartCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {cartCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white ${collapsed ? 'p-3 flex justify-center' : 'p-5'}`}>
          {collapsed ? (
            <Sparkles className="w-5 h-5 opacity-90" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 mb-3 opacity-90" />
              <p className="font-semibold leading-snug mb-2">AI that shops<br />so you grow.</p>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Smart recommendations. Safe payments. Happy you.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}