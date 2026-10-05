import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, Truck, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import type { Order } from '../types';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../config';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (tab: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  useEffect(() => {
    // Fire celebratory confetti on page load
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#000000', '#10B981', '#6366F1', '#F59E0B']
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white text-gray-900">
      
      {/* Success Badge Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
          Order Confirmed • Verified Deadstock
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading uppercase tracking-tight text-gray-900">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          We have received your order at {BRAND_NAME}. Our authenticators are preparing your deadstock pair for insured air dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Top Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#E5E7EB] text-xs">
          <div>
            <span className="text-gray-400 font-mono block">Order ID</span>
            <span className="font-mono font-bold text-gray-900 uppercase text-[11px] truncate block">
              #{order.id.slice(-8)}
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-mono block">Payment</span>
            <span className="font-mono font-bold text-gray-900 uppercase">
              {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-mono block">Expected Delivery</span>
            <span className="font-mono font-bold text-emerald-700">
              4-7 Business Days
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-mono block">Carrier</span>
            <span className="font-mono font-bold text-gray-900">
              BlueDart / Delhivery Air
            </span>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="space-y-3">
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-gray-700">
            Items in your shipment ({order.items.length})
          </h3>
          <div className="divide-y divide-[#E5E7EB] bg-white rounded-2xl border border-[#E5E7EB] p-4">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-50 border border-gray-200"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">
                      {item.brand}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 font-heading">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-mono">
                      EU {item.size} • Qty {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="font-mono font-bold text-xs text-gray-900">
                  {CURRENCY_SYMBOL}{(item.salePrice * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E5E7EB] text-xs">
          <div>
            <span className="font-mono text-gray-400 uppercase text-[10px] block mb-1">
              Shipping Address
            </span>
            <div className="text-gray-800 space-y-0.5 font-medium">
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.landmark && <p>Near {order.shippingAddress.landmark}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
              <p className="font-mono text-gray-500 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="space-y-2 sm:text-right">
            <span className="font-mono text-gray-400 uppercase text-[10px] block mb-1">
              Payment Summary
            </span>
            <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono text-gray-900">{CURRENCY_SYMBOL}{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
                <span>COD Handling:</span>
                <span className="font-mono text-gray-900">+{CURRENCY_SYMBOL}{order.codFee}</span>
              </div>
            )}
            <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
              <span>Shipping:</span>
              <span className="text-emerald-700 font-mono font-bold uppercase">FREE</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-gray-900 pt-2 border-t border-[#E5E7EB]">
              <span>Grand Total:</span>
              <span className="font-mono text-base font-black text-gray-900">
                {CURRENCY_SYMBOL}{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Airway Tracking notice */}
        {order.trackingLink && (
          <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Truck className="w-4 h-4 text-black" />
              <span>Tracking details have also been sent to <span className="font-semibold">{order.userEmail}</span></span>
            </div>
            <a
              href={order.trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono font-bold text-black hover:underline"
            >
              <span>Track Live</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('account')}
          className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold uppercase text-xs rounded-xl tracking-wider transition min-h-[44px]"
        >
          View in My Account
        </button>
        <button
          onClick={() => onNavigate('products')}
          className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs rounded-xl tracking-wider transition flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
