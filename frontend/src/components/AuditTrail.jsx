// import React, { useEffect, useState, useCallback } from 'react'
// import { ClipboardList, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
// import api from '../api.js'

// const statusColor = {
//   allowed: 'text-emerald-600',
//   'approved:human': 'text-emerald-600',
//   'blocked:bound': 'text-red-500',
//   'blocked:gate_pending': 'text-amber-600',
// }

// const finalStatusBadge = {
//   success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
//   failed: 'bg-red-50 text-red-600 border-red-200',
//   blocked: 'bg-red-50 text-red-600 border-red-200',
//   pending: 'bg-slate-100 text-slate-500 border-slate-200',
//   pending_confirmation: 'bg-amber-50 text-amber-600 border-amber-200',
//   logged: 'bg-slate-100 text-slate-500 border-slate-200',
// }

// export default function AuditTrail({ sessionId }) {
//   const [entries, setEntries] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [expanded, setExpanded] = useState({})

//   const load = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await api.audit(sessionId)
//       setEntries(res)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setLoading(false)
//     }
//   }, [sessionId])

//   useEffect(() => {
//     load()
//   }, [load])

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
//           <ClipboardList className="w-5 h-5 text-indigo-600" />
//           Audit Trail <span className="text-slate-400 font-normal text-sm">{sessionId ? '(current session)' : '(all sessions)'}</span>
//         </h2>
//         <button
//           onClick={load}
//           className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
//         >
//           <RefreshCw className="w-3.5 h-3.5" /> Refresh
//         </button>
//       </div>

//       {loading && <p className="text-slate-400 text-sm">Loading…</p>}
//       {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
//       {!loading && entries.length === 0 && (
//         <p className="text-slate-400 text-sm">No actions logged yet — chat with the buyer agent first.</p>
//       )}

//       <ol className="space-y-3">
//         {entries.map((e) => {
//           const isOpen = expanded[e.id]
//           const params = e.proposed_params_json ? JSON.parse(e.proposed_params_json) : {}
//           return (
//             <li key={e.id} className="bg-white border border-slate-200 rounded-2xl p-4">
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <p className="font-medium text-sm text-slate-900">{e.action_type}</p>
//                   <p className="text-xs text-slate-400">{new Date(e.timestamp).toLocaleString()}</p>
//                 </div>
//                 <span className={`text-xs px-2 py-1 rounded-full border font-medium ${finalStatusBadge[e.final_status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
//                   {e.final_status}
//                 </span>
//               </div>

//               <p className="text-sm text-slate-600 mt-2">{e.agent_reasoning_text}</p>
//               <p className={`text-xs mt-1 font-mono ${statusColor[e.policy_check_result] || 'text-slate-400'}`}>
//                 policy: {e.policy_check_result}
//               </p>

//               <button
//                 onClick={() => setExpanded((s) => ({ ...s, [e.id]: !s[e.id] }))}
//                 className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2"
//               >
//                 {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
//                 {isOpen ? 'Hide details' : 'Show details'}
//               </button>

//               {isOpen && (
//                 <div className="mt-3 space-y-3 text-xs">
//                   <div>
//                     <p className="text-slate-400 mb-1">Proposed params</p>
//                     <pre className="bg-slate-50 border border-slate-100 rounded-lg p-2 overflow-x-auto text-slate-600">{JSON.stringify(params, null, 2)}</pre>
//                   </div>
//                   <div>
//                     <p className="text-slate-400 mb-1">Razorpay call made: {String(e.razorpay_call_made)}</p>
//                     {e.razorpay_response_json && (
//                       <pre className="bg-slate-50 border border-slate-100 rounded-lg p-2 overflow-x-auto text-slate-600">{e.razorpay_response_json}</pre>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </li>
//           )
//         })}
//       </ol>
//     </div>
//   )
// }


