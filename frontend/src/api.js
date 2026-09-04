// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// // async function request(path, options = {}) {
// //   const res = await fetch(`${API_BASE}${path}`, {
// //     headers: { "Content-Type": "application/json" },
// //     ...options,
// //   });
// //   if (!res.ok) {
// //     const text = await res.text();
// //     throw new Error(`API error ${res.status}: ${text}`);
// //   }
// //   return res.json();
// // }

// // export const api = {
// //   chat: (payload) => request("/chat", { method: "POST", body: JSON.stringify(payload) }),
// //   catalog: () => request("/catalog"),
// //   proposeCheckout: (payload) => request("/checkout/propose", { method: "POST", body: JSON.stringify(payload) }),
// //   confirmCheckout: (payload) => request("/checkout/confirm", { method: "POST", body: JSON.stringify(payload) }),
// //   simulateDecline: (payload) => request("/checkout/simulate-decline", { method: "POST", body: JSON.stringify(payload) }),
// //   audit: (sessionId) => request(`/audit${sessionId ? `?session_id=${sessionId}` : ""}`),
// //   orders: (sessionId) => request(`/orders${sessionId ? `?session_id=${sessionId}` : ""}`),
// // };

// // export default api;

// async function request(path, options = {}) {
//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     ...options,
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     let detail = text;
//     try {
//       const parsed = JSON.parse(text);
//       detail = parsed.detail || text;
//     } catch {
//       // response wasn't JSON — fall back to raw text
//     }
//     const err = new Error(detail);
//     err.status = res.status;
//     throw err;
//   }
//   return res.json();
// }

// function qs(params = {}) {
//   const parts = Object.entries(params)
//     .filter(([, v]) => v !== undefined && v !== null && v !== "")
//     .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
//   return parts.length ? `?${parts.join("&")}` : "";
// }

// export const api = {
//   signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
//   login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
//   chat: (payload) => request("/chat", { method: "POST", body: JSON.stringify(payload) }),
//   catalog: () => request("/catalog"),
//   proposeCheckout: (payload) => request("/checkout/propose", { method: "POST", body: JSON.stringify(payload) }),
//   confirmCheckout: (payload) => request("/checkout/confirm", { method: "POST", body: JSON.stringify(payload) }),
//   simulateDecline: (payload) => request("/checkout/simulate-decline", { method: "POST", body: JSON.stringify(payload) }),
//   validateCoupon: (payload) => request("/checkout/validate-coupon", { method: "POST", body: JSON.stringify(payload) }),
//   orderStatus: (orderId) => request(`/checkout/order-status/${encodeURIComponent(orderId)}`),
//   reportPaymentResult: (payload) => request("/checkout/report-payment-result", { method: "POST", body: JSON.stringify(payload) }),
//   audit: (sessionId) => request(`/audit${sessionId ? `?session_id=${sessionId}` : ""}`),
//   orders: (userId) => request(`/orders${userId ? `?user_id=${userId}` : ""}`),

//   // --- Merchant dashboard ---
//   merchantStats: (days = 30) => request(`/merchant/stats${qs({ days })}`),
//   merchantSalesOverview: (days = 30) => request(`/merchant/sales-overview${qs({ days })}`),
//   merchantTopCategories: (days = 30) => request(`/merchant/top-categories${qs({ days })}`),
//   merchantInsights: (days = 30) => request(`/merchant/insights${qs({ days })}`),
//   merchantProducts: (params = {}) => request(`/merchant/products${qs(params)}`),
//   merchantCreateProduct: (payload) => request("/merchant/products", { method: "POST", body: JSON.stringify(payload) }),
//   merchantUpdateProduct: (sku, payload) =>
//     request(`/merchant/products/${encodeURIComponent(sku)}`, { method: "PUT", body: JSON.stringify(payload) }),
//   merchantDeleteProduct: (sku) =>
//     request(`/merchant/products/${encodeURIComponent(sku)}`, { method: "DELETE" }),
//   merchantCustomers: (params = {}) => request(`/merchant/customers${qs(params)}`),
//   merchantUsers: () => request("/merchant/users"),
//   merchantAgentStatus: () => request("/merchant/agent/status"),
//   merchantAgentPolicy: () => request("/merchant/agent/policy"),
//   merchantUpdatePolicy: (payload) =>
//     request("/merchant/agent/policy", { method: "PUT", body: JSON.stringify(payload) }),
// };

