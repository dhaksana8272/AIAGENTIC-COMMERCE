// import React, { useEffect, useRef, useState } from 'react'
// import { Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react'
// import api from '../../api.js'

// export default function Topbar({ user, onLogout }) {
//   const [notifOpen, setNotifOpen] = useState(false)
//   const [helpOpen, setHelpOpen] = useState(false)
//   const [profileOpen, setProfileOpen] = useState(false)
//   const [notifications, setNotifications] = useState([])
//   const notifRef = useRef(null)
//   const helpRef = useRef(null)
//   const profileRef = useRef(null)

//   useEffect(() => {
//     if (!user?.id) return
//     api.orders(user.id)
//       .then((orders) => {
//         const items = orders.slice(0, 6).map((o) => ({
//           id: o.id,
//           text: o.status === 'paid'
//             ? `Payment confirmed for ₹${o.amount_inr.toLocaleString('en-IN')} order.`
//             : `Order created for ₹${o.amount_inr.toLocaleString('en-IN')} — status: ${o.status}.`,
//           time: o.created_at ? new Date(o.created_at).toLocaleString() : '',
//         }))
//         setNotifications(items)
//       })
//       .catch(() => {})
//   }, [user?.id])

//   useEffect(() => {
//     function onClickOutside(e) {
//       if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
//       if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
//       if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
//     }
//     document.addEventListener('mousedown', onClickOutside)
//     return () => document.removeEventListener('mousedown', onClickOutside)
//   }, [])

//   return (
//     <header className="flex items-center justify-between px-6 py-4">
//       <div className="flex items-center gap-2">
//         <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
//           <span className="text-sm font-bold">✦</span>
//         </span>
//         <span className="font-semibold text-lg text-slate-900">
//           Agentic <span className="text-indigo-600">Commerce</span>
//         </span>
//       </div>

//       <div className="flex items-center gap-4">
//         <div className="relative" ref={notifRef}>
//           <button onClick={() => { setNotifOpen((v) => !v); setHelpOpen(false); setProfileOpen(false) }} className="relative text-slate-500 hover:text-slate-800 transition" aria-label="Notifications">
//             <Bell className="w-5 h-5" />
//             {notifications.length > 0 && (
//               <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
//                 {notifications.length}
//               </span>
//             )}
//           </button>
//           {notifOpen && (
//             <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
//               <p className="px-3 pb-2 text-xs font-semibold text-slate-400 border-b border-slate-100">Order updates</p>
//               {notifications.length === 0 ? (
//                 <p className="px-3 py-4 text-sm text-slate-400">No updates yet.</p>
//               ) : (
//                 <ul className="max-h-64 overflow-y-auto">
//                   {notifications.map((n) => (
//                     <li key={n.id} className="px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
//                       <p className="text-slate-800">{n.text}</p>
//                       <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="relative" ref={helpRef}>
//           <button onClick={() => { setHelpOpen((v) => !v); setNotifOpen(false); setProfileOpen(false) }} className="text-slate-500 hover:text-slate-800 transition" aria-label="Help">
//             <HelpCircle className="w-5 h-5" />
//           </button>
//           {helpOpen && (
//             <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-40 text-sm text-slate-600">
//               <p className="font-semibold text-slate-900 mb-1">How this works</p>
//               <p>Chat naturally to browse products, add to cart, and check out. Every action is policy-checked and logged before any payment happens.</p>
//             </div>
//           )}
//         </div>

//         <div className="relative" ref={profileRef}>
//           <button onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); setHelpOpen(false) }} className="flex items-center gap-2">
//             <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
//               {user?.name?.[0]?.toUpperCase() || 'B'}
//             </span>
//             <span className="hidden sm:block text-left">
//               <span className="block text-sm font-medium text-slate-900 leading-tight">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
//               <span className="block text-[11px] text-slate-500 leading-tight">Buyer</span>
//             </span>
//             <ChevronDown className="w-4 h-4 text-slate-400" />
//           </button>
//           {profileOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
//               <div className="px-3 py-2 border-b border-slate-100">
//                 <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
//                 <p className="text-xs text-slate-500 truncate">{user?.email}</p>
//               </div>
//               <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
//                 <LogOut className="w-4 h-4" /> Log out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }



import React, { useEffect, useRef, useState } from 'react'
import { Menu, Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react'
import api from '../../api.js'

export default function Topbar({ user, onLogout, onToggleSidebar }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)
  const helpRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    api.orders(user.id)
      .then((orders) => {
        const items = orders.slice(0, 6).map((o) => ({
          id: o.id,
          text: o.status === 'paid'
            ? `Payment confirmed for ₹${o.amount_inr.toLocaleString('en-IN')} order.`
            : `Order created for ₹${o.amount_inr.toLocaleString('en-IN')} — status: ${o.status}.`,
          time: o.created_at ? new Date(o.created_at).toLocaleString() : '',
        }))
        setNotifications(items)
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-6 py-3.5">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-slate-500 hover:text-slate-800 transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
            <span className="text-sm font-bold">✦</span>
          </span>
          <span className="font-semibold text-lg text-slate-900">
            Agentic <span className="text-indigo-600">Commerce</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setNotifOpen((v) => !v); setHelpOpen(false); setProfileOpen(false) }} className="relative text-slate-500 hover:text-slate-800 transition" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
              <p className="px-3 pb-2 text-xs font-semibold text-slate-400 border-b border-slate-100">Order updates</p>
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-400">No updates yet.</p>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
                      <p className="text-slate-800">{n.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={helpRef}>
          <button onClick={() => { setHelpOpen((v) => !v); setNotifOpen(false); setProfileOpen(false) }} className="text-slate-500 hover:text-slate-800 transition" aria-label="Help">
            <HelpCircle className="w-5 h-5" />
          </button>
          {helpOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-40 text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-1">How this works</p>
              <p>Chat naturally to browse products, add to cart, and check out. Every action is policy-checked and logged before any payment happens.</p>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); setHelpOpen(false) }} className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-sm font-medium text-slate-900 leading-tight">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
              <span className="block text-[11px] text-slate-500 leading-tight">Buyer</span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}