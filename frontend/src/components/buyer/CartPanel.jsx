// import React, { useState } from 'react'
// import { ShoppingCart, Trash2, Plus, Minus, PlusCircle, Ticket, Lock, ShieldCheck } from 'lucide-react'

// const CATEGORY_GRADIENT = {
//   apparel: 'from-indigo-200 to-blue-100',
//   accessories: 'from-amber-100 to-orange-100',
// }
// const DEFAULT_GRADIENT = 'from-slate-100 to-slate-200'

// function sizeFromName(name) {
//   const m = /-\s*([A-Z]{1,4})$/.exec(name || '')
//   return m ? m[1] : 'One Size'
// }

// export default function CartPanel({
//   cart,
//   onIncrement,
//   onDecrement,
//   onRemove,
//   onClearCart,
//   note,
//   setNote,
//   coupon,
//   onApplyCoupon,
//   checkoutState,
//   payLink,
//   pendingOrderId,
//   awaitingManualConfirm,
//   onProceedCheckout,
//   onApproveConfirm,
//   onCancelConfirm,
//   onSimulateDecline,
//   onMarkPaid,
//   onMarkFailed,
// }) {
//   const [noteOpen, setNoteOpen] = useState(false)
//   const [couponInput, setCouponInput] = useState('')

//   const subtotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)
//   const discountInr = coupon?.valid ? Math.min(coupon.discount_inr, subtotal) : 0
//   const total = Math.max(subtotal - discountInr, 0)

//   return (
//     <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-[75vh] overflow-y-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="font-semibold text-slate-900 flex items-center gap-2">
//           <ShoppingCart className="w-4.5 h-4.5 text-indigo-600" /> Your Cart
//           <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
//             {cart.length}
//           </span>
//         </h2>
//         {cart.length > 0 && (
//           <button onClick={onClearCart} className="text-xs font-medium text-red-500 hover:text-red-600">
//             Clear Cart
//           </button>
//         )}
//       </div>

//       {cart.length === 0 && !payLink && (
//         <p className="text-sm text-slate-400 flex-1">Empty — chat with the agent to add items.</p>
//       )}

//       {cart.length > 0 && (
//         <>
//           <ul className="space-y-4 mb-4">
//             {cart.map((item) => {
//               const gradient = CATEGORY_GRADIENT[item.category] || DEFAULT_GRADIENT
//               return (
//                 <li key={item.sku} className="flex gap-3">
//                   <span className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shrink-0`} />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
//                       <button onClick={() => onRemove(item.sku)} aria-label={`Remove ${item.name}`} className="text-slate-300 hover:text-red-500 transition shrink-0">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                     <p className="text-xs text-slate-400 mb-1.5">Size: {sizeFromName(item.name)}</p>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-1.5 py-0.5">
//                         <button onClick={() => onDecrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Decrease quantity">
//                           <Minus className="w-3.5 h-3.5" />
//                         </button>
//                         <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
//                         <button onClick={() => onIncrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Increase quantity">
//                           <Plus className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                       <span className="text-sm font-semibold text-slate-900">₹{(item.price_inr * item.quantity).toLocaleString('en-IN')}</span>
//                     </div>
//                   </div>
//                 </li>
//               )
//             })}
//           </ul>

//           <button
//             onClick={() => setNoteOpen((v) => !v)}
//             className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2.5 mb-3 hover:bg-slate-50 transition w-full"
//           >
//             <PlusCircle className="w-4 h-4 text-slate-400" /> Add a note for your order
//           </button>
//           {noteOpen && (
//             <textarea
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               placeholder="e.g. leave at the door, gift wrap, etc."
//               rows={2}
//               className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 mb-3 resize-none"
//             />
//           )}

//           <div className="flex items-center gap-2 mb-4">
//             <div className="relative flex-1">
//               <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 value={couponInput}
//                 onChange={(e) => setCouponInput(e.target.value)}
//                 placeholder="Apply coupon code"
//                 className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
//               />
//             </div>
//             <button
//               onClick={() => onApplyCoupon(couponInput, subtotal)}
//               className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-1"
//             >
//               Apply
//             </button>
//           </div>
//           {coupon && (
//             <p className={`text-xs mb-3 -mt-2 ${coupon.valid ? 'text-emerald-600' : 'text-red-500'}`}>{coupon.message}</p>
//           )}

