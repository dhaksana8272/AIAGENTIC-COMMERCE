import React, { useEffect, useState } from 'react'
import api from '../../api.js'

const ROLE_BADGE = { merchant: 'bg-indigo-50 text-indigo-600', buyer: 'bg-slate-100 text-slate-600' }

export default function UsersRolesPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.merchantUsers().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users &amp; Roles</h1>
        <p className="text-sm text-slate-500">Everyone with an account on this storefront.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        {loading && <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">No users yet.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-3 pr-3 font-medium text-slate-900">{u.name}</td>
                  <td className="py-3 pr-3 text-slate-600">{u.email}</td>
                  <td className="py-3 pr-3">
                    <span className={`text-xs font-medium capitalize rounded-full px-2.5 py-1 ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
