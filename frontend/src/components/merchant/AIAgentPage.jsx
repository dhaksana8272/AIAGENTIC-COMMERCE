import React, { useCallback, useEffect, useState } from 'react'
import { Bot, ShieldCheck, ShieldAlert, Hourglass, Activity, Save } from 'lucide-react'
import api from '../../api.js'

const RESULT_LABEL = {
  allowed: { text: 'Auto-approved', color: 'text-emerald-600 bg-emerald-50' },
  'approved:human': { text: 'Approved by buyer', color: 'text-emerald-600 bg-emerald-50' },
  'blocked:bound': { text: 'Blocked (policy bound)', color: 'text-red-600 bg-red-50' },
  'blocked:gate_pending': { text: 'Awaiting buyer confirmation', color: 'text-amber-600 bg-amber-50' },
}

export default function AIAgentPage() {
  const [status, setStatus] = useState(null)
  const [policy, setPolicy] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(() => {
    Promise.all([api.merchantAgentStatus(), api.merchantAgentPolicy()])
      .then(([s, p]) => { setStatus(s); setPolicy(p); setForm(p) })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => { load() }, [load])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      const payload = {
        max_txn_amount_inr: parseFloat(form.max_txn_amount_inr),
        max_txns_per_session: parseInt(form.max_txns_per_session, 10),
        auto_approve_below_inr: parseFloat(form.auto_approve_below_inr),
        requires_human_confirm_above_inr: parseFloat(form.requires_human_confirm_above_inr),
        allowed_categories: Array.isArray(form.allowed_categories)
          ? form.allowed_categories
          : String(form.allowed_categories).split(',').map((c) => c.trim()).filter(Boolean),
        max_discount_pct_agent_can_apply: parseFloat(form.max_discount_pct_agent_can_apply),
      }
      const updated = await api.merchantUpdatePolicy(payload)
      setPolicy(updated)
      setForm(updated)
      setSaved(true)
    } catch (e2) {
      setSaveError(e2.message)
    } finally {
      setSaving(false)
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!status || !form) return <p className="text-sm text-slate-400">Loading agent status…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Agent</h1>
        <p className="text-sm text-slate-500">Live status and the bounds your buyer-facing agent operates within.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600"><Bot className="w-4.5 h-4.5" /></span>
            <span className="text-sm text-slate-500">Status</span>
          </div>
          <p className="text-lg font-bold text-slate-900 capitalize flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {status.status}
          </p>
          <p className="text-xs text-slate-400 mt-1">Model: {status.model}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600"><Activity className="w-4.5 h-4.5" /></span>
            <span className="text-sm text-slate-500">Actions Logged</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{status.total_actions_logged}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck className="w-4.5 h-4.5" /></span>
            <span className="text-sm text-slate-500">Auto-Approved</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{status.auto_approved}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600"><ShieldAlert className="w-4.5 h-4.5" /></span>
            <span className="text-sm text-slate-500">Blocked by Policy</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{status.blocked_by_policy}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Hourglass className="w-4.5 h-4.5 text-indigo-500" /> Recent Agent Activity
          </h2>
          {status.recent_activity.length === 0 ? (
            <p className="text-sm text-slate-400">No agent actions yet.</p>
          ) : (
            <ul className="space-y-3">
              {status.recent_activity.map((a) => {
                const r = RESULT_LABEL[a.policy_check_result] || { text: a.policy_check_result, color: 'text-slate-600 bg-slate-100' }
                return (
                  <li key={a.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-800 capitalize">{a.action_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
                    </div>
                    <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${r.color}`}>{r.text}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Agent Policy Controls</h2>
          <p className="text-xs text-slate-500 -mt-2">
            These bounds are enforced deterministically before any payment action — edits here take effect immediately.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max transaction (₹)</label>
              <input type="number" value={form.max_txn_amount_inr} onChange={(e) => update('max_txn_amount_inr', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max txns / session</label>
              <input type="number" value={form.max_txns_per_session} onChange={(e) => update('max_txns_per_session', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Auto-approve below (₹)</label>
              <input type="number" value={form.auto_approve_below_inr} onChange={(e) => update('auto_approve_below_inr', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Requires confirm above (₹)</label>
              <input type="number" value={form.requires_human_confirm_above_inr} onChange={(e) => update('requires_human_confirm_above_inr', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Allowed categories (comma-separated)</label>
            <input
              value={Array.isArray(form.allowed_categories) ? form.allowed_categories.join(', ') : form.allowed_categories}
              onChange={(e) => update('allowed_categories', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Max agent-applied discount (%)</label>
            <input type="number" value={form.max_discount_pct_agent_can_apply} onChange={(e) => update('max_discount_pct_agent_can_apply', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>}
          {saved && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Policy updated — the agent will use these bounds immediately.</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save policy'}
          </button>
        </form>
      </div>
    </div>
  )
}
