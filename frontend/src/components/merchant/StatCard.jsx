import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, changePct }) {
  const hasChange = changePct !== null && changePct !== undefined
  const positive = hasChange && changePct >= 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        <span className="text-slate-400">vs last period</span>
        {hasChange && (
          <span className={`flex items-center gap-0.5 font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
