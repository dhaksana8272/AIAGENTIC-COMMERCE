// import React, { useState } from 'react'
// import LandingPage from './components/LandingPage.jsx'
// import AuthModal from './components/AuthModal.jsx'
// import ChatWidget from './components/ChatWidget.jsx'
// import MerchantDashboard from './components/MerchantDashboard.jsx'

// export default function App() {
//   const [view, setView] = useState('landing') // 'landing' | 'buyer' | 'merchant'
//   const [authModalOpen, setAuthModalOpen] = useState(false)
//   const [user, setUser] = useState(null) // { id, name, email, role }
//   const [sessionId, setSessionId] = useState(null)

//   function handleAuthenticated(authedUser) {
//     setUser(authedUser)
//     setAuthModalOpen(false)
//     setSessionId(null) // resolved server-side via user_id on the first /chat call
//     setView(authedUser.role === 'buyer' ? 'buyer' : 'merchant')
//   }

//   function handleLogout() {
//     setView('landing')
//     setUser(null)
//     setSessionId(null)
//   }

//   if (view === 'landing') {
//     return (
//       <>
//         <LandingPage onOpenAuth={() => setAuthModalOpen(true)} />
//         <AuthModal
//           isOpen={authModalOpen}
//           onClose={() => setAuthModalOpen(false)}
//           onAuthenticated={handleAuthenticated}
//         />
//       </>
//     )
//   }

//   if (view === 'buyer') {
//     return (
//       <div className="min-h-screen bg-slate-950 text-slate-100">
//         <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-semibold">Agent Storefront</h1>
//             <p className="text-sm text-slate-400">Logged in as {user?.name} ({user?.email})</p>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
//           >
//             Log out
//           </button>
//         </header>
//         <main className="bg-slate-900 border-t border-slate-700 min-h-[calc(100vh-73px)] p-6">
//           <ChatWidget
//             sessionId={sessionId}
//             setSessionId={setSessionId}
//             buyerId={user?.id}
//           />
//         </main>
//       </div>
//     )
//   }

//   return <MerchantDashboard user={user} onLogout={handleLogout} />
// }


import React, { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import AuthModal from './components/AuthModal.jsx'
import BuyerShell from './components/buyer/BuyerShell.jsx'
import MerchantDashboard from './components/MerchantDashboard.jsx'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'buyer' | 'merchant'
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null) // { id, name, email, role }
  const [sessionId, setSessionId] = useState(null)

  function handleAuthenticated(authedUser) {
    setUser(authedUser)
    setAuthModalOpen(false)
    setSessionId(null) // resolved server-side via user_id on the first /chat call
    setView(authedUser.role === 'buyer' ? 'buyer' : 'merchant')
  }

  function handleLogout() {
    setView('landing')
    setUser(null)
    setSessionId(null)
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage onOpenAuth={() => setAuthModalOpen(true)} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      </>
    )
  }

  if (view === 'buyer') {
    return (
      <BuyerShell
        user={user}
        sessionId={sessionId}
        setSessionId={setSessionId}
        onLogout={handleLogout}
      />
    )
  }

  return <MerchantDashboard user={user} onLogout={handleLogout} />
}
