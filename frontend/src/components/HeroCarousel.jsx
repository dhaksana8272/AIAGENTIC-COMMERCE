import React, { useEffect, useRef, useState } from 'react'

function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6" />
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

function BotIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 2v6" />
      <circle cx="8" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <path d="M8 18h8" />
    </svg>
  )
}

function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function BarChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

// Slide 1: conversational AI chat mockup
function ChatSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 lg:px-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shrink-0">
            <BotIcon className="w-4.5 h-4.5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">Shopping Agent</div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Online
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="bg-slate-100 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-700 max-w-[85%]">
            Looking for running shoes under ₹4,000?
          </div>
          <div className="bg-indigo-600 text-white rounded-xl rounded-tr-sm px-3.5 py-2.5 text-xs ml-auto max-w-[85%]">
            Found 3 great matches. Want me to compare them?
          </div>
          <div className="bg-slate-100 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-700 max-w-[85%]">
            Yes, and add the best one to cart.
          </div>
        </div>
      </div>
      <p className="text-center text-sm font-medium text-slate-600 mt-5">Conversational commerce, end to end</p>
    </div>
  )
}

// Slide 2: smart product recommendations
function RecommendSlide() {
  const items = [
    { name: 'Trail Runner X2', price: '₹3,499', match: '98%' },
    { name: 'AeroFlex Pro', price: '₹2,899', match: '94%' },
    { name: 'CloudStep Lite', price: '₹3,199', match: '91%' },
  ]
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 lg:px-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <SparkleIcon className="w-4 h-4" />
          </span>
          <div className="text-sm font-semibold text-slate-900">Recommended for you</div>
        </div>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100" />
                <div>
                  <div className="text-xs font-medium text-slate-900">{it.name}</div>
                  <div className="text-[11px] text-slate-500">{it.price}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">{it.match}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-medium text-slate-600 mt-5">AI-ranked matches for every buyer</p>
    </div>
  )
}

// Slide 3: secure checkout
function CheckoutSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 lg:px-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
            <LockIcon className="w-4 h-4" />
          </span>
          <div className="text-sm font-semibold text-slate-900">Secure checkout</div>
        </div>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between"><span>Trail Runner X2</span><span className="font-medium text-slate-900">₹3,499</span></div>
          <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-slate-900">Free</span></div>
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex justify-between text-sm font-semibold text-slate-900"><span>Total</span><span>₹3,499</span></div>
        </div>
        <button className="w-full mt-4 bg-indigo-600 text-white text-xs font-medium rounded-lg py-2.5 flex items-center justify-center gap-1.5">
          <LockIcon className="w-3.5 h-3.5" /> Pay securely
        </button>
      </div>
      <p className="text-center text-sm font-medium text-slate-600 mt-5">Bounded, encrypted, PCI-DSS compliant</p>
    </div>
  )
}

// Slide 4: analytics / insights
function AnalyticsSlide() {
  const bars = [40, 65, 50, 80, 60, 95, 70]
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 lg:px-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 shrink-0">
            <BarChartIcon className="w-4 h-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">Sales this week</div>
            <div className="text-[11px] text-emerald-500">+18.4% vs last week</div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-medium text-slate-600 mt-5">Actionable insights, in real time</p>
    </div>
  )
}

const SLIDES = [ChatSlide, RecommendSlide, CheckoutSlide, AnalyticsSlide]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)
  const hoveringRef = useRef(false)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!hoveringRef.current) {
        setIndex((i) => (i + 1) % SLIDES.length)
      }
    }, 3500)
    return () => clearInterval(timerRef.current)
  }, [])

  function goTo(i) {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }

  const Slide = SLIDES[index]

  return (
    <div
      className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-100 min-h-[360px] lg:min-h-[440px] overflow-hidden"
      onMouseEnter={() => { hoveringRef.current = true }}
      onMouseLeave={() => { hoveringRef.current = false }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative h-full min-h-[360px] lg:min-h-[440px] py-10">
        <Slide key={index} />
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow border border-slate-200 text-slate-600 transition"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow border border-slate-200 text-slate-600 transition"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-indigo-600' : 'w-1.5 bg-indigo-200 hover:bg-indigo-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}