//           <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm mb-4">
//             <div className="flex justify-between text-slate-600">
//               <span>Subtotal</span>
//               <span>₹{subtotal.toLocaleString('en-IN')}</span>
//             </div>
//             {discountInr > 0 && (
//               <div className="flex justify-between text-emerald-600">
//                 <span>Discount</span>
//                 <span>-₹{discountInr.toLocaleString('en-IN')}</span>
//               </div>
//             )}
//             <div className="flex justify-between text-slate-600">
//               <span>Delivery</span>
//               <span className="text-emerald-600 font-medium">FREE</span>
//             </div>
//             <div className="flex justify-between font-semibold text-slate-900 text-base pt-1.5 border-t border-slate-100 mt-1.5">
//               <span>Total</span>
//               <span>₹{total.toLocaleString('en-IN')}</span>
//             </div>
//           </div>

//           {checkoutState && !checkoutState.allowed && (
//             <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 mb-3">
//               <p className="font-medium mb-1">Blocked by policy</p>
//               <p>{checkoutState.reason}</p>
//             </div>
//           )}

//           {checkoutState && checkoutState.allowed && checkoutState.requires_confirmation && (
//             <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700 mb-3 space-y-2">
//               <p className="font-medium">Confirmation required</p>
//               <p>{checkoutState.reason}</p>
//               <div className="flex gap-2">
//                 <button onClick={onApproveConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-sm font-medium transition">
//                   Approve
//                 </button>
//                 <button onClick={onCancelConfirm} className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 text-sm font-medium hover:bg-slate-50 transition">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {!checkoutState?.requires_confirmation && !pendingOrderId && (
//             <button
//               onClick={() => onProceedCheckout(total)}
//               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-3 transition"
//             >
//               <Lock className="w-4 h-4" /> Proceed to Checkout
//             </button>
//           )}

//           <button
//             onClick={onSimulateDecline}
//             className="w-full mt-3 text-[11px] text-slate-400 hover:text-slate-600 transition"
//           >
//             Simulate a failed / declined payment (demo)
//           </button>
//         </>
//       )}

