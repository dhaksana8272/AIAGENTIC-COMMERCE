// import React from 'react'

// function SparkleIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
//       <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
//     </svg>
//   )
// }

// function MessageSquareIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
//     </svg>
//   )
// }

// function ShieldCheckIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//       <path d="M9 12l2 2 4-4" />
//     </svg>
//   )
// }

// function TrendingUpIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
//       <polyline points="17 6 23 6 23 12" />
//     </svg>
//   )
// }

// function LockIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <rect x="3" y="11" width="18" height="11" rx="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   )
// }

// function ShieldIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
//   )
// }

// function UsersIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//       <circle cx="9" cy="7" r="4" />
//       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//     </svg>
//   )
// }

// function ArrowRightLeftIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <polyline points="17 1 21 5 17 9" />
//       <path d="M3 11V9a4 4 0 0 1 4-4h14" />
//       <polyline points="7 23 3 19 7 15" />
//       <path d="M21 13v2a4 4 0 0 1-4 4H3" />
//     </svg>
//   )
// }

// function CheckCircleIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//       <polyline points="22 4 12 14.01 9 11.01" />
//     </svg>
//   )
// }

// function ArrowRightIcon(props) {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <line x1="5" y1="12" x2="19" y2="12" />
//       <polyline points="12 5 19 12 12 19" />
//     </svg>
//   )
// }

// const NAV_LINKS = ['Features', 'For Merchants', 'Security', 'How it Works', 'Pricing', 'Docs']

// const TRUST_BADGES = [
//   { icon: ShieldIcon, label: 'Secure by Razorpay' },
//   { icon: LockIcon, label: 'PCI DSS Compliant' },
//   { icon: ShieldCheckIcon, label: 'Encrypted Payments' },
//   { icon: UsersIcon, label: 'Buyer & Merchant Protection' },
// ]

// const FEATURES = [
//   { icon: MessageSquareIcon, title: 'Conversational Commerce', desc: 'Natural conversations that understand intent and convert.' },
//   { icon: SparkleIcon, title: 'Smart Recommendations', desc: 'AI finds the best products for every buyer.' },
//   { icon: ShieldCheckIcon, title: 'Secure Checkout', desc: 'Bounded actions with enterprise-grade security.' },
//   { icon: TrendingUpIcon, title: 'Actionable Insights', desc: 'Track performance and grow smarter.' },
// ]

// const STATS = [
//   { icon: UsersIcon, value: '10K+', label: 'Merchants' },
//   { icon: ArrowRightLeftIcon, value: '100M+', label: 'Transactions' },
//   { icon: ShieldCheckIcon, value: '99.9%', label: 'Uptime' },
//   { icon: CheckCircleIcon, value: 'Bank-grade', label: 'Security' },
// ]

// export default function LandingPage({ onOpenAuth }) {
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-7xl mx-auto">
//         <div className="flex items-center gap-2">
//           <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
//             <SparkleIcon className="w-5 h-5" />
//           </span>
//           <span className="font-semibold text-lg">
//             Agentic <span className="text-indigo-600">Commerce</span>
//           </span>
//         </div>

//         <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
//           {NAV_LINKS.map((l) => (
//             <a key={l} href="#" className="hover:text-slate-900">{l}</a>
//           ))}
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={onOpenAuth}
//             className="text-sm font-medium border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-100 transition"
//           >
//             Log in
//           </button>
//           <button
//             onClick={onOpenAuth}
//             className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition"
//           >
//             Sign up
//           </button>
//         </div>
//       </nav>

//       {/* Hero */}
//       <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//         <div>
//           <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
//             <SparkleIcon className="w-3.5 h-3.5" />
//             AI AGENTS FOR COMMERCE
//           </span>
//           <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
//             AI agents that sell,<br />so <span className="text-indigo-600">you grow.</span>
//           </h1>
//           <p className="text-slate-600 text-lg mb-8 max-w-lg">
//             Power your business with intelligent AI agents that understand buyers, recommend the
//             right products, and complete secure transactions end-to-end.
//           </p>
//           <div className="flex flex-wrap gap-3 mb-8">
//             <button
//               onClick={onOpenAuth}
//               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-5 py-3 transition"
//             >
//               Log in to Continue
//               <ArrowRightIcon className="w-4 h-4" />
//             </button>
//             <button className="border border-slate-300 hover:bg-slate-100 font-medium rounded-lg px-5 py-3 transition">
//               Book a Demo
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-x-8 gap-y-3">
//             {TRUST_BADGES.map((b) => (
//               <div key={b.label} className="flex items-center gap-2 text-sm text-slate-500">
//                 <b.icon className="w-4 h-4 text-indigo-500" />
//                 {b.label}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-100 min-h-[360px] lg:min-h-[440px] overflow-hidden">
//           <div
//             className="absolute inset-0 opacity-40"
//             style={{
//               backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
//               backgroundSize: '18px 18px',
//             }}
//           />
//         </div>
//       </section>

