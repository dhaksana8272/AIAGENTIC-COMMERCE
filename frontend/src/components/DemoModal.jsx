import React, { useState } from 'react'

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

const initialForm = { name: '', email: '', company: '', message: '' }

export default function DemoModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  function reset() {
    setForm(initialForm)
    setError('')
    setSubmitted(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      setError('Please fill in your name, email, and company.')
      return
    }
    // No backend endpoint for demo requests yet — acknowledge locally.
    setSubmitted(true)
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

        {!submitted ? (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Book a Demo</h2>
            <p className="text-sm text-slate-500 mb-6">
              Tell us a bit about your business and we'll set up a walkthrough.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Work email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Your company"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">What would you like to see? (optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="e.g. checkout flow, merchant dashboard, policy controls…"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition"
              >
                Request demo
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4">
              <CheckCircleIcon className="w-7 h-7" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Request received</h2>
            <p className="text-sm text-slate-500 mb-6">
              Thanks, {form.name.split(' ')[0]}! Our team will reach out to {form.email} shortly to schedule your demo.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}