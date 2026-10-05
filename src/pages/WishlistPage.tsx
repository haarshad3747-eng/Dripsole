import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCY_SYMBOL } from '../config';
import type { Product } from '../types';

interface WishlistPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onNavigate }) => {
  const { wishlistProducts, toggleWishlist, addToCart, setShowAuthModal } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white text-gray-900">
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-gray-400 mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-heading uppercase text-gray-900 mb-2">
          Your Wishlist Awaits
        </h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Sign in with your Google account to save grails, track restocks, and keep your sneaker rotation synced across devices.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full py-3.5 px-6 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition min-h-[44px] shadow-sm active:scale-95"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center bg-white text-gray-900">
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-gray-400 mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-heading uppercase text-gray-900 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Tap the heart icon on any kick to save it to your personal wishlist.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition min-h-[44px]"
        >
          Explore Drops
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6 mb-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
            Saved Sneakers
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight mt-1">
            My Wishlist ({wishlistProducts.length})
          </h1>
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition min-h-[44px]"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlistProducts.map((product) => {
          const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
          const isSoldOut = product.isSoldOut || totalStock <= 0;
          const defaultSize = Object.keys(product.sizes || {}).find(s => (product.sizes?.[s] || 0) > 0) || '41';

          return (
            <div
              key={product.id}
              className="bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between group"
            >
              {/* Product Image */}
              <div
                onClick={() => onSelectProduct(product)}
                className="relative aspect-square bg-[#F3F4F6] cursor-pointer overflow-hidden"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {isSoldOut ? (
                  <span className="absolute top-2.5 left-2.5 bg-gray-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                    Sold Out
                  </span>
                ) : product.price > product.salePrice ? (
                  <span className="absolute top-2.5 left-2.5 bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-tight">
                    Save {CURRENCY_SYMBOL}{(product.price - product.salePrice).toLocaleString('en-IN')}
                  </span>
                ) : null}
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 uppercase mb-1">
                    <span>{product.brand}</span>
                    <span>{product.gender}</span>
                  </div>
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-xs sm:text-sm font-bold text-gray-900 hover:text-black line-clamp-1 font-heading cursor-pointer mb-2"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base font-mono font-black text-gray-900">
                      {CURRENCY_SYMBOL}{product.salePrice.toLocaleString('en-IN')}
                    </span>
                    {product.price > product.salePrice && (
                      <span className="text-xs text-gray-400 line-through font-mono">
                        {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Small compact Add to Cart button next to remove button */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-400 hover:text-red-600 flex items-center justify-center transition min-w-[40px] min-h-[40px]"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    disabled={isSoldOut}
                    onClick={() => addToCart(product, defaultSize, 1)}
                    className={`h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex-1 flex items-center justify-center gap-1.5 transition min-h-[40px] ${
                      isSoldOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-black hover:bg-gray-800 text-white shadow-xs'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
