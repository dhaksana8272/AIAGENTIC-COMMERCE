import React, { useEffect, useState } from 'react'
import api from '../../api.js'

export default function SettingsPage({ user, onNavigate }) {
  const [policy, setPolicy] = useState(null)

  useEffect(() => {
    api.merchantAgentPolicy().then(setPolicy).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Your account and a quick summary of your store's active policy.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
        <h2 className="font-semibold text-slate-900 mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">{user?.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium text-slate-900 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Active Policy Summary</h2>
          <button onClick={() => onNavigate('agent')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            Edit in AI Agent →
          </button>
        </div>
        {policy ? (
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Max transaction amount: <strong className="text-slate-900">₹{policy.max_txn_amount_inr}</strong></li>
            <li>Max transactions per session: <strong className="text-slate-900">{policy.max_txns_per_session}</strong></li>
            <li>Auto-approve below: <strong className="text-slate-900">₹{policy.auto_approve_below_inr}</strong></li>
            <li>Requires confirmation above: <strong className="text-slate-900">₹{policy.requires_human_confirm_above_inr}</strong></li>
            <li>Allowed categories: <strong className="text-slate-900">{policy.allowed_categories.join(', ')}</strong></li>
            <li>Max agent discount: <strong className="text-slate-900">{policy.max_discount_pct_agent_can_apply}%</strong></li>
          </ul>
        ) : <p className="text-sm text-slate-400">Loading…</p>}
      </div>
    </div>
  )
}
