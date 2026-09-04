import React, { useEffect, useRef, useState } from 'react'
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react'

export default function Topbar({ user, onLogout, onToggleSidebar, onSearch, notifications }) {
  const [query, setQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const helpRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.(query)
  }

  const unread = notifications?.filter((n) => !n.read).length || 0

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggleSidebar}
            className="text-slate-500 hover:text-slate-800 transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="relative max-w-sm w-full hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-14 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            <kbd className="hidden md:inline text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 absolute right-2.5 top-1/2 -translate-y-1/2">
              Ctrl+K
            </kbd>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); setHelpOpen(false) }}
              className="relative text-slate-500 hover:text-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
                <p className="px-3 pb-2 text-xs font-semibold text-slate-400 border-b border-slate-100">Notifications</p>
                {(!notifications || notifications.length === 0) ? (
                  <p className="px-3 py-4 text-sm text-slate-400">You're all caught up.</p>
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
            <button
              onClick={() => { setHelpOpen((v) => !v); setNotifOpen(false); setProfileOpen(false) }}
              className="text-slate-500 hover:text-slate-800 transition"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {helpOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-40 text-sm text-slate-600">
                <p className="font-semibold text-slate-900 mb-1">Need a hand?</p>
                <p>Every number on this dashboard comes straight from your store's live orders, catalog, and agent activity — nothing here is sample data.</p>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); setHelpOpen(false) }}
              className="flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'M'}
              </span>
              <span className="hidden sm:block text-left">
                <span className="block text-sm font-medium text-slate-900 leading-tight">{user?.name || 'Merchant'}</span>
                <span className="block text-[11px] text-slate-500 leading-tight">Merchant</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
