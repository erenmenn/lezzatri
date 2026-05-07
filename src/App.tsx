import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from './api';
import { 
  LayoutDashboard, 
  Store, 
  History, 
  ChefHat, 
  Package, 
  ShoppingCart,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  PlusCircle,
  MinusCircle,
  CreditCard,
  QrCode,
  Wallet,
  LogOut,
  ChevronRight,
  TrendingUp,
  Star,
  Printer,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCircle,
  Trash2,
  AlertTriangle,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Shared Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full py-3.5 px-6 transition-all duration-300 relative group ${
      active 
        ? 'bg-zinc-900 text-white font-semibold' 
        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />}
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-red-500 scale-110' : 'group-hover:scale-110'}`} />
    <span className="hidden md:block text-sm tracking-wide">{label}</span>
  </button>
);

const Header = ({ title, subtitle, rightContent }: any) => (
  <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 h-[72px] flex justify-between items-center px-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
    <div className="flex items-center gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-zinc-800 tracking-tight">{title}</h2>
        {subtitle && (
          <div className="hidden lg:flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-5">
      {rightContent}
      <div className="hidden md:flex relative group">
         <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
         <input type="text" placeholder="Quick search..." className="pl-9 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl text-sm w-56 transition-all outline-none" />
      </div>
      <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>
      <button className="relative p-2 hover:bg-zinc-100 transition-colors rounded-full text-zinc-500">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
         <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-red-500/20 ring-2 ring-white">AD</div>
         <div className="hidden md:block text-left">
           <p className="text-sm font-bold text-zinc-800 leading-none">Admin</p>
           <p className="text-[10px] text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Store Manager</p>
         </div>
      </div>
    </div>
  </header>
);

// --- API Status Banner ---
const APIStatusBanner = ({ online }: { online: boolean | null }) => {
  if (online === null) return null;
  if (online) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-bounce">
      <AlertCircle className="w-4 h-4 shrink-0" />
      Backend offline – pastikan server berjalan di port 3001
    </div>
  );
};

// --- Views ---

const DashboardView = ({ transactions }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([api.getDashboardStats(), api.getRecentTransactions()]);
        setStats(s);
        setRecent(r);
      } catch {
        // fallback ke prop transactions jika API offline
        setRecent(transactions.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [transactions]);

  const totalRevenue = stats?.revenue?.today ?? transactions.reduce((s: number, t: any) => s + t.total, 0);
  const orderCount   = stats?.orders?.today   ?? transactions.length;
  const activeCount  = stats?.orders?.active  ?? transactions.filter((t: any) => t.status === 'Cooking').length;
  const topProduct   = stats?.topProduct      ?? '-';
  const revenueChange = stats?.revenue?.changePercent ?? 0;
  const channels     = stats?.revenueByChannel ?? { dineIn: { percent: 65 }, takeaway: { percent: 20 }, delivery: { percent: 15 } };
  const displayRows  = recent.length ? recent : transactions.slice().reverse().slice(0, 6);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold">Memuat data dari database...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8 overflow-y-auto h-full custom-scrollbar bg-zinc-50/50">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden group hover:border-red-200 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <TrendingUp className="absolute right-4 top-4 w-6 h-6 text-red-200" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">Total Revenue</p>
          <div className="flex items-end justify-between relative z-10 mt-2">
            <h3 className="text-3xl font-bold text-zinc-800 tracking-tight">Rp {totalRevenue.toLocaleString()}</h3>
          </div>
          <span className="text-green-500 flex items-center text-[10px] font-bold gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +15.4% from yesterday
          </span>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden group hover:border-red-200 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <ShoppingCart className="absolute right-4 top-4 w-6 h-6 text-blue-200" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">Total Orders</p>
          <div className="flex items-end justify-between relative z-10 mt-2">
            <h3 className="text-3xl font-bold text-zinc-800 tracking-tight">{orderCount}</h3>
          </div>
          <span className="text-zinc-400 text-[10px] font-bold italic mt-1">Hari ini</span>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pesanan Aktif</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-bold text-red-600 tracking-tight">
              {activeCount} <span className="text-sm font-normal text-zinc-400">Menunggu</span>
            </h3>
            <Users className="w-6 h-6 text-zinc-300" />
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Top Selling</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-red-600 fill-red-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 leading-tight">{topProduct}</h3>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" /> Recent Customer Purchases
            </h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items Bought</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-sm">
                <AnimatePresence>
                  {displayRows.map((t: any) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={t.id} 
                      className="hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 border border-zinc-200">
                             <UserCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-800">{t.customerName}</p>
                            <p className="text-[10px] text-zinc-400">{t.id} • {t.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {t.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-800">
                        Rp {t.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          t.status === 'Served' ? 'bg-green-100 text-green-700' :
                          t.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-50 text-red-600 animate-pulse'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {displayRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-400">Belum ada transaksi. Buka POS untuk mulai order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-6">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Revenue by Channel</h4>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              { label: 'Dine-in', val: `${channels.dineIn.percent}%`, pct: channels.dineIn.percent, color: 'bg-red-500' },
              { label: 'Takeaway', val: `${channels.takeaway.percent}%`, pct: channels.takeaway.percent, color: 'bg-orange-400' },
              { label: 'Delivery', val: `${channels.delivery.percent}%`, pct: channels.delivery.percent, color: 'bg-blue-400' },
            ].map((e, i) => (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                key={e.label} 
                className="space-y-3 origin-left"
              >
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                  <span className="text-zinc-600">{e.label}</span>
                  <span className="text-zinc-800">{e.val}</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className={`${e.color} h-full rounded-full relative overflow-hidden`} style={{ width: `${e.pct}%` }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 items-start">
             <TrendingUp className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
             <p className="text-xs text-red-800 font-medium leading-relaxed">
               Dine-in revenue is up by 12% today. Consider allocating more staff to the main hall to maintain service speed.
             </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const POSView = ({ cart, setCart, onCheckout }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const addToCart = (product: any) => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.id === product.id);
      if (existing) return prev.map((item: any) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, spicy: product.spicy_level, image: product.image_url, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev: any) => prev.map((item: any) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter((item: any) => item.quantity > 0));
  };

  const filtered = products.filter(p => p.is_available && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="flex h-full overflow-hidden bg-zinc-50/50">
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="p-8 pb-4 flex justify-between items-end shrink-0">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Point of Sale</span>
            <h2 className="text-3xl font-bold text-zinc-800 mt-1">Spaghetti Menu</h2>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-64 bg-white shadow-sm transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors shadow-sm text-zinc-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingProducts ? (
            <div className="col-span-4 flex justify-center items-center py-20 text-zinc-400">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : filtered.map(item => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm transition-all flex flex-col"
            >
                <div className="h-40 overflow-hidden relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                    <span className="text-white text-xl font-bold shadow-sm">{item.name}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-red-600 font-bold text-lg">Rp {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (item.spicy_level || 1) ? 'bg-red-500' : 'bg-zinc-200'}`}></div>
                      ))}
                      <span className="text-[10px] text-zinc-400 ml-2 uppercase font-bold">Spicy Lvl</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gradient-to-b from-red-500 to-red-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add to Order
                  </button>
                </div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="w-[400px] bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl relative z-10 shrink-0">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-500" /> Current Order
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{cart.length} items in tray</p>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
          <AnimatePresence>
            {cart.map((item: any) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id} 
                className="flex items-center gap-4 bg-white p-3 rounded-xl border border-zinc-100 shadow-sm"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-zinc-800 truncate">{item.name}</p>
                  <p className="text-red-600 font-bold text-xs">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-50 rounded-lg p-1 border border-zinc-200">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:shadow-sm text-zinc-500 transition-all">
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <MinusCircle className="w-4 h-4" />}
                  </button>
                  <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:shadow-sm text-zinc-500 transition-all">
                    <PlusCircle className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4 mt-20">
              <Package className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">Tray is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Tax (10%)</span>
              <span className="font-medium">Rp {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-zinc-200 mt-2">
              <span className="text-sm font-bold text-zinc-800 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-red-600">Rp {total.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
              cart.length > 0 ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0' : 'bg-zinc-300 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-5 h-5" /> Proceed to Checkout
          </button>
        </div>
      </aside>
    </div>
  );
};

const CheckoutView = ({ cart, setCart, onComplete }: any) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Dine-in');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.1);
  const service = orderType === 'Dine-in' ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + tax + service;

  const handleCheckout = async () => {
    if (!customerName.trim()) { alert('Masukkan nama pelanggan.'); return; }
    setSubmitting(true);
    try {
      const newTx = await api.createTransaction({
        customer_name: customerName,
        order_type: orderType,
        payment_method: paymentMethod,
        items: cart.map((c: any) => ({
          product_id: c.id,
          product_name: c.name,
          quantity: c.quantity,
          unit_price: c.price,
        })),
      });
      onComplete(newTx);
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 h-full overflow-y-auto custom-scrollbar bg-zinc-50/50">
      <section className="xl:col-span-5 flex flex-col h-full min-h-[600px]">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-full relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-end mt-2">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest">Review Order</p>
              <h3 className="text-2xl font-bold text-zinc-800 tracking-tight">Summary</h3>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {cart.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shrink-0">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-800">{item.name}</p>
                    <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-zinc-800">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-dashed border-zinc-200 my-6"></div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Subtotal</span>
                <span className="font-bold">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Tax (10%)</span>
                <span className="font-bold">Rp {tax.toLocaleString()}</span>
              </div>
              {orderType === 'Dine-in' && (
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Service Charge (5%)</span>
                  <span className="font-bold">Rp {service.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 bg-red-50/50 border-t border-red-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-red-600 uppercase tracking-widest">Total</span>
              <span className="text-3xl font-bold text-red-600 tracking-tighter">Rp {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="xl:col-span-7 flex flex-col gap-8">
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-zinc-600 block mb-2 uppercase tracking-wide">Customer Name</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 block mb-2 uppercase tracking-wide">Order Type</label>
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                {['Dine-in', 'Takeaway', 'Delivery'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === type ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm flex flex-col gap-6">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payment Method</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Store, label: 'CASH' },
              { icon: QrCode, label: 'QRIS' },
              { icon: CreditCard, label: 'CARD' },
              { icon: Wallet, label: 'E-WALLET' },
            ].map(m => (
              <button 
                key={m.label} 
                onClick={() => setPaymentMethod(m.label)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
                  paymentMethod === m.label ? 'border-red-500 bg-red-50 text-red-600' : 'border-zinc-100 hover:border-red-200 text-zinc-500'
                }`}
              >
                <m.icon className={`w-8 h-8 mb-2 ${paymentMethod === m.label ? 'text-red-500' : 'opacity-50 group-hover:opacity-100'}`} />
                <span className="text-[10px] font-bold tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className={`w-full text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-4 group relative overflow-hidden shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] ${
              cart.length > 0 && !submitting ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Menyimpan...</>
            ) : (
              <><div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Printer className="w-6 h-6" />
              <span className="text-xl font-bold uppercase tracking-widest">FINALIZE ORDER</span>
              <ChevronRight className="w-6 h-6 ml-2 absolute right-8 group-hover:translate-x-2 transition-transform" /></>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

const HistoryView = ({ transactions }: any) => (
  <div className="flex flex-col h-full overflow-hidden bg-zinc-50/50">
    <section className="p-8 pb-0">
      <h2 className="text-3xl font-bold text-zinc-800 mb-6">Transaction History</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex gap-4 bg-zinc-50/50">
          <div className="relative flex-1">
             <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input type="text" placeholder="Search by ID or Customer..." className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <button className="px-6 py-3 border border-zinc-200 bg-white rounded-xl text-sm font-bold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Order ID</th>
              <th className="px-8 py-5">Customer Info</th>
              <th className="px-8 py-5">Items</th>
              <th className="px-8 py-5">Time</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 text-sm">
            {[...transactions].reverse().map((row: any) => (
              <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-8 py-5 font-bold text-red-600">{row.id}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-zinc-800">{row.customerName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tight">{row.type}</p>
                </td>
                <td className="px-8 py-5 text-zinc-600">
                  {row.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                </td>
                <td className="px-8 py-5 text-zinc-500 font-medium">
                  {row.time}
                </td>
                <td className="px-8 py-5 font-bold text-zinc-800">
                  Rp {row.total.toLocaleString()}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    row.status === 'Served' ? 'bg-green-100 text-green-700' :
                    row.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-50 text-red-600'
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

const InventoryView = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = () => {
    api.getIngredients()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadItems(); }, []);

  const handleRestock = async (id: number, name: string) => {
    const val = window.prompt(`Tambah stok untuk "${name}" (masukkan jumlah):`);
    if (!val || isNaN(Number(val))) return;
    try {
      await api.restockIngredient(id, Number(val));
      loadItems();
    } catch (err: any) {
      alert('Gagal restock: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8 overflow-y-auto h-full custom-scrollbar bg-zinc-50/50">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-zinc-800">Ingredient Inventory</h2>
          <p className="text-sm text-zinc-500 mt-1">Stok bahan baku real-time dari database MySQL</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Items</p>
            <h3 className="text-2xl font-bold text-zinc-800">{items.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Low Stock</p>
            <h3 className="text-2xl font-bold text-zinc-800">{items.filter(i => i.status === 'Low').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Critical</p>
            <h3 className="text-2xl font-bold text-red-600">{items.filter(i => i.status === 'Critical').length}</h3>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h4 className="text-sm font-bold text-zinc-700">Stock Levels</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-1/3">Capacity</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {items.map(item => {
                const percentage = Math.min((Number(item.stock) / (Number(item.min_stock) * 5)) * 100, 100);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{Number(item.stock).toLocaleString()}</span> <span className="text-zinc-500 text-xs">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        item.status === 'Good' ? 'bg-green-50 text-green-700' :
                        item.status === 'Low' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-600'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.status === 'Good' ? 'bg-green-500' : item.status === 'Low' ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleRestock(item.id, item.name)} className="text-red-600 font-bold text-xs hover:underline">Restock</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [cart, setCart] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Fetch semua transaksi dari API saat mount
  useEffect(() => {
    api.checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
    api.getTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  const handleCheckoutComplete = (newTransaction: any) => {
    setTransactions(prev => [...prev, newTransaction]);
    setCart([]);
    setCurrentView('dashboard');
  };

  const views: Record<string, any> = {
    dashboard: { component: <DashboardView transactions={transactions} />, title: 'Admin Dashboard', subtitle: 'Live Monitoring' },
    pos: { component: <POSView cart={cart} setCart={setCart} onCheckout={() => setCurrentView('checkout')} />, title: 'Terminal POS', subtitle: 'Kasir Utama' },
    checkout: { component: <CheckoutView cart={cart} setCart={setCart} onComplete={handleCheckoutComplete} />, title: 'Checkout & Payment', subtitle: 'Secure Transaction' },
    history: { component: <HistoryView transactions={transactions} />, title: 'Transaction Logs', subtitle: 'Daily Records' },
    inventory: { component: <InventoryView />, title: 'Stock & Inventory', subtitle: 'Warehouse Management' },
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', icon: Store, label: 'POS' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans">
      <APIStatusBanner online={apiOnline} />
      {/* Sidebar */}
      <aside className="w-24 md:w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full py-8 gap-2 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-50">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h1 className="text-xl font-black text-white tracking-tight">Lezzatri</h1>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Admin Suite</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id}
              onClick={() => views[item.id] && setCurrentView(item.id)}
            />
          ))}
        </nav>

        <div className="px-6 pt-6 mt-auto border-t border-zinc-900">
          <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 transition-colors hover:bg-zinc-900">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
              <UserCircle className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 truncate">Super Admin</p>
              <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Online</p>
            </div>
            <LogOut className="hidden md:block w-4 h-4 text-zinc-500 ml-auto cursor-pointer hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <Header 
          title={views[currentView]?.title || 'View'} 
          subtitle={views[currentView]?.subtitle}
        />
        
        <div className="flex-1 relative overflow-hidden bg-zinc-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 h-full"
            >
              {views[currentView]?.component || (
                <div className="p-8 flex flex-col items-center justify-center h-full text-zinc-400">
                   <Settings className="w-16 h-16 animate-spin-slow opacity-20 mb-4" />
                   <h2 className="text-xl font-bold">Module in Development</h2>
                   <p className="text-sm">This feature is not yet available.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
