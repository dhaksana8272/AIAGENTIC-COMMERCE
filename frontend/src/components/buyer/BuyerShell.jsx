// import React, { useEffect, useRef, useState } from 'react'
// import api from '../../api.js'
// import Sidebar from './Sidebar.jsx'
// import Topbar from './Topbar.jsx'
// import ChatPanel from './ChatPanel.jsx'
// import CartPanel from './CartPanel.jsx'
// import OrderHistory from '../OrderHistory.jsx'

// function nowTime() {
//   return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// }

// const GREETING = { role: 'agent', text: "Hi! I'm your shopping assistant. Try: \"I want a blue hoodie\" or \"show me caps\".", time: nowTime() }
// const POLL_INTERVAL_MS = 5000
// const POLL_MAX_ATTEMPTS = 12 // ~1 minute of polling before we stop and just wait for the buyer to confirm manually

// export default function BuyerShell({ user, sessionId, setSessionId, onLogout }) {
//   const [page, setPage] = useState('chat')
//   const [messages, setMessages] = useState([GREETING])
//   const [loading, setLoading] = useState(false)
//   const [cart, setCart] = useState([])
//   const [checkoutState, setCheckoutState] = useState(null)
//   const [payLink, setPayLink] = useState(null)
//   const [pendingOrderId, setPendingOrderId] = useState(null)
//   const [awaitingManualConfirm, setAwaitingManualConfirm] = useState(false)
//   const [note, setNote] = useState('')
//   const [coupon, setCoupon] = useState(null)
//   const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
//   const pollRef = useRef(null)

//   const cartTotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)

//   function addOrMergeCart(sku, name, category, quantity, unitPrice) {
//     setCart((c) => {
//       const existing = c.find((i) => i.sku === sku)
//       if (existing) {
//         return c.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + quantity } : i))
//       }
//       return [...c, { sku, name, category, quantity, price_inr: unitPrice }]
//     })
//   }

//   async function sendMessage(text) {
//     if (!text.trim()) return
//     setMessages((m) => [...m, { role: 'buyer', text, time: nowTime() }])
//     setLoading(true)
//     try {
//       const res = await api.chat({ session_id: sessionId, user_id: user?.id, message: text })
//       setSessionId(res.session_id)
//       setMessages((m) => [...m, {
//         role: 'agent',
//         text: res.reply,
//         time: nowTime(),
//         products: res.products || null,
//         proposedAction: res.proposed_action || null,
//       }])

//       if (res.proposed_action?.action === 'add_to_cart') {
//         const { sku, quantity, amount_inr, name, category } = res.proposed_action
//         addOrMergeCart(sku, name || sku, category || 'other', quantity, amount_inr / quantity)
//       }
//     } catch (e) {
//       setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}`, time: nowTime() }])
//     } finally {
//       setLoading(false)
//     }
//   }

//   function addProductToCart(product) {
//     addOrMergeCart(product.sku, product.name, product.category, 1, product.price_inr)
//     setMessages((m) => [...m, {
//       role: 'agent',
//       text: `Added ${product.name} to your cart.`,
//       time: nowTime(),
//     }])
//   }

//   function clearChat() {
//     setMessages([GREETING])
//   }

//   function incrementItem(sku) {
//     setCart((c) => c.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + 1 } : i)))
//   }

//   function decrementItem(sku) {
//     setCart((c) => c.map((i) => (i.sku === sku ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)))
//   }

//   function removeItem(sku) {
//     setCart((c) => c.filter((i) => i.sku !== sku))
//   }

//   function stopPolling() {
//     if (pollRef.current) {
//       clearInterval(pollRef.current)
//       pollRef.current = null
//     }
//   }

//   function clearCart() {
//     setCart([])
//     setCheckoutState(null)
//     setPayLink(null)
//     setPendingOrderId(null)
//     setAwaitingManualConfirm(false)
//     setCoupon(null)
//     stopPolling()
//   }

//   async function applyCoupon(code, subtotal) {
//     if (!code.trim()) return
//     try {
//       const res = await api.validateCoupon({ code, subtotal_inr: subtotal })
//       setCoupon(res)
//     } catch (e) {
//       setCoupon({ valid: false, message: e.message })
//     }
//   }

