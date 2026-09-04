import React, { useState, useRef, useEffect } from 'react'
import api from '../api.js'
import OrderHistory from './OrderHistory.jsx'
export default function ChatWidget({ sessionId, setSessionId,buyerId }) {
  const [messages, setMessages] = useState([
    { role: 'agent', text: "Hi! I'm your shopping assistant. Try: \"I want a blue hoodie\" or \"show me caps\"." },
  ])
  const [input, setInput] = useState('')
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkoutState, setCheckoutState] = useState(null) // {audit_id, allowed, requires_confirmation, reason}
  const [payLink, setPayLink] = useState(null)
  const scrollRef = useRef(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const cartTotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)

  async function sendMessage(text) {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'buyer', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await api.chat({ session_id: sessionId, user_id: buyerId,message: text })
      setSessionId(res.session_id)
      setMessages((m) => [...m, { role: 'agent', text: res.reply }])

      if (res.proposed_action?.action === 'add_to_cart') {
        const { sku, quantity, amount_inr } = res.proposed_action
        setCart((c) => {
          const existing = c.find((i) => i.sku === sku)
          if (existing) {
            return c.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + quantity } : i))
          }
          return [...c, { sku, quantity, price_inr: amount_inr / quantity, name: sku }]
        })
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  async function proposeCheckout() {
    setPayLink(null)
    try {
      const res = await api.proposeCheckout({
        session_id: sessionId,
        user_id: buyerId,
        amount_inr: cartTotal,
        items: cart,
      })
      setCheckoutState(res)
      if (res.allowed && !res.requires_confirmation) {
        await doConfirm(res.audit_id)
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Checkout error: ${e.message}` }])
    }
  }

  async function doConfirm(auditId) {
    try {
      const res = await api.confirmCheckout({ session_id: sessionId, audit_id: auditId })
      setPayLink(res.payment_link)
      setMessages((m) => [...m, { role: 'agent', text: `Payment link created (via ${res.path_used}). Pay with any Razorpay test card to complete the order.` }])
      setCart([])
      setCheckoutState(null)
      setHistoryRefreshKey((k) => k + 1)
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Payment failed: ${e.message}` }])
    }
  }

  async function doDecline() {
    try {
      const res = await api.simulateDecline({ session_id: sessionId, amount_inr: cartTotal })
      setMessages((m) => [...m, { role: 'agent', text: res.message }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}` }])
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat panel */}
      <div className="lg:col-span-2 flex flex-col bg-slate-950 rounded-xl border border-slate-800 h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'buyer' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-slate-500 text-sm">Agent is thinking…</div>}
          <div ref={scrollRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="border-t border-slate-800 p-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a product, or say 'checkout'…"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium">
            Send
          </button>
        </form>
      </div>

      {/* Cart / checkout panel */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-[70vh] overflow-y-auto">
        <h2 className="font-semibold mb-3">Cart</h2>
        {cart.length === 0 && <p className="text-sm text-slate-500">Empty — chat with the agent to add items.</p>}
        <ul className="space-y-2 mb-4">
          {cart.map((i) => (
            <li key={i.sku} className="flex justify-between text-sm">
              <span>{i.name} x{i.quantity}</span>
              <span>₹{i.price_inr * i.quantity}</span>
            </li>
          ))}
        </ul>
        {cart.length > 0 && (
          <div className="border-t border-slate-800 pt-3 mb-4 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        )}

        {cart.length > 0 && !checkoutState && (
          <button
            onClick={proposeCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-lg py-2 text-sm font-medium mb-2"
          >
            Checkout ₹{cartTotal}
          </button>
        )}

        {checkoutState && !checkoutState.allowed && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-sm text-red-200">
            <p className="font-medium mb-1">Blocked by policy</p>
            <p>{checkoutState.reason}</p>
          </div>
        )}

        {checkoutState && checkoutState.allowed && checkoutState.requires_confirmation && (
          <div className="bg-amber-950 border border-amber-800 rounded-lg p-3 text-sm text-amber-100 space-y-2">
            <p className="font-medium">Confirmation required</p>
            <p>{checkoutState.reason}</p>
            <div className="flex gap-2">
              <button
                onClick={() => doConfirm(checkoutState.audit_id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg py-1.5 text-sm font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => setCheckoutState(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 rounded-lg py-1.5 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {payLink && (
          <div className="mt-3 bg-emerald-950 border border-emerald-800 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Payment link ready</p>
            <a href={payLink} target="_blank" rel="noreferrer" className="text-emerald-300 underline break-all">
              {payLink}
            </a>
          </div>
        )}

        <button
          onClick={doDecline}
          disabled={cart.length === 0 && !payLink}
          className="w-full mt-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg py-2 text-xs text-slate-300"
        >
          Simulate a failed / declined payment (demo)
        </button>
      </div>
      {/* Order history panel */}
<div className="lg:col-span-3">
  {/* <OrderHistory sessionId={sessionId} refreshKey={historyRefreshKey} /> */}
  <OrderHistory userId={buyerId} refreshKey={historyRefreshKey} />
</div>
    </div>
    
  )
}
