import React, { useState, useMemo, useEffect } from 'react';
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
    className={`flex items-center gap-4 w-full py-3 px-6 transition-all duration-200 relative group ${
      active 
        ? 'bg-red-50 text-red-600 font-semibold' 
        : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />}
    <Icon className={`w-5 h-5 ${active ? 'text-red-600' : 'group-hover:text-red-600 transition-colors'}`} />
    <span className="hidden md:block text-sm tracking-wide">{label}</span>
  </button>
);

const Header = ({ title, subtitle, rightContent }: any) => (
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex justify-between items-center px-8 shadow-sm">
    <div className="flex items-center gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {subtitle && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 mt-0.5 bg-gray-50 border border-gray-200 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4">
      {rightContent}
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
         <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px]">AD</div>
         <span className="text-xs font-semibold text-gray-700">Admin</span>
      </div>
      <div className="relative">
        <button className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-500">
          <Bell className="w-5 h-5" />
        </button>
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </div>
      <button className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-500">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  </header>
);

// --- Dummy Data ---
const PRODUCTS = [
  { id: 1, name: 'Carbonara', price: 20000, category: 'Pasta', spicy: 1, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop' },
  { id: 2, name: 'Bolognese', price: 15000, category: 'Pasta', spicy: 1, image: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&auto=format&fit=crop' },
  { id: 3, name: 'Spaghetti Matah', price: 15000, category: 'Fusion', spicy: 4, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop' },
  { id: 4, name: 'Aglio Olio', price: 15000, category: 'Pasta', spicy: 3, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop' },
];

const INITIAL_TRANSACTIONS = [
  { id: '#LZ-9402', customerName: 'Budi Santoso', items: [{ name: 'Spaghetti Matah', qty: 2 }, { name: 'Aglio Olio', qty: 1 }], total: 45000, time: '14:22', status: 'Served', type: 'Dine-in' },
  { id: '#LZ-9403', customerName: 'Siti Aminah', items: [{ name: 'Carbonara', qty: 1 }], total: 20000, time: '14:28', status: 'Ready', type: 'Takeaway' },
  { id: '#LZ-9404', customerName: 'Andi Wijaya', items: [{ name: 'Bolognese', qty: 3 }], total: 45000, time: '14:31', status: 'Cooking', type: 'Dine-in' },
  { id: '#LZ-9405', customerName: 'Rina Marlina', items: [{ name: 'Carbonara', qty: 2 }, { name: 'Aglio Olio', qty: 1 }], total: 55000, time: '14:45', status: 'Cooking', type: 'Delivery' },
];

// --- Views ---

const DashboardView = ({ transactions }: any) => {
  const totalRevenue = useMemo(() => transactions.reduce((sum: number, t: any) => sum + t.total, 0), [transactions]);
  const orderCount = transactions.length;
  
  const topProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t: any) => {
      t.items.forEach((item: any) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    });
    let top = { name: '-', qty: 0 };
    for (const [name, qty] of Object.entries(counts)) {
      if ((qty as number) > top.qty) top = { name, qty: qty as number };
    }
    return top.name;
  }, [transactions]);

  return (
    <div className="p-8 flex flex-col gap-8 overflow-y-auto h-full custom-scrollbar bg-gray-50/50">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden group hover:border-red-200 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <TrendingUp className="absolute right-4 top-4 w-6 h-6 text-red-200" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Total Revenue</p>
          <div className="flex items-end justify-between relative z-10 mt-2">
            <h3 className="text-3xl font-bold text-gray-800 tracking-tight">Rp {totalRevenue.toLocaleString()}</h3>
          </div>
          <span className="text-green-500 flex items-center text-[10px] font-bold gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +15.4% from yesterday
          </span>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden group hover:border-red-200 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <ShoppingCart className="absolute right-4 top-4 w-6 h-6 text-blue-200" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Total Orders</p>
          <div className="flex items-end justify-between relative z-10 mt-2">
            <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{orderCount}</h3>
          </div>
          <span className="text-gray-400 text-[10px] font-bold italic mt-1">Avg 12 orders/hr</span>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Customers</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-bold text-red-600 tracking-tight">
              {transactions.filter((t: any) => t.status === 'Cooking').length} <span className="text-sm font-normal text-gray-400">Waiting</span>
            </h3>
            <Users className="w-6 h-6 text-gray-300" />
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Selling Product</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-red-600 fill-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">{topProduct}</h3>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" /> Recent Customer Purchases
            </h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items Bought</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                <AnimatePresence>
                  {[...transactions].reverse().slice(0, 6).map((t: any) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={t.id} 
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                             <UserCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{t.customerName}</p>
                            <p className="text-[10px] text-gray-400">{t.id} • {t.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {t.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        Rp {t.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.type}</span>
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No transactions yet. Go to POS to add an order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue by Channel</h4>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              { label: 'Dine-in Customers', val: '65%', p: 'w-[65%]', color: 'bg-red-500' },
              { label: 'Takeaway Orders', val: '20%', p: 'w-[20%]', color: 'bg-orange-400' },
              { label: 'Online Delivery', val: '15%', p: 'w-[15%]', color: 'bg-blue-400' },
            ].map((e, i) => (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                key={e.label} 
                className="space-y-3 origin-left"
              >
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                  <span className="text-gray-600">{e.label}</span>
                  <span className="text-gray-800">{e.val}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className={`${e.color} h-full ${e.p} rounded-full relative overflow-hidden`}>
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
  
  const addToCart = (product: any) => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.id === product.id);
      if (existing) {
        return prev.map((item: any) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const filteredProducts = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="flex h-full overflow-hidden bg-gray-50/50">
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="p-8 pb-4 flex justify-between items-end shrink-0">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Point of Sale</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">Spaghetti Menu</h2>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-64 bg-white shadow-sm transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map(item => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all flex flex-col"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
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
                           <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < item.spicy ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                        ))}
                        <span className="text-[10px] text-gray-400 ml-2 uppercase font-bold">Spicy Lvl</span>
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
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl relative z-10 shrink-0">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-500" /> Current Order
          </h3>
          <p className="text-xs text-gray-500 mt-1">{cart.length} items in tray</p>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
          <AnimatePresence>
            {cart.map((item: any) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id} 
                className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                  <p className="text-red-600 font-bold text-xs">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-500 transition-all">
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <MinusCircle className="w-4 h-4" />}
                  </button>
                  <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-500 transition-all">
                    <PlusCircle className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 mt-20">
              <Package className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">Tray is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (10%)</span>
              <span className="font-medium">Rp {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 mt-2">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-red-600">Rp {total.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
              cart.length > 0 ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0' : 'bg-gray-300 cursor-not-allowed'
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

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const service = orderType === 'Dine-in' ? subtotal * 0.05 : 0;
  const total = subtotal + tax + service;

  const handleCheckout = () => {
    if (!customerName) {
      alert('Please enter a customer name');
      return;
    }
    const newTransaction = {
      id: `#LZ-${Math.floor(Math.random() * 10000)}`,
      customerName,
      items: cart.map((c: any) => ({ name: c.name, qty: c.quantity })),
      total,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Cooking',
      type: orderType
    };
    onComplete(newTransaction);
  };

  return (
    <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 h-full overflow-y-auto custom-scrollbar bg-gray-50/50">
      <section className="xl:col-span-5 flex flex-col h-full min-h-[600px]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-end mt-2">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Review Order</p>
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Summary</h3>
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
                    <p className="font-bold text-sm text-gray-800">{item.name}</p>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-800">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 my-6"></div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-bold">Rp {tax.toLocaleString()}</span>
              </div>
              {orderType === 'Dine-in' && (
                <div className="flex justify-between text-xs text-gray-600">
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
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2 uppercase tracking-wide">Customer Name</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2 uppercase tracking-wide">Order Type</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {['Dine-in', 'Takeaway', 'Delivery'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === type ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col gap-6">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payment Method</h4>
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
                  paymentMethod === m.label ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 hover:border-red-200 text-gray-500'
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
            className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl flex items-center justify-center gap-4 group relative overflow-hidden shadow-lg shadow-red-600/30 transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Printer className="w-6 h-6" />
            <span className="text-xl font-bold uppercase tracking-widest">FINALIZE ORDER</span>
            <ChevronRight className="w-6 h-6 ml-2 absolute right-8 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const HistoryView = ({ transactions }: any) => (
  <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
    <section className="p-8 pb-0">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Transaction History</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
             <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search by ID or Customer..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <button className="px-6 py-3 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Order ID</th>
              <th className="px-8 py-5">Customer Info</th>
              <th className="px-8 py-5">Items</th>
              <th className="px-8 py-5">Time</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {[...transactions].reverse().map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 font-bold text-red-600">{row.id}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-gray-800">{row.customerName}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tight">{row.type}</p>
                </td>
                <td className="px-8 py-5 text-gray-600">
                  {row.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                </td>
                <td className="px-8 py-5 text-gray-500 font-medium">
                  {row.time}
                </td>
                <td className="px-8 py-5 font-bold text-gray-800">
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
  const inventoryItems = [
    { id: 1, name: 'Spaghetti Pasta (Dry)', stock: 85, unit: 'kg', status: 'Good', limit: 20 },
    { id: 2, name: 'Garlic', stock: 12, unit: 'kg', status: 'Low', limit: 15 },
    { id: 3, name: 'Smoked Beef / Bacon', stock: 45, unit: 'packs', status: 'Good', limit: 10 },
    { id: 4, name: 'Parmesan Cheese', stock: 8, unit: 'kg', status: 'Critical', limit: 10 },
    { id: 5, name: 'Sambal Matah Ingredients', stock: 30, unit: 'sets', status: 'Good', limit: 10 },
    { id: 6, name: 'Minced Beef', stock: 50, unit: 'kg', status: 'Good', limit: 20 },
    { id: 7, name: 'Olive Oil', stock: 15, unit: 'liters', status: 'Low', limit: 20 },
  ];

  return (
    <div className="p-8 flex flex-col gap-8 overflow-y-auto h-full custom-scrollbar bg-gray-50/50">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Ingredient Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage stock for your 4 spaghetti flavors</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Items</p>
            <h3 className="text-2xl font-bold text-gray-800">{inventoryItems.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
            <h3 className="text-2xl font-bold text-gray-800">{inventoryItems.filter(i => i.status === 'Low').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Critical</p>
            <h3 className="text-2xl font-bold text-red-600">{inventoryItems.filter(i => i.status === 'Critical').length}</h3>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h4 className="text-sm font-bold text-gray-700">Stock Levels</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-1/3">Capacity</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {inventoryItems.map(item => {
                const percentage = Math.min((item.stock / (item.limit * 5)) * 100, 100);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{item.stock}</span> <span className="text-gray-500 text-xs">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        item.status === 'Good' ? 'bg-green-50 text-green-700' :
                        item.status === 'Low' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.status === 'Good' ? 'bg-green-500' : item.status === 'Low' ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-red-600 font-bold text-xs hover:underline">Restock</button>
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
  const [transactions, setTransactions] = useState<any[]>(INITIAL_TRANSACTIONS);

  const handleCheckoutComplete = (newTransaction: any) => {
    setTransactions([...transactions, newTransaction]);
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
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-24 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full py-8 gap-2 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Lezzatri</h1>
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

        <div className="px-6 pt-6 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate">Super Admin</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Online</p>
            </div>
            <LogOut className="hidden md:block w-4 h-4 text-gray-400 ml-auto cursor-pointer hover:text-red-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <Header 
          title={views[currentView]?.title || 'View'} 
          subtitle={views[currentView]?.subtitle}
        />
        
        <div className="flex-1 relative overflow-hidden bg-gray-50">
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
                <div className="p-8 flex flex-col items-center justify-center h-full text-gray-400">
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
