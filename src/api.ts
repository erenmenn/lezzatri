// =====================================================
// Lezzatri API Client – On-Premise Backend
// Base URL: http://localhost:3001/api
// =====================================================

export const API_BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request gagal');
  }
  return res.json();
}

// ── Products ────────────────────────────────────────
export const getProducts = () => request<any[]>('/products');

// ── Transactions ────────────────────────────────────
export const getTransactions = () => request<any[]>('/transactions');

export const createTransaction = (body: {
  customer_name: string;
  order_type: string;
  payment_method: string;
  items: { product_id: number; product_name: string; quantity: number; unit_price: number }[];
}) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(body) });

export const updateTransactionStatus = (id: string | number, status: string) =>
  request<any>(`/transactions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ── Ingredients ─────────────────────────────────────
export const getIngredients = () => request<any[]>('/ingredients');

export const restockIngredient = (id: number, amount: number) =>
  request<any>(`/ingredients/${id}/restock`, { method: 'PATCH', body: JSON.stringify({ amount }) });

export const updateIngredient = (id: number, body: any) =>
  request<any>(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// ── Dashboard ────────────────────────────────────────
export const getDashboardStats = () => request<any>('/dashboard/stats');
export const getRecentTransactions = () => request<any[]>('/dashboard/recent');

// ── Health Check ─────────────────────────────────────
export const checkHealth = () => request<any>('/health');
