import React, { useEffect, useState } from 'react'
import { Tag, Save } from 'lucide-react'
import api from '../../api.js'

export default function DiscountsPage() {
  const [policy, setPolicy] = useState(null)
  const [value, setValue] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.merchantAgentPolicy().then((p) => { setPolicy(p); setValue(p.max_discount_pct_agent_can_apply) })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const updated = await api.merchantUpdatePolicy({ ...policy, max_discount_pct_agent_can_apply: parseFloat(value) })
      setPolicy(updated)
      setSaved(true)
    } catch (e2) {
      setError(e2.message)
    } finally {
      setSaving(false)
    }
  }

  if (!policy) return <p className="text-sm text-slate-400">Loading…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Discounts</h1>
        <p className="text-sm text-slate-500">Control how much discount the AI agent is allowed to apply on its own.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600"><Tag className="w-4.5 h-4.5" /></span>
          <div>
            <p className="font-semibold text-slate-900">Agent discount cap</p>
            <p className="text-xs text-slate-500">Any discount above this is automatically blocked by the policy engine.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Max discount</label>
              <span className="text-sm font-semibold text-indigo-600">{value}%</span>
            </div>
            <input
              type="range" min="0" max="50" step="1"
              value={value}
              onChange={(e) => { setValue(e.target.value); setSaved(false) }}
              className="w-full accent-indigo-600"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {saved && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Saved — the agent will respect this cap immediately.</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