import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api.js'

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function PrettyValue({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-300 italic">—</span>
  }
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{String(value)}</span>
  }
  if (typeof value === 'number') {
    return <span className="text-slate-900 font-medium">{value}</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-300 italic">Empty</span>
    return (
      <div className="space-y-2 mt-1">
        {value.map((item, i) =>
          item !== null && typeof item === 'object' ? (
            <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <PrettyObject data={item} />
            </div>
          ) : (
            <div key={i} className="text-slate-900 text-xs">
              <PrettyValue value={item} />
            </div>
          )
        )}
      </div>
    )
  }
  if (typeof value === 'object') {
    return (
      <div className="mt-1 pl-3 border-l-2 border-slate-100">
        <PrettyObject data={value} />
      </div>
    )
  }
  return <span className="text-slate-900">{String(value)}</span>
}

function PrettyObject({ data }) {
  return (
    <dl className="space-y-1.5">
      {Object.entries(data).map(([key, val]) => {
        const isComplex = val !== null && typeof val === 'object'
        return (
          <div key={key} className={isComplex ? '' : 'flex items-baseline justify-between gap-4 text-xs'}>
            <dt className="text-slate-400 shrink-0">{formatLabel(key)}</dt>
            <dd className={isComplex ? '' : 'text-right'}>
              <PrettyValue value={val} />
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

// Renders a JSON value (object) or a JSON string in a readable form, with a
// toggle to fall back to the raw formatted JSON when needed for debugging.
function JsonDetail({ data }) {
  const [showRaw, setShowRaw] = useState(false)
  let parsed = data
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = null
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return <pre className="bg-slate-50 border border-slate-100 rounded-lg p-2 overflow-x-auto text-slate-600">{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
      {showRaw ? (
        <pre className="overflow-x-auto text-slate-600 text-xs">{JSON.stringify(parsed, null, 2)}</pre>
      ) : (
        <PrettyObject data={parsed} />
      )}
      <button
        onClick={() => setShowRaw((v) => !v)}
        className="text-[11px] text-indigo-500 hover:text-indigo-600 font-medium mt-2"
      >
        {showRaw ? 'Show readable view' : 'View raw JSON'}
      </button>
    </div>
  )
}

const statusColor = {
  allowed: 'text-emerald-600',
  'approved:human': 'text-emerald-600',
  'blocked:bound': 'text-red-500',
  'blocked:gate_pending': 'text-amber-600',
}

const finalStatusBadge = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  blocked: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-slate-100 text-slate-500 border-slate-200',
  pending_confirmation: 'bg-amber-50 text-amber-600 border-amber-200',
  logged: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function AuditTrail({ sessionId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.audit(sessionId)
      setEntries(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          Audit Trail <span className="text-slate-400 font-normal text-sm">{sessionId ? '(current session)' : '(all sessions)'}</span>
        </h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {!loading && entries.length === 0 && (
        <p className="text-slate-400 text-sm">No actions logged yet — chat with the buyer agent first.</p>
      )}

      <ol className="space-y-3">
        {entries.map((e) => {
          const isOpen = expanded[e.id]
          const params = e.proposed_params_json ? JSON.parse(e.proposed_params_json) : {}
          return (
            <li key={e.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-slate-900">{e.action_type}</p>
                  <p className="text-xs text-slate-400">{new Date(e.timestamp).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${finalStatusBadge[e.final_status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {e.final_status}
                </span>
              </div>

              <p className="text-sm text-slate-600 mt-2">{e.agent_reasoning_text}</p>
              <p className={`text-xs mt-1 font-mono ${statusColor[e.policy_check_result] || 'text-slate-400'}`}>
                policy: {e.policy_check_result}
              </p>

              <button
                onClick={() => setExpanded((s) => ({ ...s, [e.id]: !s[e.id] }))}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2"
              >
                {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isOpen ? 'Hide details' : 'Show details'}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">Proposed params</p>
                    <JsonDetail data={params} />
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Razorpay call made: {String(e.razorpay_call_made)}</p>
                    {e.razorpay_response_json && (
                      <JsonDetail data={e.razorpay_response_json} />
                    )}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}