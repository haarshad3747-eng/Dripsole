import React, { useState } from 'react';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, ArrowLeft, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CURRENCY_SYMBOL } from '../config';
import { PaymentModal } from '../components/PaymentModal';
import type { Order } from '../types';

interface CartPageProps {
  onNavigate: (tab: string) => void;
  onOrderSuccess?: (order: Order) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'VAULT10' || code === 'DRIP10') {
      const discount = Math.round(subtotal * 0.1);
      setCouponDiscount(discount);
      setCouponApplied(true);
    } else if (code === 'FIRSTDROP') {
      const discount = Math.min(1000, subtotal);
      setCouponDiscount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try VAULT10 for 10% off.');
    }
  };

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleOrderFinished = (order: Order) => {
    clearCart();
    setIsPaymentModalOpen(false);
    if (onOrderSuccess) {
      onOrderSuccess(order);
    } else {
      onNavigate('confirmation');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-white text-gray-900">
        <div className="w-20 h-20 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-gray-400 mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black font-heading uppercase text-gray-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
          You haven't claimed any kicks yet. Check out our fresh sneaker drops and secure your size.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition min-h-[48px] shadow-sm"
        >
          Explore Sneaker Drops
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6 mb-8">
        <div>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-2 min-h-[32px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
            Shopping Cart ({items.length})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-600 transition min-h-[44px] flex items-center font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="p-4 sm:p-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-white border border-[#E5E7EB] shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-gray-500 font-bold">
                    {item.brand}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 font-heading leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-0.5">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E5E7EB] text-gray-800 text-[11px]">
                      Size EU {item.size}
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {CURRENCY_SYMBOL}{item.salePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, -1)}
                    className="p-2 text-gray-600 hover:text-black min-w-[38px] min-h-[38px] flex items-center justify-center transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, 1)}
                    className="p-2 text-gray-600 hover:text-black min-w-[38px] min-h-[38px] flex items-center justify-center transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId, item.size)}
                  className="p-2 text-gray-400 hover:text-red-600 transition min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg hover:bg-gray-200"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Coupon Code Input */}
          <div className="p-4 sm:p-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo code (Try VAULT10)"
                  className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 uppercase focus:outline-none focus:border-black min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                className="px-5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition min-h-[44px]"
              >
                Apply
              </button>
            </form>
            {couponApplied && (
              <p className="text-xs text-emerald-700 font-mono mt-2 font-semibold">
                ✓ Coupon applied! Saved {CURRENCY_SYMBOL}{couponDiscount.toLocaleString('en-IN')}
              </p>
            )}
            {couponError && (
              <p className="text-xs text-red-600 font-mono mt-2">
                {couponError}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="space-y-4">
          <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-6 text-gray-900 space-y-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-wide border-b border-[#E5E7EB] pb-3 text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono text-gray-900 font-semibold">
                  {CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">
                    -{CURRENCY_SYMBOL}{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Express Insured Shipping</span>
                <span className="text-emerald-700 font-mono uppercase font-bold">FREE</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated GST</span>
                <span className="text-gray-400 font-mono">Included in price</span>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4 flex items-baseline justify-between">
              <span className="font-heading text-sm font-bold uppercase text-gray-700">
                Total Amount:
              </span>
              <span className="font-mono text-2xl font-black text-gray-900">
                {CURRENCY_SYMBOL}{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Requirement: Full-width horizontal bar button showing "Checkout · ₹[total]" with an arrow icon */}
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs sm:text-sm tracking-wider rounded-2xl transition flex items-center justify-between shadow-md min-h-[50px] active:scale-[0.99]"
            >
              <span>Checkout · {CURRENCY_SYMBOL}{finalTotal.toLocaleString('en-IN')}</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay Verified 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement: Sticky Full-Width Horizontal Bar on Mobile at screen bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-2xl">
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="w-full py-3.5 px-5 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-between shadow-md min-h-[48px] active:scale-[0.99]"
        >
          <span>Checkout · {CURRENCY_SYMBOL}{finalTotal.toLocaleString('en-IN')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Requirement 4: Payment Popup after tapping Checkout */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={items}
        subtotal={finalTotal}
        onOrderSuccess={handleOrderFinished}
      />
    </div>
  );
};