//       {/* Rendered independently of cart state — a successful checkout clears
//           the cart, but the payment link the buyer needs to actually pay
//           must keep showing regardless. */}
//       {payLink && (
//         <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm mb-3 mt-1">
//           <p className="font-medium text-emerald-700 mb-1">Payment link ready</p>
//           <a href={payLink} target="_blank" rel="noreferrer" className="text-emerald-600 underline break-all text-xs">
//             {payLink}
//           </a>
//           {!awaitingManualConfirm && (
//             <p className="text-xs text-emerald-600 mt-2">We'll confirm automatically once it's complete.</p>
//           )}
//           {awaitingManualConfirm && pendingOrderId && (
//             <div className="mt-3 pt-3 border-t border-emerald-100">
//               <p className="text-xs text-amber-700 mb-2">
//                 We couldn't confirm this automatically — could you let us know what happened?
//               </p>
//               <div className="flex gap-2">
//                 <button onClick={onMarkPaid} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-xs font-medium transition">
//                   ✅ Paid successfully
//                 </button>
//                 <button onClick={onMarkFailed} className="flex-1 bg-white border border-red-200 text-red-600 rounded-lg py-1.5 text-xs font-medium hover:bg-red-50 transition">
//                   ❌ It failed
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {(cart.length > 0 || payLink) && (
//         <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
//           <ShieldCheck className="w-3.5 h-3.5" /> Secure payments powered by Razorpay
//         </p>
//       )}
//     </div>
//   )
// }


// import React, { useState } from 'react'
// import { ShoppingCart, Trash2, Plus, Minus, PlusCircle, Ticket, Lock, ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

// const CATEGORY_GRADIENT = {
//   apparel: 'from-indigo-200 to-blue-100',
//   accessories: 'from-amber-100 to-orange-100',
// }
// const DEFAULT_GRADIENT = 'from-slate-100 to-slate-200'

// function sizeFromName(name) {
//   const m = /-\s*([A-Z]{1,4})$/.exec(name || '')
//   return m ? m[1] : 'One Size'
// }

// export default function CartPanel({
//   cart,
//   onIncrement,
//   onDecrement,
//   onRemove,
//   onClearCart,
//   note,
//   setNote,
//   coupon,
//   onApplyCoupon,
//   checkoutState,
//   paymentStatus,
//   onDismissPaymentStatus,
//   onProceedCheckout,
//   onApproveConfirm,
//   onCancelConfirm,
//   onSimulateDecline,
// }) {
//   const [noteOpen, setNoteOpen] = useState(false)
//   const [couponInput, setCouponInput] = useState('')

//   const subtotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)
//   const discountInr = coupon?.valid ? Math.min(coupon.discount_inr, subtotal) : 0
//   const total = Math.max(subtotal - discountInr, 0)

//   return (
//     <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-[75vh] overflow-y-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="font-semibold text-slate-900 flex items-center gap-2">
//           <ShoppingCart className="w-4.5 h-4.5 text-indigo-600" /> Your Cart
//           <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
//             {cart.length}
//           </span>
//         </h2>
//         {cart.length > 0 && (
//           <button onClick={onClearCart} className="text-xs font-medium text-red-500 hover:text-red-600">
//             Clear Cart
//           </button>
//         )}
//       </div>

//       {cart.length === 0 && !paymentStatus && (
//         <p className="text-sm text-slate-400 flex-1">Empty — chat with the agent to add items.</p>
//       )}

//       {cart.length > 0 && (
//         <>
//           <ul className="space-y-4 mb-4">
//             {cart.map((item) => {
//               const gradient = CATEGORY_GRADIENT[item.category] || DEFAULT_GRADIENT
//               return (
//                 <li key={item.sku} className="flex gap-3">
//                   <span className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shrink-0`} />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
//                       <button onClick={() => onRemove(item.sku)} aria-label={`Remove ${item.name}`} className="text-slate-300 hover:text-red-500 transition shrink-0">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                     <p className="text-xs text-slate-400 mb-1.5">Size: {sizeFromName(item.name)}</p>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-1.5 py-0.5">
//                         <button onClick={() => onDecrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Decrease quantity">
//                           <Minus className="w-3.5 h-3.5" />
//                         </button>
//                         <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
//                         <button onClick={() => onIncrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Increase quantity">
//                           <Plus className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                       <span className="text-sm font-semibold text-slate-900">₹{(item.price_inr * item.quantity).toLocaleString('en-IN')}</span>
//                     </div>
//                   </div>
//                 </li>
//               )
//             })}
//           </ul>

//           <button
//             onClick={() => setNoteOpen((v) => !v)}
//             className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2.5 mb-3 hover:bg-slate-50 transition w-full"
//           >
//             <PlusCircle className="w-4 h-4 text-slate-400" /> Add a note for your order
//           </button>
//           {noteOpen && (
//             <textarea
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               placeholder="e.g. leave at the door, gift wrap, etc."
//               rows={2}
//               className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 mb-3 resize-none"
//             />
//           )}

//           <div className="flex items-center gap-2 mb-4">
//             <div className="relative flex-1">
//               <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 value={couponInput}
//                 onChange={(e) => setCouponInput(e.target.value)}
//                 placeholder="Apply coupon code"
//                 className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
//               />
//             </div>
//             <button
//               onClick={() => onApplyCoupon(couponInput, subtotal)}
//               className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-1"
//             >
//               Apply
//             </button>
//           </div>
//           {coupon && (
//             <p className={`text-xs mb-3 -mt-2 ${coupon.valid ? 'text-emerald-600' : 'text-red-500'}`}>{coupon.message}</p>
//           )}

//           <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm mb-4">
//             <div className="flex justify-between text-slate-600">
//               <span>Subtotal</span>
//               <span>₹{subtotal.toLocaleString('en-IN')}</span>
//             </div>
//             {discountInr > 0 && (
//               <div className="flex justify-between text-emerald-600">
//                 <span>Discount</span>
//                 <span>-₹{discountInr.toLocaleString('en-IN')}</span>
//               </div>
//             )}
//             <div className="flex justify-between text-slate-600">
//               <span>Delivery</span>
//               <span className="text-emerald-600 font-medium">FREE</span>
//             </div>
//             <div className="flex justify-between font-semibold text-slate-900 text-base pt-1.5 border-t border-slate-100 mt-1.5">
//               <span>Total</span>
//               <span>₹{total.toLocaleString('en-IN')}</span>
//             </div>
//           </div>

//           {checkoutState && !checkoutState.allowed && (
//             <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 mb-3">
//               <p className="font-medium mb-1">Blocked by policy</p>
//               <p>{checkoutState.reason}</p>
//             </div>
//           )}

//           {checkoutState && checkoutState.allowed && checkoutState.requires_confirmation && (
//             <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700 mb-3 space-y-2">
//               <p className="font-medium">Confirmation required</p>
//               <p>{checkoutState.reason}</p>
//               <div className="flex gap-2">
//                 <button onClick={onApproveConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-sm font-medium transition">
//                   Approve
//                 </button>
//                 <button onClick={onCancelConfirm} className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 text-sm font-medium hover:bg-slate-50 transition">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {!checkoutState?.requires_confirmation && (
//             <button
//               onClick={() => onProceedCheckout(total)}
//               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-3 transition"
//             >
//               <Lock className="w-4 h-4" /> Proceed to Checkout
//             </button>
//           )}

//           <button
//             onClick={onSimulateDecline}
//             className="w-full mt-3 text-[11px] text-slate-400 hover:text-slate-600 transition"
//           >
//             Simulate a failed / declined payment (demo)
//           </button>
//         </>
//       )}

//       {/* Rendered independently of cart state — a successful checkout clears
//           the cart, but the buyer still needs to see where their payment
//           stands (awaiting payment / completed / failed) regardless. */}
//       {paymentStatus && (
//         <div className="mb-3 mt-1">
//           {paymentStatus.status === 'created' && (
//             <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
//               <p className="font-medium text-amber-700 mb-1 flex items-center gap-1.5">
//                 <Loader2 className="w-4 h-4 animate-spin" /> Waiting for payment…
//               </p>
//               <p className="text-amber-700/80 text-xs mb-2">
//                 Complete the payment using the link below. This updates automatically once it's confirmed.
//               </p>
//               {paymentStatus.link && (
//                 <a
//                   href={paymentStatus.link}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="inline-block text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg px-3 py-1.5 transition"
//                 >
//                   Open payment link
//                 </a>
//               )}
//             </div>
//           )}

//           {paymentStatus.status === 'paid' && (
//             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm">
//               <p className="font-medium text-emerald-700 mb-1 flex items-center gap-1.5">
//                 <CheckCircle2 className="w-4 h-4" /> Payment completed
//               </p>
//               <p className="text-emerald-700/80 text-xs mb-2">
//                 Your order{paymentStatus.amount ? ` for ₹${Number(paymentStatus.amount).toLocaleString('en-IN')}` : ''} is confirmed. You can track it under My Orders.
//               </p>
//               <button
//                 onClick={onDismissPaymentStatus}
//                 className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )}

//           {(paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') && (
//             <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
//               <p className="font-medium text-red-700 mb-1 flex items-center gap-1.5">
//                 <XCircle className="w-4 h-4" /> Payment failed
//               </p>
//               <p className="text-red-700/80 text-xs mb-2">
//                 That payment wasn't completed. No charge was made — you can try again whenever you're ready.
//               </p>
//               <button
//                 onClick={onDismissPaymentStatus}
//                 className="text-xs font-medium text-red-700 hover:text-red-800 underline"
//               >
//                 Dismiss
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {(cart.length > 0 || paymentStatus) && (
//         <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
//           <ShieldCheck className="w-3.5 h-3.5" /> Secure payments powered by Razorpay
//         </p>
//       )}
//     </div>
//   )
// }



import React, { useState } from 'react'
import { ShoppingCart, Trash2, Plus, Minus, PlusCircle, Ticket, Lock, ShieldCheck } from 'lucide-react'

const CATEGORY_GRADIENT = {
  apparel: 'from-indigo-200 to-blue-100',
  accessories: 'from-amber-100 to-orange-100',
}
const DEFAULT_GRADIENT = 'from-slate-100 to-slate-200'

function sizeFromName(name) {
  const m = /-\s*([A-Z]{1,4})$/.exec(name || '')
  return m ? m[1] : 'One Size'
}

export default function CartPanel({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  note,
  setNote,
  coupon,
  onApplyCoupon,
  checkoutState,
  payLink,
  pendingOrderId,
  awaitingManualConfirm,
  onProceedCheckout,
  onApproveConfirm,
  onCancelConfirm,
  onSimulateDecline,
  onMarkPaid,
  onMarkFailed,
}) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [couponInput, setCouponInput] = useState('')

  const subtotal = cart.reduce((sum, i) => sum + i.price_inr * i.quantity, 0)
  const discountInr = coupon?.valid ? Math.min(coupon.discount_inr, subtotal) : 0
  const total = Math.max(subtotal - discountInr, 0)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-[75vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-4.5 h-4.5 text-indigo-600" /> Your Cart
          <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {cart.length}
          </span>
        </h2>
        {cart.length > 0 && (
          <button onClick={onClearCart} className="text-xs font-medium text-red-500 hover:text-red-600">
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 && !payLink && (
        <p className="text-sm text-slate-400 flex-1">Empty — chat with the agent to add items.</p>
      )}

      {cart.length > 0 && (
        <>
          <ul className="space-y-4 mb-4">
            {cart.map((item) => {
              const gradient = CATEGORY_GRADIENT[item.category] || DEFAULT_GRADIENT
              return (
                <li key={item.sku} className="flex gap-3">
                  <span className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                      <button onClick={() => onRemove(item.sku)} aria-label={`Remove ${item.name}`} className="text-slate-300 hover:text-red-500 transition shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-1.5">Size: {sizeFromName(item.name)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-1.5 py-0.5">
                        <button onClick={() => onDecrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Decrease quantity">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onIncrement(item.sku)} className="text-slate-500 hover:text-indigo-600" aria-label="Increase quantity">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">₹{(item.price_inr * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <button
            onClick={() => setNoteOpen((v) => !v)}
            className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2.5 mb-3 hover:bg-slate-50 transition w-full"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" /> Add a note for your order
          </button>
          {noteOpen && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. leave at the door, gift wrap, etc."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 mb-3 resize-none"
            />
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Apply coupon code"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={() => onApplyCoupon(couponInput, subtotal)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-1"
            >
              Apply
            </button>
          </div>
          {coupon && (
            <p className={`text-xs mb-3 -mt-2 ${coupon.valid ? 'text-emerald-600' : 'text-red-500'}`}>{coupon.message}</p>
          )}

          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm mb-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountInr > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{discountInr.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 text-base pt-1.5 border-t border-slate-100 mt-1.5">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {checkoutState && !checkoutState.allowed && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 mb-3">
              <p className="font-medium mb-1">Blocked by policy</p>
              <p>{checkoutState.reason}</p>
            </div>
          )}

          {checkoutState && checkoutState.allowed && checkoutState.requires_confirmation && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700 mb-3 space-y-2">
              <p className="font-medium">Confirmation required</p>
              <p>{checkoutState.reason}</p>
              <div className="flex gap-2">
                <button onClick={onApproveConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-sm font-medium transition">
                  Approve
                </button>
                <button onClick={onCancelConfirm} className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 text-sm font-medium hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!checkoutState?.requires_confirmation && !pendingOrderId && (
            <button
              onClick={() => onProceedCheckout(total)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-3 transition"
            >
              <Lock className="w-4 h-4" /> Proceed to Checkout
            </button>
          )}

          <button
            onClick={onSimulateDecline}
            className="w-full mt-3 text-[11px] text-slate-400 hover:text-slate-600 transition"
          >
            Simulate a failed / declined payment (demo)
          </button>
        </>
      )}

      {/* Rendered independently of cart state — a successful checkout clears
          the cart, but the payment link the buyer needs to actually pay
          must keep showing regardless. */}
      {payLink && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm mb-3 mt-1">
          <p className="font-medium text-emerald-700 mb-1">Payment link ready</p>
          <a href={payLink} target="_blank" rel="noreferrer" className="text-emerald-600 underline break-all text-xs">
            {payLink}
          </a>
          {!awaitingManualConfirm && (
            <p className="text-xs text-emerald-600 mt-2">We'll confirm automatically once it's complete.</p>
          )}
          {awaitingManualConfirm && pendingOrderId && (
            <div className="mt-3 pt-3 border-t border-emerald-100">
              <p className="text-xs text-amber-700 mb-2">
                We couldn't confirm this automatically — let us know what happened and we'll double-check with Razorpay directly.
              </p>
              <div className="flex gap-2">
                <button onClick={onMarkPaid} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-xs font-medium transition">
                  ✅ I completed payment
                </button>
                <button onClick={onMarkFailed} className="flex-1 bg-white border border-red-200 text-red-600 rounded-lg py-1.5 text-xs font-medium hover:bg-red-50 transition">
                  ❌ It failed
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Orders are only marked paid once verified with Razorpay — your order won't be confirmed just because a button was clicked.
              </p>
            </div>
          )}
        </div>
      )}

      {(cart.length > 0 || payLink) && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure payments powered by Razorpay
        </p>
      )}
    </div>
  )
}