//   async function proceedCheckout(finalTotal) {
//     setPayLink(null)
//     if (note.trim()) {
//       await sendMessage(`Order note: ${note.trim()}`)
//     }
//     try {
//       const res = await api.proposeCheckout({
//         session_id: sessionId,
//         amount_inr: finalTotal,
//         items: cart,
//       })
//       setCheckoutState(res)
//       if (res.allowed && !res.requires_confirmation) {
//         await doConfirm(res.audit_id)
//       }
//     } catch (e) {
//       setMessages((m) => [...m, { role: 'agent', text: `Checkout error: ${e.message}`, time: nowTime() }])
//     }
//   }

//   function finalizePaid() {
//     stopPolling()
//     setCart([])
//     setCheckoutState(null)
//     setPayLink(null)
//     setPendingOrderId(null)
//     setAwaitingManualConfirm(false)
//     setCoupon(null)
//     setNote('')
//     setHistoryRefreshKey((k) => k + 1)
//     setMessages((m) => [...m, { role: 'agent', text: 'Payment confirmed — thanks for your order! 🎉', time: nowTime() }])
//   }

//   function finalizeFailed(message) {
//     stopPolling()
//     // Cart, note, and coupon are deliberately kept intact — the payment
//     // method failed, not the order, so the buyer can retry immediately.
//     setCheckoutState(null)
//     setPayLink(null)
//     setPendingOrderId(null)
//     setAwaitingManualConfirm(false)
//     setMessages((m) => [...m, { role: 'agent', text: message, time: nowTime() }])
//   }

//   const AUTO_FAIL_MESSAGE =
//     "Payment wasn't completed. No money was captured. " +
//     "Your cart is still saved, so you can retry checkout whenever you're ready."

//   async function checkOrderOnce(orderId) {
//     try {
//       const res = await api.orderStatus(orderId)
//       if (res.status === 'paid') {
//         finalizePaid()
//         return true
//       }
//       if (res.status === 'failed') {
//         finalizeFailed(AUTO_FAIL_MESSAGE)
//         return true
//       }
//     } catch {
//       // transient — polling will retry
//     }
//     return false
//   }

//   function startPolling(orderId) {
//     stopPolling()
//     let attempts = 0
//     checkOrderOnce(orderId) // check right away in case it's already resolved
//     pollRef.current = setInterval(async () => {
//       attempts += 1
//       const resolved = await checkOrderOnce(orderId)
//       if (resolved) return
//       if (attempts >= POLL_MAX_ATTEMPTS) {
//         // Couldn't auto-detect the outcome after ~a minute (most likely no
//         // public webhook configured, so we can't be pushed the result) —
//         // this is the only case where we ask the buyer directly.
//         stopPolling()
//         setAwaitingManualConfirm(true)
//       }
//     }, POLL_INTERVAL_MS)
//   }

//   async function doConfirm(auditId) {
//     try {
//       const res = await api.confirmCheckout({ session_id: sessionId, audit_id: auditId })
//       setPayLink(res.payment_link)
//       setPendingOrderId(res.order_id)
//       setAwaitingManualConfirm(false)
//       setMessages((m) => [...m, {
//         role: 'agent',
//         text: `Payment link created (via ${res.path_used}). Pay with any Razorpay test card to complete the order.`,
//         time: nowTime(),
//       }])
//       startPolling(res.order_id)
//     } catch (e) {
//       setMessages((m) => [...m, { role: 'agent', text: `Couldn't create the payment link: ${e.message}`, time: nowTime() }])
//     }
//   }

//   async function markPaymentPaid() {
//     // NOTE: this does NOT mark the order paid on the buyer's say-so. It
//     // asks the backend to verify directly with Razorpay (same check
//     // /order-status performs), and only finalizes if Razorpay actually
//     // confirms it. The Razorpay webhook remains the primary source of
//     // truth — this is a manual nudge for that same verification, not a
//     // bypass of it.
//     if (!pendingOrderId) return
//     try {
//       const res = await api.reportPaymentResult({ order_id: pendingOrderId, success: true })
//       if (res.status === 'paid') {
//         finalizePaid()
//       } else if (res.status === 'failed') {
//         finalizeFailed(res.message)
//       } else {
//         setMessages((m) => [...m, { role: 'agent', text: res.message, time: nowTime() }])
//         setAwaitingManualConfirm(false)
//         if (!pollRef.current) startPolling(pendingOrderId)
//       }
//     } catch (e) {
//       setMessages((m) => [...m, { role: 'agent', text: `Couldn't verify payment: ${e.message}`, time: nowTime() }])
//     }
//   }

