import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Heart, 
  Star, 
  ExternalLink, 
  Truck, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Order, Review } from '../types';
import { CURRENCY_SYMBOL } from '../config';

interface AccountPageProps {
  onNavigate: (tab: string, filterParams?: any) => void;
  onOpenProductById: (productId: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onOpenProductById }) => {
  const { user, isAdmin, logout } = useAuth();
  const { wishlistIds } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrdersAndReviews = async () => {
      try {
        setLoadingOrders(true);
        // Orders query
        const orderQ = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const orderSnap = await getDocs(orderQ);
        const ords: Order[] = [];
        orderSnap.forEach(d => {
          ords.push({ id: d.id, ...d.data() } as Order);
        });
        ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(ords);

        // Reviews query
        const reviewQ = query(
          collection(db, 'reviews'),
          where('userId', '==', user.uid)
        );
        const revSnap = await getDocs(reviewQ);
        const revs: Review[] = [];
        revSnap.forEach(d => {
          revs.push({ id: d.id, ...d.data() } as Review);
        });
        setMyReviews(revs);
      } catch (err) {
        console.warn('Error fetching account data:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrdersAndReviews();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white text-gray-900">
        <h2 className="text-2xl font-black font-heading uppercase mb-2">Sign In Required</h2>
        <p className="text-xs text-gray-500 mb-6">
          Please log in to view your orders, track shipments, and manage your account.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl min-h-[44px]"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Profile Header Card */}
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-gray-700">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading uppercase text-gray-900">
                {user.displayName || 'Sneaker Enthusiast'}
              </h1>
              {isAdmin && (
                <span className="bg-black text-white text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded">
                  Staff Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {user.email}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <button
                onClick={() => onNavigate('wishlist')}
                className="inline-flex items-center gap-1.5 text-gray-700 hover:text-black font-medium"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{wishlistIds.length} Saved Items</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1 text-black font-bold underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-white text-gray-700 hover:text-black text-xs font-bold transition min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E5E7EB] mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold font-heading uppercase tracking-wider transition relative ${
            activeTab === 'orders'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          Order History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-xs font-bold font-heading uppercase tracking-wider transition relative ${
            activeTab === 'reviews'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          My Reviews ({myReviews.length})
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] p-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold uppercase font-heading text-gray-900 mb-1">
                No Orders Placed Yet
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                When you cop sneakers, your order tracking and receipts will appear right here.
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl min-h-[44px]"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-black flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gray-900 uppercase">
                          Order #{order.id.slice(-8)}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">Total</span>
                    <span className="font-mono font-black text-base text-gray-900">
                      {CURRENCY_SYMBOL}{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-200"
                        />
                        <div>
                          <h4
                            onClick={() => onOpenProductById(item.productId)}
                            className="text-xs font-bold text-gray-900 hover:text-black cursor-pointer font-heading line-clamp-1"
                          >
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 font-mono">
                            EU {item.size} • Qty {item.quantity} • {CURRENCY_SYMBOL}{item.salePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {order.orderStatus === 'Delivered' && (
                        <button
                          onClick={() => onOpenProductById(item.productId)}
                          className="text-[11px] font-bold text-black hover:underline"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer with tracking link */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
                  <div>
                    <span>Delivery to: </span>
                    <span className="font-medium text-gray-800">
                      {order.shippingAddress.fullName}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                    </span>
                  </div>
                  {order.trackingLink && (
                    <a
                      href={order.trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono font-semibold text-black hover:underline text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Airway Tracking</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <div className="py-16 text-center bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] p-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold uppercase font-heading text-gray-900 mb-1">
                No Reviews Submitted
              </h3>
              <p className="text-xs text-gray-500">
                You haven't reviewed any kicks yet. Visit a product page to share your fit review.
              </p>
            </div>
          ) : (
            myReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 font-heading">
                  {rev.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {rev.comment}
                </p>
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
