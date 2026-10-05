import React from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { CURRENCY_SYMBOL } from '../config';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isWishlisted, toggleWishlist, addToCart } = useCart();
  const wishlisted = isWishlisted(product.id);

  // Calculate discount percentage
  const discountPercent = product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Check if sold out: total size stock == 0 or isSoldOut flag
  const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
  const isSoldOut = product.isSoldOut || totalStock <= 0;
  const defaultSize = Object.keys(product.sizes || {}).find(s => (product.sizes?.[s] || 0) > 0) || '41';

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) {
      onSelect(product);
      return;
    }
    addToCart(product, defaultSize, 1);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col h-full bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer relative"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full bg-[#F3F4F6] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover image preview if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0"
          />
        )}

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isSoldOut ? (
            <span className="bg-gray-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-xs">
              Sold Out
            </span>
          ) : discountPercent > 0 ? (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-tight shadow-xs">
              -{discountPercent}%
            </span>
          ) : null}

          {product.isHyped && !isSoldOut && (
            <span className="bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Hyped
            </span>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 truncate">
              {product.brand}
            </span>
            <span className="text-[10px] font-mono uppercase text-gray-400">
              {product.gender}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black line-clamp-2 leading-snug mb-1.5 font-heading">
            {product.name}
          </h3>

          {/* Star Rating and Review Count */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-[11px] text-gray-400">
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        <div>
          {/* Price & Action Row */}
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            
            {/* Price */}
            <div>
              <div className="text-sm sm:text-base font-extrabold text-gray-900 font-mono tracking-tight">
                {CURRENCY_SYMBOL}{product.salePrice.toLocaleString('en-IN')}
              </div>
              {product.price > product.salePrice && (
                <div className="text-[11px] text-gray-400 line-through font-mono">
                  {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Compact Action Buttons: Add to Cart next to Wishlist Heart */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={handleHeartClick}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:scale-105 active:scale-95 transition min-w-[38px] min-h-[38px]"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    wishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-500'
                  }`}
                />
              </button>

              {/* Small Compact Add to Cart Button (auto width, not full width, ~44px tall) */}
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={isSoldOut ? 'Sold out' : 'Add to cart'}
                disabled={isSoldOut}
                className={`h-9 sm:h-10 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 min-h-[38px] min-w-[44px] ${
                  isSoldOut
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-black hover:bg-gray-800 text-white shadow-xs'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{isSoldOut ? 'Sold Out' : 'Add'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