//   async function markPaymentFailed() {
//     if (!pendingOrderId) return
//     try {
//       const res = await api.reportPaymentResult({ order_id: pendingOrderId, success: false })
//       finalizeFailed(res.message)
//     } catch (e) {
//       finalizeFailed(`Payment failed. Your cart is still saved — you can try again. (${e.message})`)
//     }
//   }

//   async function simulateDecline() {
//     try {
//       const res = await api.simulateDecline({ session_id: sessionId, amount_inr: cartTotal })
//       setMessages((m) => [...m, { role: 'agent', text: res.message, time: nowTime() }])
//     } catch (e) {
//       setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}`, time: nowTime() }])
//     }
//   }

//   useEffect(() => stopPolling, [])

//   const cartPanelProps = {
//     cart,
//     onIncrement: incrementItem,
//     onDecrement: decrementItem,
//     onRemove: removeItem,
//     onClearCart: clearCart,
//     note,
//     setNote,
//     coupon,
//     onApplyCoupon: applyCoupon,
//     checkoutState,
//     payLink,
//     pendingOrderId,
//     awaitingManualConfirm,
//     onProceedCheckout: proceedCheckout,
//     onApproveConfirm: () => doConfirm(checkoutState.audit_id),
//     onCancelConfirm: () => setCheckoutState(null),
//     onSimulateDecline: simulateDecline,
//     onMarkPaid: markPaymentPaid,
//     onMarkFailed: markPaymentFailed,
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       <Sidebar page={page} setPage={setPage} cartCount={cart.length} />
//       <div className="flex-1 min-w-0">
//         <Topbar user={user} onLogout={onLogout} />
//         <main className="px-6 pb-6">
//           {page === 'chat' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2">
//                 <ChatPanel
//                   messages={messages}
//                   loading={loading}
//                   onSend={sendMessage}
//                   onClearChat={clearChat}
//                   onAddProductToCart={addProductToCart}
//                   onCheckoutNow={() => proceedCheckout(cartTotal)}
//                 />
//               </div>
//               <CartPanel {...cartPanelProps} />
//             </div>
//           )}

//           {page === 'cart' && (
//             <div className="max-w-md mx-auto">
//               <CartPanel {...cartPanelProps} />
//             </div>
//           )}

//           {page === 'orders' && (
//             <div className="max-w-3xl mx-auto">
//               <OrderHistory userId={user?.id} refreshKey={historyRefreshKey} />
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   )
// }


import React, { useEffect, useRef, useState } from 'react'
import api from '../../api.js'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import ChatPanel from './ChatPanel.jsx'
import CartPanel from './CartPanel.jsx'
import OrderHistory from '../OrderHistory.jsx'

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const GREETING = { role: 'agent', text: "Hi! I'm your shopping assistant. Try: \"I want a blue hoodie\" or \"show me caps\".", time: nowTime() }
const POLL_INTERVAL_MS = 5000
const POLL_MAX_ATTEMPTS = 12 // ~1 minute of polling before we stop and just wait for the buyer to confirm manually

