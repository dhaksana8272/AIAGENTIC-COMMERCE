import React, { useState } from 'react'
import api from '../api.js'

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ShoppingBagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2l1.5 5h9L18 2" />
      <path d="M3.5 7h17l-1.4 12.6a2 2 0 0 1-2 1.4H6.9a2 2 0 0 1-2-1.4L3.5 7z" />
      <path d="M9 11a3 3 0 0 0 6 0" />
    </svg>
  )
}

function StoreIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M4 9v10h16V9" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

const ROLES = [
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Chat with the shopping agent and manage your cart & orders.',
    icon: ShoppingBagIcon,
  },
  {
    id: 'merchant',
    title: 'Merchant',
    description: 'View your catalog, policy limits, and the full audit trail.',
    icon: StoreIcon,
  },
]

const initialForm = { name: '', email: '', password: '' }

export default function AuthModal({ isOpen, onClose, onAuthenticated }) {
  const [step, setStep] = useState('role') // 'role' | 'buyer' | 'merchant'
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function reset() {
    setStep('role')
    setMode('login')
    setForm(initialForm)
    setError('')
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function chooseRole(roleId) {
    setStep(roleId)
    setMode('login')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && !form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const payload = { email: form.email.trim(), password: form.password, role: step }
      const user =
        mode === 'signup'
          ? await api.signup({ ...payload, name: form.name.trim() })
          : await api.login(payload)
      reset()
      onAuthenticated(user)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {step === 'role' && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Log in to Agentic Commerce</h2>
            <p className="text-sm text-slate-500 mb-6">Choose how you'd like to continue.</p>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => chooseRole(r.id)}
                  className="w-full flex items-center gap-4 text-left border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl p-4 transition"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                    <r.icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-slate-900">{r.title} Login</span>
                    <span className="block text-xs text-slate-500">{r.description}</span>
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </>
        )}

        {(step === 'buyer' || step === 'merchant') && (
          <>
            <button
              onClick={() => { setStep('role'); setError('') }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Back
            </button>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {mode === 'login' ? 'Log in' : 'Sign up'} as {step === 'buyer' ? 'Buyer' : 'Merchant'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium transition"
              >
                {loading ? 'Please wait…' : mode === 'login' ? `Log in as ${step === 'buyer' ? 'Buyer' : 'Merchant'}` : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}