// export default api;



const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// async function request(path, options = {}) {
//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     ...options,
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`API error ${res.status}: ${text}`);
//   }
//   return res.json();
// }

// export const api = {
//   chat: (payload) => request("/chat", { method: "POST", body: JSON.stringify(payload) }),
//   catalog: () => request("/catalog"),
//   proposeCheckout: (payload) => request("/checkout/propose", { method: "POST", body: JSON.stringify(payload) }),
//   confirmCheckout: (payload) => request("/checkout/confirm", { method: "POST", body: JSON.stringify(payload) }),
//   simulateDecline: (payload) => request("/checkout/simulate-decline", { method: "POST", body: JSON.stringify(payload) }),
//   audit: (sessionId) => request(`/audit${sessionId ? `?session_id=${sessionId}` : ""}`),
//   orders: (sessionId) => request(`/orders${sessionId ? `?session_id=${sessionId}` : ""}`),
// };

// export default api;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.detail || text;
    } catch {
      // response wasn't JSON — fall back to raw text
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function qs(params = {}) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  chat: (payload) => request("/chat", { method: "POST", body: JSON.stringify(payload) }),
  catalog: () => request("/catalog"),
  proposeCheckout: (payload) => request("/checkout/propose", { method: "POST", body: JSON.stringify(payload) }),
  approveCheckout: (payload) => request("/checkout/approve", { method: "POST", body: JSON.stringify(payload) }),
  confirmCheckout: (payload) => request("/checkout/confirm", { method: "POST", body: JSON.stringify(payload) }),
  simulateDecline: (payload) => request("/checkout/simulate-decline", { method: "POST", body: JSON.stringify(payload) }),
  validateCoupon: (payload) => request("/checkout/validate-coupon", { method: "POST", body: JSON.stringify(payload) }),
  orderStatus: (orderId) => request(`/checkout/order-status/${encodeURIComponent(orderId)}`),
  reportPaymentResult: (payload) => request("/checkout/report-payment-result", { method: "POST", body: JSON.stringify(payload) }),
  audit: (sessionId) => request(`/audit${sessionId ? `?session_id=${sessionId}` : ""}`),
  orders: (userId) => request(`/orders${userId ? `?user_id=${userId}` : ""}`),

  // --- Merchant dashboard ---
  merchantStats: (days = 30) => request(`/merchant/stats${qs({ days })}`),
  merchantSalesOverview: (days = 30) => request(`/merchant/sales-overview${qs({ days })}`),
  merchantTopCategories: (days = 30) => request(`/merchant/top-categories${qs({ days })}`),
  merchantInsights: (days = 30) => request(`/merchant/insights${qs({ days })}`),
  merchantProducts: (params = {}) => request(`/merchant/products${qs(params)}`),
  merchantCreateProduct: (payload) => request("/merchant/products", { method: "POST", body: JSON.stringify(payload) }),
  merchantUpdateProduct: (sku, payload) =>
    request(`/merchant/products/${encodeURIComponent(sku)}`, { method: "PUT", body: JSON.stringify(payload) }),
  merchantDeleteProduct: (sku) =>
    request(`/merchant/products/${encodeURIComponent(sku)}`, { method: "DELETE" }),
  merchantCustomers: (params = {}) => request(`/merchant/customers${qs(params)}`),
  merchantUsers: () => request("/merchant/users"),
  merchantAgentStatus: () => request("/merchant/agent/status"),
  merchantAgentPolicy: () => request("/merchant/agent/policy"),
  merchantUpdatePolicy: (payload) =>
    request("/merchant/agent/policy", { method: "PUT", body: JSON.stringify(payload) }),
};

export default api;