export default function BuyerShell({ user, sessionId, setSessionId, onLogout }) {
  const [page, setPage] = useState('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState([])
  const [checkoutState, setCheckoutState] = useState(null)
  const [payLink, setPayLink] = useState(null)
  const [pendingOrderId, setPendingOrderId] = useState(null)
  const [awaitingManualConfirm, setAwaitingManualConfirm] = useState(false)
  const [note, setNote] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const pollRef = useRef(null)

  const cartTotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)

  function addOrMergeCart(sku, name, category, quantity, unitPrice) {
    setCart((c) => {
      const existing = c.find((i) => i.sku === sku)
      if (existing) {
        return c.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...c, { sku, name, category, quantity, price_inr: unitPrice }]
    })
  }

  async function sendMessage(text) {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'buyer', text, time: nowTime() }])
    setLoading(true)
    try {
      const res = await api.chat({ session_id: sessionId, user_id: user?.id, message: text })
      setSessionId(res.session_id)
      setMessages((m) => [...m, {
        role: 'agent',
        text: res.reply,
        time: nowTime(),
        products: res.products || null,
        proposedAction: res.proposed_action || null,
      }])

      if (res.proposed_action?.action === 'add_to_cart') {
        const { sku, quantity, amount_inr, name, category } = res.proposed_action
        addOrMergeCart(sku, name || sku, category || 'other', quantity, amount_inr / quantity)
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}`, time: nowTime() }])
    } finally {
      setLoading(false)
    }
  }

  function addProductToCart(product) {
    addOrMergeCart(product.sku, product.name, product.category, 1, product.price_inr)
    setMessages((m) => [...m, {
      role: 'agent',
      text: `Added ${product.name} to your cart.`,
      time: nowTime(),
    }])
  }

  function clearChat() {
    setMessages([GREETING])
  }

  function incrementItem(sku) {
    setCart((c) => c.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + 1 } : i)))
  }

  function decrementItem(sku) {
    setCart((c) => c.map((i) => (i.sku === sku ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)))
  }

  function removeItem(sku) {
    setCart((c) => c.filter((i) => i.sku !== sku))
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function clearCart() {
    setCart([])
    setCheckoutState(null)
    setPayLink(null)
    setPendingOrderId(null)
    setAwaitingManualConfirm(false)
    setCoupon(null)
    stopPolling()
  }

  async function applyCoupon(code, subtotal) {
    if (!code.trim()) return
    try {
      const res = await api.validateCoupon({ code, subtotal_inr: subtotal })
      setCoupon(res)
    } catch (e) {
      setCoupon({ valid: false, message: e.message })
    }
  }

  async function proceedCheckout(finalTotal) {
    setPayLink(null)
    if (note.trim()) {
      await sendMessage(`Order note: ${note.trim()}`)
    }
    try {
      const res = await api.proposeCheckout({
        session_id: sessionId,
        amount_inr: finalTotal,
        items: cart,
      })
      setCheckoutState(res)
      if (res.allowed && !res.requires_confirmation) {
        await doConfirm(res.audit_id)
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Checkout error: ${e.message}`, time: nowTime() }])
    }
  }

  function finalizePaid() {
    stopPolling()
    setCart([])
    setCheckoutState(null)
    setPayLink(null)
    setPendingOrderId(null)
    setAwaitingManualConfirm(false)
    setCoupon(null)
    setNote('')
    setHistoryRefreshKey((k) => k + 1)
    setMessages((m) => [...m, { role: 'agent', text: 'Payment confirmed — thanks for your order! 🎉', time: nowTime() }])
  }

  function finalizeFailed(message) {
    stopPolling()
    // Cart, note, and coupon are deliberately kept intact — the payment
    // method failed, not the order, so the buyer can retry immediately.
    setCheckoutState(null)
    setPayLink(null)
    setPendingOrderId(null)
    setAwaitingManualConfirm(false)
    setMessages((m) => [...m, { role: 'agent', text: message, time: nowTime() }])
  }

  const AUTO_FAIL_MESSAGE =
    "Payment wasn't completed. No money was captured. " +
    "Your cart is still saved, so you can retry checkout whenever you're ready."

  async function checkOrderOnce(orderId) {
    try {
      const res = await api.orderStatus(orderId)
      if (res.status === 'paid') {
        finalizePaid()
        return true
      }
      if (res.status === 'failed') {
        finalizeFailed(AUTO_FAIL_MESSAGE)
        return true
      }
    } catch {
      // transient — polling will retry
    }
    return false
  }

  function startPolling(orderId) {
    stopPolling()
    let attempts = 0
    checkOrderOnce(orderId) // check right away in case it's already resolved
    pollRef.current = setInterval(async () => {
      attempts += 1
      const resolved = await checkOrderOnce(orderId)
      if (resolved) return
      if (attempts >= POLL_MAX_ATTEMPTS) {
        // Couldn't auto-detect the outcome after ~a minute (most likely no
        // public webhook configured, so we can't be pushed the result) —
        // this is the only case where we ask the buyer directly.
        stopPolling()
        setAwaitingManualConfirm(true)
      }
    }, POLL_INTERVAL_MS)
  }

  async function doConfirm(auditId) {
    try {
      const res = await api.confirmCheckout({ session_id: sessionId, audit_id: auditId })
      setPayLink(res.payment_link)
      setPendingOrderId(res.order_id)
      setAwaitingManualConfirm(false)
      setMessages((m) => [...m, {
        role: 'agent',
        text: `Payment link created (via ${res.path_used}). Pay with any Razorpay test card to complete the order.`,
        time: nowTime(),
      }])
      startPolling(res.order_id)
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Couldn't create the payment link: ${e.message}`, time: nowTime() }])
    }
  }

  async function markPaymentPaid() {
    // NOTE: this does NOT mark the order paid on the buyer's say-so. It
    // asks the backend to verify directly with Razorpay (same check
    // /order-status performs), and only finalizes if Razorpay actually
    // confirms it. The Razorpay webhook remains the primary source of
    // truth — this is a manual nudge for that same verification, not a
    // bypass of it.
    if (!pendingOrderId) return
    try {
      const res = await api.reportPaymentResult({ order_id: pendingOrderId, success: true })
      if (res.status === 'paid') {
        finalizePaid()
      } else if (res.status === 'failed') {
        finalizeFailed(res.message)
      } else {
        setMessages((m) => [...m, { role: 'agent', text: res.message, time: nowTime() }])
        setAwaitingManualConfirm(false)
        if (!pollRef.current) startPolling(pendingOrderId)
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Couldn't verify payment: ${e.message}`, time: nowTime() }])
    }
  }

  async function markPaymentFailed() {
    if (!pendingOrderId) return
    try {
      const res = await api.reportPaymentResult({ order_id: pendingOrderId, success: false })
      finalizeFailed(res.message)
    } catch (e) {
      finalizeFailed(`Payment failed. Your cart is still saved — you can try again. (${e.message})`)
    }
  }

  async function simulateDecline() {
    try {
      const res = await api.simulateDecline({ session_id: sessionId, amount_inr: cartTotal })
      setMessages((m) => [...m, { role: 'agent', text: res.message, time: nowTime() }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'agent', text: `Error: ${e.message}`, time: nowTime() }])
    }
  }

  useEffect(() => stopPolling, [])

  const cartPanelProps = {
    cart,
    onIncrement: incrementItem,
    onDecrement: decrementItem,
    onRemove: removeItem,
    onClearCart: clearCart,
    note,
    setNote,
    coupon,
    onApplyCoupon: applyCoupon,
    checkoutState,
    payLink,
    pendingOrderId,
    awaitingManualConfirm,
    onProceedCheckout: proceedCheckout,
    onApproveConfirm: () => doConfirm(checkoutState.audit_id),
    onCancelConfirm: () => setCheckoutState(null),
    onSimulateDecline: simulateDecline,
    onMarkPaid: markPaymentPaid,
    onMarkFailed: markPaymentFailed,
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar page={page} setPage={setPage} cartCount={cart.length} collapsed={sidebarCollapsed} />
      <div className="flex-1 min-w-0">
        <Topbar user={user} onLogout={onLogout} onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />
        <main className="px-6 pt-6 pb-6">
          {page === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <ChatPanel
                  messages={messages}
                  loading={loading}
                  onSend={sendMessage}
                  onClearChat={clearChat}
                  onAddProductToCart={addProductToCart}
                  onCheckoutNow={() => proceedCheckout(cartTotal)}
                />
              </div>
              <div className="lg:sticky lg:top-[88px]">
                <CartPanel {...cartPanelProps} />
              </div>
            </div>
          )}

          {page === 'cart' && (
            <div className="max-w-md mx-auto">
              <CartPanel {...cartPanelProps} />
            </div>
          )}

          {page === 'orders' && (
            <div className="max-w-3xl mx-auto">
              <OrderHistory userId={user?.id} refreshKey={historyRefreshKey} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}