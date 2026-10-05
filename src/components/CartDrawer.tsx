import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CURRENCY_SYMBOL } from '../config';

interface CartDrawerProps {
  onNavigate: (tab: string) => void;
  onOpenPayment?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate, onOpenPayment }) => {
  const { 
    isDrawerOpen, 
    closeDrawer, 
    items, 
    subtotal, 
    removeFromCart, 
    updateQuantity, 
    lastAddedItem 
  } = useCart();

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeDrawer();
    if (onOpenPayment) {
      onOpenPayment();
    } else {
      onNavigate('checkout');
    }
  };

  const handleViewCartClick = () => {
    closeDrawer();
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white border-l border-[#E5E7EB] text-gray-900 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg uppercase tracking-tight text-gray-900 leading-none">
                  Your Cart
                </h2>
                <span className="text-[11px] font-mono text-gray-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Recently Added Banner Alert */}
          {lastAddedItem && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
              <span className="font-semibold">Item added to your cart</span>
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                Size EU {lastAddedItem.size}
              </span>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#F3F4F6] border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-lg font-black text-gray-900 uppercase">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mb-6">
                  Check out our latest sneaker drops and claim your pair.
                </p>
                <button
                  onClick={() => { closeDrawer(); onNavigate('products'); }}
                  className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl tracking-wider min-h-[44px] transition shadow-xs"
                >
                  Explore Drops
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="py-4 flex gap-3.5 first:pt-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1 font-heading">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-gray-400 hover:text-red-600 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700 border border-gray-200">
                          EU {item.size}
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {CURRENCY_SYMBOL}{item.salePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, -1)}
                          className="p-1.5 hover:bg-gray-200 text-gray-600 hover:text-black min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, 1)}
                          className="p-1.5 hover:bg-gray-200 text-gray-600 hover:text-black min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Full-width Horizontal Bar Checkout Button Section */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-white sticky bottom-0 space-y-3 shadow-lg">
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Requirement: Full-width horizontal bar button showing "Checkout · ₹[total]" with arrow icon */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs sm:text-sm tracking-wider rounded-2xl transition flex items-center justify-between shadow-md min-h-[50px] active:scale-[0.99]"
              >
                <span>Checkout · {CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={handleViewCartClick}
                  className="text-gray-500 hover:text-black font-semibold underline min-h-[32px] flex items-center"
                >
                  View Full Cart
                </button>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free insured air dispatch</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