//       {/* Features */}
//       <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-10">
//         <div className="bg-white border border-slate-200 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//           {FEATURES.map((f) => (
//             <div key={f.title} className="flex flex-col gap-3">
//               <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600">
//                 <f.icon className="w-5 h-5" />
//               </span>
//               <h3 className="font-semibold">{f.title}</h3>
//               <p className="text-sm text-slate-500">{f.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Stats */}
//       <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
//         <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
//           <div className="text-sm text-slate-500 text-center lg:text-left">
//             Trusted by 10K+ merchants and powered by
//             <div className="font-semibold text-slate-900 text-base mt-1">Razorpay</div>
//           </div>
//           <div className="flex flex-wrap justify-center gap-8">
//             {STATS.map((s) => (
//               <div key={s.label} className="flex items-center gap-3">
//                 <span className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-100 text-indigo-600">
//                   <s.icon className="w-5 h-5" />
//                 </span>
//                 <div>
//                   <div className="font-bold text-lg leading-none">{s.value}</div>
//                   <div className="text-xs text-slate-500">{s.label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }



import React, { useState } from 'react'
import HeroCarousel from './HeroCarousel.jsx'
import DemoModal from './DemoModal.jsx'

function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
    </svg>
  )
}

function MessageSquareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function ShieldCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function TrendingUpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ArrowRightLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
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

function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

function FileTextIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function KeyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function TerminalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'For Merchants', href: '#for-merchants' },
  { label: 'Security', href: '#security' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
]

const TRUST_BADGES = [
  { icon: ShieldIcon, label: 'Secure by Razorpay' },
  { icon: LockIcon, label: 'PCI DSS Compliant' },
  { icon: ShieldCheckIcon, label: 'Encrypted Payments' },
  { icon: UsersIcon, label: 'Buyer & Merchant Protection' },
]

const FEATURES = [
  { icon: MessageSquareIcon, title: 'Conversational Commerce', desc: 'Natural conversations that understand intent and convert.' },
  { icon: SparkleIcon, title: 'Smart Recommendations', desc: 'AI finds the best products for every buyer.' },
  { icon: ShieldCheckIcon, title: 'Secure Checkout', desc: 'Bounded actions with enterprise-grade security.' },
  { icon: TrendingUpIcon, title: 'Actionable Insights', desc: 'Track performance and grow smarter.' },
]

const STATS = [
  { icon: UsersIcon, value: '10K+', label: 'Merchants' },
  { icon: ArrowRightLeftIcon, value: '100M+', label: 'Transactions' },
  { icon: ShieldCheckIcon, value: '99.9%', label: 'Uptime' },
  { icon: CheckCircleIcon, value: 'Bank-grade', label: 'Security' },
]

const MERCHANT_BENEFITS = [
  { icon: StoreIcon, title: 'Live Catalog Sync', desc: 'Your inventory and pricing stay in sync with every agent conversation.' },
  { icon: SettingsIcon, title: 'Policy Controls', desc: 'Set bounded limits on what agents can discount, bundle, or approve.' },
  { icon: BarChartIcon, title: 'Merchant Dashboard', desc: 'See orders, revenue, and agent activity in one real-time view.' },
]

const SECURITY_POINTS = [
  { icon: LockIcon, title: 'PCI DSS Compliant', desc: 'Payment data is handled to industry-standard PCI DSS requirements.' },
  { icon: ShieldCheckIcon, title: 'Encrypted End-to-End', desc: 'All transactions are encrypted in transit and at rest via Razorpay.' },
  { icon: FileTextIcon, title: 'Full Audit Trail', desc: 'Every agent action is logged and explainable, for buyers and merchants.' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect your store', desc: 'Bring your catalog and set the boundaries your agent should operate within.' },
  { step: '02', title: 'Buyers chat naturally', desc: 'The agent understands intent, recommends products, and answers questions.' },
  { step: '03', title: 'Secure checkout', desc: 'Transactions complete end-to-end through Razorpay, within your set policies.' },
  { step: '04', title: 'Track & grow', desc: 'Review orders and insights on your merchant dashboard to keep improving.' },
]

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    desc: 'For merchants trying out agentic commerce.',
    features: ['Up to 100 orders/mo', 'Basic chat agent', 'Standard checkout', 'Community support'],
  },
  {
    name: 'Growth',
    price: '₹4,999',
    period: '/mo',
    desc: 'For growing stores that want full control.',
    features: ['Unlimited orders', 'Smart recommendations', 'Policy engine & audit trail', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large merchants with custom needs.',
    features: ['Dedicated infrastructure', 'Custom policy rules', 'SLA & onboarding support', 'Account manager'],
  },
]

