import React from 'react'
import { Construction } from 'lucide-react'

export default function ComingSoon({ title }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 mb-4">
        <Construction className="w-7 h-7" />
      </span>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        This section is coming soon. We're focused on getting Dashboard, Products, Orders,
        Customers, and the AI Agent fully working first.
      </p>
    </div>
  )
}
