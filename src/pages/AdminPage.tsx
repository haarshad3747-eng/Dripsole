import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  ExternalLink, 
  AlertTriangle,
  Lock,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { seedDatabase } from '../data/seedProducts';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import type { Product, Order, Review, StoreSettings, OrderStatus, PaymentMethodType } from '../types';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../config';

interface AdminPageProps {
  onNavigate: (tab: string) => void;
  onRefreshCatalog: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onRefreshCatalog }) => {
  const { user, isAdmin, adminEmails, addAdmin, removeAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews' | 'admins' | 'settings' | 'subscribers'>('products');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribedAt?: string }[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    defaultPaymentMethod: 'upi',
    codFee: 99,
    paymentMethodsEnabled: {
      upi: true,
      card: true,
      netbanking: true,
      wallets: true,
      emi: true,
      cod: true
    }
  });

  const [loading, setLoading] = useState(true);

  // Product Form State (Add / Edit)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'Nike',
    category: 'Sneakers',
    gender: 'Men',
    price: 15000,
    salePrice: 12000,
    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
    sizes: { '38': 2, '39': 3, '40': 5, '41': 6, '42': 8, '43': 4, '44': 2 },
    rating: 5.0,
    reviewCount: 0,
    description: '',
    isHyped: true,
    isClearance: false,
    isSoldOut: false
  });

  // Admin Management state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [adminActionSuccess, setAdminActionSuccess] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      const res = await seedDatabase(db);
      if (res) {
        await fetchData();
        onRefreshCatalog();
        alert('Sample catalog seeded successfully into Firestore!');
      } else {
        alert('Database ready. Current catalog is active.');
      }
    } catch (err: any) {
      console.warn('Seed status:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Fetch all admin data
  const fetchData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);

      // Products
      const prodSnap = await getDocs(collection(db, 'products'));
      const prods: Product[] = [];
      prodSnap.forEach(d => prods.push({ id: d.id, ...d.data() } as Product));
      setProducts(prods);

      // Orders
      const orderSnap = await getDocs(collection(db, 'orders'));
      const ords: Order[] = [];
      orderSnap.forEach(d => ords.push({ id: d.id, ...d.data() } as Order));
      ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ords);

      // Reviews
      const revSnap = await getDocs(collection(db, 'reviews'));
      const revs: Review[] = [];
      revSnap.forEach(d => revs.push({ id: d.id, ...d.data() } as Review));
      revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(revs);

      // Subscribers
      const subSnap = await getDocs(collection(db, 'subscribers'));
      const subs: any[] = [];
      subSnap.forEach(d => subs.push({ id: d.id, ...d.data() }));
      setSubscribers(subs);

      // Settings
      const setSnap = await getDocs(collection(db, 'settings'));
      setSnap.forEach(d => {
        if (d.id === 'store') setSettings(d.data() as StoreSettings);
      });

    } catch (err) {
      console.warn('Admin fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  // If not admin, render "Access denied" page
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center bg-white text-gray-900">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black font-heading uppercase tracking-tight text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          The {BRAND_NAME} Admin Console requires verified administrator privileges. If you are an authorized staff member, please sign in with your designated Google Admin account.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs rounded-xl tracking-wider min-h-[44px]"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prodId = editingProduct ? editingProduct.id : `snkr_${Date.now()}`;
      const payload: Product = {
        id: prodId,
        name: productForm.name || 'New Sneaker',
        brand: productForm.brand || 'Nike',
        category: productForm.category || 'Sneakers',
        gender: productForm.gender || 'Men',
        price: Number(productForm.price) || 10000,
        salePrice: Number(productForm.salePrice) || Number(productForm.price) || 10000,
        images: productForm.images?.filter(Boolean) || ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
        sizes: productForm.sizes || {},
        rating: productForm.rating || 5.0,
        reviewCount: productForm.reviewCount || 0,
        description: productForm.description || '',
        isHyped: Boolean(productForm.isHyped),
        isClearance: Boolean(productForm.isClearance),
        isSoldOut: Boolean(productForm.isSoldOut),
      };

      await setDoc(doc(db, 'products', prodId), payload);
      setEditingProduct(null);
      setIsNewProduct(false);
      await fetchData();
      onRefreshCatalog();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      await fetchData();
      onRefreshCatalog();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  // Handle Order Status & Tracking Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingLink?: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: any = { orderStatus: status };
      if (trackingLink !== undefined) {
        updateData.trackingLink = trackingLink;
      }
      await updateDoc(orderRef, updateData);
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updateData } : o));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Handle Review Moderation
  const handleToggleHideReview = async (review: Review) => {
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        isHidden: !review.isHidden
      });
      setReviews(reviews.map(r => r.id === review.id ? { ...r, isHidden: !r.isHidden } : r));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${review.id}`);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  // Handle Add Admin
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionError(null);
    setAdminActionSuccess(null);
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAdminActionError('Please enter a valid email address.');
      return;
    }
    try {
      await addAdmin(newAdminEmail.trim());
      setAdminActionSuccess(`Admin access granted to ${newAdminEmail}.`);
      setNewAdminEmail('');
    } catch (err: any) {
      setAdminActionError(err?.message || 'Could not add administrator.');
    }
  };

  // Handle Remove Admin
  const handleRemoveAdminSubmit = async (email: string) => {
    if (!confirm(`Revoke admin privileges for ${email}?`)) return;
    try {
      await removeAdmin(email);
      setAdminActionSuccess(`Admin access revoked for ${email}.`);
    } catch (err: any) {
      setAdminActionError(err?.message || 'Could not remove administrator.');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'store'), settings);
      alert('Store settings saved successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store');
    }
  };

  const navItems = [
    { id: 'products', label: 'Products', count: products.length, icon: ShoppingBag },
    { id: 'orders', label: 'Orders', count: orders.length, icon: Package },
    { id: 'reviews', label: 'Reviews', count: reviews.length, icon: MessageSquare },
    { id: 'admins', label: 'Admins', count: adminEmails.length, icon: Users },
    { id: 'subscribers', label: 'VIP Leads', count: subscribers.length, icon: Mail },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB] gap-4">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-2 min-h-[32px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
              {BRAND_NAME} Console
            </h1>
            <span className="bg-emerald-50 text-emerald-800 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Firestore
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Logged in as: <span className="font-bold text-gray-900">{user?.email}</span>
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8 border-b border-[#E5E7EB]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition shrink-0 min-h-[44px] ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200 hover:text-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading font-black text-xl uppercase text-gray-900">Sneaker Catalog</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSeeding}
                onClick={handleSeedDatabase}
                className="py-2.5 px-4 bg-white border border-gray-300 hover:border-black text-gray-800 hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 min-h-[44px] transition shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isSeeding ? 'Seeding...' : 'Seed Sample Catalog (12)'}</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsNewProduct(true);
                  setProductForm({
                    name: '',
                    brand: 'Nike',
                    category: 'Sneakers',
                    gender: 'Men',
                    price: 15000,
                    salePrice: 12000,
                    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
                    sizes: { '38': 2, '39': 3, '40': 5, '41': 6, '42': 8, '43': 4, '44': 2 },
                    rating: 5.0,
                    reviewCount: 0,
                    description: 'Authentic deadstock drop.',
                    isHyped: true,
                    isClearance: false,
                    isSoldOut: false
                  });
                }}
                className="py-2.5 px-4 bg-black hover:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 min-h-[44px] transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(prod => {
              const totalStock = Object.values(prod.sizes || {}).reduce((a, b) => a + b, 0);
              return (
                <div key={prod.id} className="p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl flex gap-3 justify-between">
                  <img src={prod.images[0]} alt="" className="w-20 h-20 object-cover rounded-xl bg-white border border-[#E5E7EB] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">{prod.brand}</span>
                    <h3 className="text-xs font-bold text-gray-900 truncate font-heading">{prod.name}</h3>
                    <p className="text-xs font-mono font-bold text-gray-900 mt-1">
                      {CURRENCY_SYMBOL}{prod.salePrice.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                      Stock: {totalStock} pairs across sizes
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 justify-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsNewProduct(false);
                        setProductForm(prod);
                      }}
                      className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-gray-200"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-gray-200"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-heading font-black text-xl uppercase mb-4 text-gray-900">Customer Orders</h2>
          <div className="space-y-4">
            {orders.map(ord => (
              <div key={ord.id} className="p-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-[#E5E7EB] gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-900 uppercase">#{ord.id.slice(-8)}</span>
                    <span className="text-gray-500 ml-2 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <div className="text-gray-600 mt-0.5">
                      Customer: <span className="font-bold text-gray-900">{ord.shippingAddress.fullName}</span> ({ord.userEmail}) • Phone: {ord.shippingAddress.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-gray-900">
                      {CURRENCY_SYMBOL}{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 uppercase">
                      {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="text-xs text-gray-600 space-y-1">
                  {ord.items.map(item => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between">
                      <span>{item.name} (EU {item.size}) x {item.quantity}</span>
                      <span className="font-mono">{CURRENCY_SYMBOL}{(item.salePrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Order Status Controller */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Status:</span>
                    {(['Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(ord.id, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition min-h-[32px] ${
                          ord.orderStatus === st
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={ord.trackingLink || ''}
                      placeholder="Tracking URL"
                      onBlur={(e) => handleUpdateOrderStatus(ord.id, ord.orderStatus, e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-900 w-52 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="font-heading font-black text-xl uppercase mb-4 text-gray-900">Customer Reviews Moderation</h2>
          <div className="space-y-3">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl flex flex-col sm:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">{rev.userName}</span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Product: {rev.productId}
                    </span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}
                    {rev.isHidden && (
                      <span className="text-[10px] font-mono text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 font-heading">{rev.title} ({rev.rating}★)</h4>
                  <p className="text-xs text-gray-600">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleHideReview(rev)}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1 border border-gray-300 min-h-[36px]"
                  >
                    {rev.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{rev.isHidden ? 'Show' : 'Hide'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 bg-white hover:bg-rose-50 rounded-lg text-xs font-bold text-rose-600 border border-gray-300 min-h-[36px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ADMINS TAB */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <h2 className="font-heading font-black text-xl uppercase text-gray-900">Store Staff Administrators</h2>
          
          <form onSubmit={handleAddAdminSubmit} className="flex gap-2 max-w-md">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Staff Google email"
              className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
            />
            <button
              type="submit"
              className="px-5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase min-h-[44px]"
            >
              Add Staff
            </button>
          </form>

          {adminActionError && (
            <p className="text-xs text-rose-600 font-mono">{adminActionError}</p>
          )}
          {adminActionSuccess && (
            <p className="text-xs text-emerald-700 font-mono font-semibold">{adminActionSuccess}</p>
          )}

          <div className="divide-y divide-[#E5E7EB] bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] p-4 max-w-lg">
            {adminEmails.map(email => (
              <div key={email} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-mono text-gray-900">{email}</span>
                {email !== user?.email?.toLowerCase() && (
                  <button
                    onClick={() => handleRemoveAdminSubmit(email)}
                    className="text-gray-400 hover:text-rose-600 font-bold"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUBSCRIBERS TAB */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <h2 className="font-heading font-black text-xl uppercase mb-4 text-gray-900">
            Email Leads & VIP Drop Subscribers ({subscribers.length})
          </h2>
          <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-4 divide-y divide-[#E5E7EB]">
            {subscribers.map((s, idx) => (
              <div key={s.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-mono text-gray-900 font-semibold">{s.email}</span>
                <span className="text-[11px] font-mono text-gray-500">
                  {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN') : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-xl">
          <h2 className="font-heading font-black text-xl uppercase text-gray-900">Payment Gateway Controls</h2>

          <div className="p-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl space-y-4">
            <h3 className="font-bold text-xs uppercase text-gray-700">Toggle Payment Methods</h3>
            {(['upi', 'card', 'netbanking', 'wallets', 'emi', 'cod'] as PaymentMethodType[]).map(method => (
              <label key={method} className="flex items-center justify-between text-xs cursor-pointer py-1">
                <span className="uppercase font-mono font-semibold text-gray-800">{method}</span>
                <input
                  type="checkbox"
                  checked={Boolean(settings.paymentMethodsEnabled?.[method])}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      paymentMethodsEnabled: {
                        ...settings.paymentMethodsEnabled,
                        [method]: e.target.checked
                      }
                    });
                  }}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black"
                />
              </label>
            ))}

            <div className="pt-3 border-t border-[#E5E7EB]">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cash on Delivery Verification Fee (₹)
              </label>
              <input
                type="number"
                value={settings.codFee}
                onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) || 0 })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Payment Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit / Add Product Modal */}
      {(isNewProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl p-6 text-gray-900 my-8 shadow-2xl">
            <button
              onClick={() => { setEditingProduct(null); setIsNewProduct(false); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading font-black text-xl uppercase mb-4 text-gray-900">
              {isNewProduct ? 'Add New Sneaker Drop' : 'Edit Sneaker Details'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-black min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Brand</label>
                  <select
                    value={productForm.brand || 'Nike'}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-black min-h-[40px]"
                  >
                    {['Nike', 'Adidas', 'Air Jordan', 'New Balance', 'Puma', 'Vans', 'Converse', 'Asics', 'Birkenstock', 'Crocs'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Gender</label>
                  <select
                    value={productForm.gender || 'Men'}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-black min-h-[40px]"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price || 0}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.salePrice || 0}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={productForm.images?.[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 min-h-[40px]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isHyped)}
                    onChange={(e) => setProductForm({ ...productForm, isHyped: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Hyped Kick</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isClearance)}
                    onChange={(e) => setProductForm({ ...productForm, isClearance: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Stock Clearance</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isSoldOut)}
                    onChange={(e) => setProductForm({ ...productForm, isSoldOut: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Sold Out</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setIsNewProduct(false); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold uppercase tracking-wider min-h-[44px]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