const DOCS_LINKS = [
  { icon: TerminalIcon, title: 'Quickstart', desc: 'Get your store connected to an AI agent in minutes.' },
  { icon: KeyIcon, title: 'API Reference', desc: 'Endpoints for chat, checkout, orders, and audit trail.' },
  { icon: FileTextIcon, title: 'Policy Guide', desc: 'Learn how to configure bounded agent permissions.' },
]

export default function LandingPage({ onOpenAuth }) {
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur border-b border-transparent">
        <div className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
              <SparkleIcon className="w-5 h-5" />
            </span>
            <span className="font-semibold text-lg">
              Agentic <span className="text-indigo-600">Commerce</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-slate-900 transition">{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-sm font-medium border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-100 transition"
            >
              Log in
            </button>
            <button
              onClick={onOpenAuth}
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 transition"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <SparkleIcon className="w-3.5 h-3.5" />
            AI AGENTS FOR COMMERCE
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            AI agents that sell,<br />so <span className="text-indigo-600">you grow.</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8 max-w-lg">
            Power your business with intelligent AI agents that understand buyers, recommend the
            right products, and complete secure transactions end-to-end.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-5 py-3 transition"
            >
              Log in to Continue
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="border border-slate-300 hover:bg-slate-100 font-medium rounded-lg px-5 py-3 transition"
            >
              Book a Demo
            </button>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm text-slate-500">
                <b.icon className="w-4 h-4 text-indigo-500" />
                {b.label}
              </div>
            ))}
          </div>
        </div>

        <HeroCarousel />
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 pb-10 scroll-mt-24">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600">
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-sm text-slate-500 text-center lg:text-left">
            Trusted by 10K+ merchants and powered by
            <div className="font-semibold text-slate-900 text-base mt-1">Razorpay</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-100 text-indigo-600">
                  <s.icon className="w-5 h-5" />
                </span>
                <div>
                  <div className="font-bold text-lg leading-none">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Merchants */}
      <section id="for-merchants" className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold mb-3">Built for merchants</h2>
          <p className="text-slate-600">Everything you need to let AI agents sell on your behalf, without losing control.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MERCHANT_BENEFITS.map((m) => (
            <div key={m.title} className="bg-white border border-slate-200 rounded-2xl p-6">
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                <m.icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold mb-2">{m.title}</h3>
              <p className="text-sm text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 scroll-mt-24">
        <div className="bg-slate-900 text-white rounded-2xl p-8 lg:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold mb-3">Security you can trust</h2>
            <p className="text-slate-300">Every transaction is bounded, verified, and protected end-to-end.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SECURITY_POINTS.map((s) => (
              <div key={s.title} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 mb-4">
                  <s.icon className="w-5 h-5" />
                </span>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold mb-3">How it works</h2>
          <p className="text-slate-600">From connecting your store to closing the sale, in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((h) => (
            <div key={h.step} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-2xl font-extrabold text-indigo-200 mb-3">{h.step}</div>
              <h3 className="font-semibold mb-2">{h.title}</h3>
              <p className="text-sm text-slate-500">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold mb-3">Simple, transparent pricing</h2>
          <p className="text-slate-600">Start free, upgrade as your agentic storefront grows.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {PRICING_PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border ${
                p.highlighted
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl sm:-translate-y-2'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`font-semibold mb-1 ${p.highlighted ? 'text-white' : ''}`}>{p.name}</h3>
              <p className={`text-sm mb-4 ${p.highlighted ? 'text-indigo-100' : 'text-slate-500'}`}>{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className={`text-sm ${p.highlighted ? 'text-indigo-100' : 'text-slate-500'}`}>{p.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${p.highlighted ? 'text-indigo-50' : 'text-slate-600'}`}>
                    <CheckCircleIcon className={`w-4 h-4 shrink-0 ${p.highlighted ? 'text-white' : 'text-indigo-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onOpenAuth}
                className={`w-full rounded-lg py-2.5 text-sm font-medium transition ${
                  p.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {p.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Docs */}
      <section id="docs" className="max-w-7xl mx-auto px-6 lg:px-10 pb-20 scroll-mt-24">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold mb-3">Documentation</h2>
            <p className="text-slate-600">Everything developers and merchants need to build with Agentic Commerce.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {DOCS_LINKS.map((d) => (
              <a
                key={d.title}
                href="#docs"
                className="border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-2xl p-6 transition"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <d.icon className="w-5 h-5" />
                </span>
                <h3 className="font-semibold mb-2 flex items-center gap-1.5">
                  {d.title}
                  <ArrowRightIcon className="w-3.5 h-3.5 text-indigo-500" />
                </h3>
                <p className="text-sm text-slate-500">{d.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white">
              <SparkleIcon className="w-3.5 h-3.5" />
            </span>
            <span>© {new Date().getFullYear()} Agentic Commerce. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-slate-900 transition">{l.label}</a>
            ))}
          </div>
        </div>
      </footer>

      <DemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  )
}