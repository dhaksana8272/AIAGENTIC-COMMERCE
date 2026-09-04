// import React, { useState } from 'react'
// import Sidebar from './merchant/Sidebar.jsx'
// import Topbar from './merchant/Topbar.jsx'
// import DashboardHome from './merchant/DashboardHome.jsx'
// import ProductsPage from './merchant/ProductsPage.jsx'
// import OrdersPage from './merchant/OrdersPage.jsx'
// import CustomersPage from './merchant/CustomersPage.jsx'
// import AIAgentPage from './merchant/AIAgentPage.jsx'
// import AnalyticsPage from './merchant/AnalyticsPage.jsx'
// import DiscountsPage from './merchant/DiscountsPage.jsx'
// import UsersRolesPage from './merchant/UsersRolesPage.jsx'
// import SettingsPage from './merchant/SettingsPage.jsx'
// import AuditTrail from './AuditTrail.jsx'

// export default function MerchantDashboard({ user, onLogout }) {
//   const [page, setPage] = useState('dashboard')
//   const [collapsed, setCollapsed] = useState(false)
//   const [productSearch, setProductSearch] = useState('')

//   function handleTopbarSearch(query) {
//     setProductSearch(query)
//     setPage('products')
//   }

//   function renderPage() {
//     switch (page) {
//       case 'dashboard':
//         return <DashboardHome merchantName={user?.name} onNavigate={setPage} />
//       case 'products':
//         return <ProductsPage key={productSearch} initialSearch={productSearch} />
//       case 'orders':
//         return <OrdersPage />
//       case 'customers':
//         return <CustomersPage />
//       case 'agent':
//         return <AIAgentPage />
//       case 'analytics':
//         return <AnalyticsPage />
//       case 'discounts':
//         return <DiscountsPage />
//       case 'audit':
//         return (
//           <div className="bg-slate-950 rounded-2xl p-6">
//             <AuditTrail />
//           </div>
//         )
//       case 'users-roles':
//         return <UsersRolesPage />
//       case 'settings':
//         return <SettingsPage user={user} onNavigate={setPage} />
//       default:
//         return <DashboardHome merchantName={user?.name} onNavigate={setPage} />
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       <Sidebar page={page} setPage={setPage} collapsed={collapsed} />
//       <div className="flex-1 min-w-0">
//         <Topbar
//           user={user}
//           onLogout={onLogout}
//           onToggleSidebar={() => setCollapsed((c) => !c)}
//           onSearch={handleTopbarSearch}
//           notifications={[]}
//         />
//         <main className="p-6 max-w-[1400px] mx-auto">
//           {renderPage()}
//         </main>
//       </div>
//     </div>
//   )
// }


import React, { useState } from 'react'
import Sidebar from './merchant/Sidebar.jsx'
import Topbar from './merchant/Topbar.jsx'
import DashboardHome from './merchant/DashboardHome.jsx'
import ProductsPage from './merchant/ProductsPage.jsx'
import OrdersPage from './merchant/OrdersPage.jsx'
import CustomersPage from './merchant/CustomersPage.jsx'
import AIAgentPage from './merchant/AIAgentPage.jsx'
import AnalyticsPage from './merchant/AnalyticsPage.jsx'
import DiscountsPage from './merchant/DiscountsPage.jsx'
import UsersRolesPage from './merchant/UsersRolesPage.jsx'
import SettingsPage from './merchant/SettingsPage.jsx'
import AuditTrail from './AuditTrail.jsx'

export default function MerchantDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  function handleTopbarSearch(query) {
    setProductSearch(query)
    setPage('products')
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <DashboardHome merchantName={user?.name} onNavigate={setPage} />
      case 'products':
        return <ProductsPage key={productSearch} initialSearch={productSearch} />
      case 'orders':
        return <OrdersPage />
      case 'customers':
        return <CustomersPage />
      case 'agent':
        return <AIAgentPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'discounts':
        return <DiscountsPage />
      case 'audit':
        return <AuditTrail />
      case 'users-roles':
        return <UsersRolesPage />
      case 'settings':
        return <SettingsPage user={user} onNavigate={setPage} />
      default:
        return <DashboardHome merchantName={user?.name} onNavigate={setPage} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} />
      <div className="flex-1 min-w-0">
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onSearch={handleTopbarSearch}
          notifications={[]}
        />
        <main className="p-6 max-w-[1400px] mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}