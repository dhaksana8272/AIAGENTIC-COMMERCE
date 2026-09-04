import React, { useEffect, useRef, useState } from 'react'
import { Bot, Trash2, Send, Check } from 'lucide-react'
import ProductCarousel from './ProductCarousel.jsx'

const DEFAULT_CHIPS = ['Show me hoodies', 'Show me caps', "What's trending?"]

function chipsFor(message) {
  if (!message || message.role !== 'agent') return DEFAULT_CHIPS
  if (message.products && message.products.length > 0) {
    return ['Show similar options', "What's the material?", 'Any discounts?', `Add ${message.products[0].name} to cart`]
  }
  if (message.proposedAction?.action === 'add_to_cart') {
    return ['Checkout now', 'Keep shopping']
  }
  return DEFAULT_CHIPS
}

export default function ChatPanel({ messages, loading, onSend, onClearChat, onAddProductToCart, onCheckoutNow }) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  function handleChip(chip) {
    if (chip === 'Checkout now') {
      onCheckoutNow()
      return
    }
    onSend(chip)
  }

  const lastMessage = messages[messages.length - 1]
  const chips = loading ? [] : chipsFor(lastMessage)

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl h-[75vh]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white">
            <Bot className="w-4.5 h-4.5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">AI Shopping Assistant</p>
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
        </div>
        <button
          onClick={onClearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'buyer' ? 'justify-end' : 'justify-start'} gap-2.5`}>
            {m.role === 'agent' && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shrink-0">
                <Bot className="w-4 h-4" />
              </span>
            )}
            <div className={`max-w-[80%] ${m.role === 'buyer' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'buyer'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 px-1">
                {m.time}
                {m.role === 'buyer' && <Check className="w-3 h-3 text-indigo-400" />}
              </span>
              {m.products && (
                <div className="w-full">
                  <ProductCarousel products={m.products} onAddToCart={onAddProductToCart} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shrink-0">
              <Bot className="w-4 h-4" />
            </span>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 text-slate-400 text-sm">Thinking…</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {chips.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => handleChip(c)}
              className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full px-3.5 py-1.5 transition"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">AI may make mistakes. Please review before completing your purchase.</p>
      </form>
    </div>
  )
}
