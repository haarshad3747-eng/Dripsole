import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  ShieldCheck, 
  Truck, 
  Share2, 
  Send, 
  ShoppingBag, 
  Check, 
  ZoomIn, 
  X, 
  Plus, 
  Minus,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import type { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { ReviewModal } from '../components/ReviewModal';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../config';

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (tab: string, filterParams?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product: initialProduct,
  onNavigate,
}) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const { addToCart, isWishlisted, toggleWishlist, setShowAuthModal } = useCart();
  const { user } = useAuth();

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Size & Quantity state
  const availableSizes = Object.keys(product.sizes || {});
  const firstAvailableSize = availableSizes.find(s => (product.sizes?.[s] || 0) > 0) || availableSizes[0] || '41';
  const [selectedSize, setSelectedSize] = useState<string>(firstAvailableSize);
  const [quantity, setQuantity] = useState<number>(1);

  // Modals
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch updated product & reviews
  const fetchReviewsAndProduct = async () => {
    try {
      setLoadingReviews(true);
      const prodDoc = await getDoc(doc(db, 'products', product.id));
      if (prodDoc.exists()) {
        setProduct(prodDoc.data() as Product);
      }

      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', product.id)
      );
      const snap = await getDocs(q);
      const revs: Review[] = [];
      snap.forEach(d => {
        const data = d.data() as Review;
        if (!data.isHidden) {
          revs.push(data);
        }
      });
      setReviews(revs);
    } catch (err) {
      console.warn('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndProduct();
  }, [product.id]);

  const discountPercent = product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const currentSizeStock = product.sizes?.[selectedSize] ?? 0;
  const isOutOfStock = currentSizeStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ${BRAND_NAME}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate star rating distribution
  const starCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const userExistingReview = user ? reviews.find(r => r.userId === user.uid) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-black transition">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('products')} className="hover:text-black transition">Sneakers</button>
        <span>/</span>
        <button onClick={() => onNavigate('products', { brand: [product.brand] })} className="hover:text-black font-semibold transition">
          {product.brand}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Layout: Gallery on top on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
        
        {/* Left: Gallery Component */}
        <div className="space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] group">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discountPercent > 0 && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 font-mono text-xs font-black px-3 py-1 rounded-md uppercase tracking-tight shadow-xs">
                  SAVE {discountPercent}%
                </span>
              )}
              {product.isHyped && (
                <span className="bg-white/90 backdrop-blur-xs border border-gray-300 text-gray-900 font-mono text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-xs">
                  Verified Grail
                </span>
              )}
            </div>

            {/* Zoom Action Button */}
            <button
              onClick={() => setZoomModalOpen(true)}
              className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-gray-300 text-gray-700 hover:text-black flex items-center justify-center transition shadow-sm min-w-[44px] min-h-[44px]"
              aria-label="Zoom image"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 bg-[#F3F4F6] min-w-[56px] min-h-[56px] ${
                    activeImageIndex === idx
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details and Purchase Box */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Brand & Share */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                {product.brand} • {product.gender}
              </span>
              <button
                onClick={handleShare}
                className="text-gray-500 hover:text-black p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-gray-900 tracking-tight uppercase leading-tight">
              {product.name}
            </h1>

            {/* Star Rating & Review Link */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900 font-mono">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-gray-500">
                ({reviews.length || product.reviewCount || 12} customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-gray-900 tracking-tight">
                {CURRENCY_SYMBOL}{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.price > product.salePrice && (
                <span className="text-lg text-gray-400 line-through font-mono">
                  {CURRENCY_SYMBOL}{product.price.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded">
                  Save {CURRENCY_SYMBOL}{(product.price - product.salePrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 font-mono">
              Inclusive of all taxes. Free insured double-boxed air delivery across India.
            </p>

            {/* Size Selector */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold font-mono uppercase text-gray-900 tracking-wider">
                  Select Size (EU)
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  EU {selectedSize} {currentSizeStock > 0 ? `(${currentSizeStock} left)` : '(Sold Out)'}
                </span>
              </div>

              {/* Sizes Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(sizeKey => {
                  const stock = product.sizes?.[sizeKey] ?? 0;
                  const isAvailable = stock > 0;
                  const isSelected = selectedSize === sizeKey;

                  return (
                    <button
                      key={sizeKey}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(sizeKey)}
                      className={`h-11 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center relative min-h-[44px] ${
                        isSelected
                          ? 'bg-black text-white shadow-sm'
                          : isAvailable
                          ? 'bg-white border border-gray-300 text-gray-800 hover:border-black'
                          : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                      }`}
                    >
                      {sizeKey}
                    </button>
                  );
                })}
              </div>

              {/* Sizing Note as requested */}
              <p className="text-[11px] text-gray-500 mt-2 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All sizes follow UK and Europe sizing. True to size fit recommended.
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold font-mono uppercase text-gray-900 tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-black min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-mono font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentSizeStock || 5, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-black min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Requirement: Compact Add to Cart Button (auto width, not full-width, ~44px tall, placed next to wishlist heart) */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2.5">
                
                {/* Small Compact Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`h-11 px-6 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition duration-200 min-h-[44px] shadow-sm ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                      : 'bg-black hover:bg-gray-800 text-white active:scale-95'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </button>

                {/* Wishlist Heart Button placed right next to it */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle Wishlist"
                  className="w-11 h-11 rounded-xl border border-gray-300 hover:border-black bg-white flex items-center justify-center text-gray-700 hover:text-black transition min-w-[44px] min-h-[44px] shadow-xs"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted(product.id) ? 'fill-rose-600 text-rose-600' : 'text-gray-500'
                    }`}
                  />
                </button>
              </div>

              {/* "Order via WhatsApp" button */}
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(true)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-emerald-300 hover:border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>Order via WhatsApp (Instant Checkout)</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E7EB] text-center">
              <div className="p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <ShieldCheck className="w-5 h-5 text-gray-800 mx-auto mb-1" />
                <span className="text-[10px] font-mono uppercase font-bold text-gray-900 block">
                  Secure Checkout
                </span>
                <span className="text-[9px] text-gray-500">256-bit Razorpay</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <Sparkles className="w-5 h-5 text-gray-800 mx-auto mb-1" />
                <span className="text-[10px] font-mono uppercase font-bold text-gray-900 block">
                  100% Legit
                </span>
                <span className="text-[9px] text-gray-500">Verified Authentic</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <Truck className="w-5 h-5 text-gray-800 mx-auto mb-1" />
                <span className="text-[10px] font-mono uppercase font-bold text-gray-900 block">
                  Pan India Air
                </span>
                <span className="text-[9px] text-gray-500">4-8 Business Days</span>
              </div>
            </div>
          </div>

          {/* Description & Technical Details */}
          <div className="pt-6 border-t border-[#E5E7EB] space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 mb-2">
                Silhouette Story
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.details && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Specifications
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-black font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                  {product.sku && (
                    <li className="flex items-start gap-2 text-gray-500 font-mono">
                      <span className="text-black font-bold">•</span>
                      <span>SKU: {product.sku}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="pt-12 border-t border-[#E5E7EB]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4 text-black" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
              Customer Reviews ({reviews.length})
            </h2>
          </div>

          {/* Write a Review Button */}
          <div>
            {user ? (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs rounded-xl tracking-wider transition min-h-[44px] shadow-sm"
              >
                {userExistingReview ? 'Edit Your Review' : 'Write a Review'}
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-white border border-gray-300 hover:border-black text-gray-900 font-bold uppercase text-xs rounded-xl tracking-wider transition min-h-[44px]"
              >
                Sign In to Review
              </button>
            )}
          </div>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 mb-8">
          
          {/* Average Rating Block */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-[#E5E7EB]">
            <span className="text-5xl sm:text-6xl font-black font-mono text-gray-900 tracking-tight">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 my-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Based on {reviews.length} authentic verified reviews
            </p>
          </div>

          {/* Star Breakdown Bars */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-2">
            {starCounts.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-mono text-gray-600 text-right">{stars} Star</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 font-mono text-gray-400 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Sorting & Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono uppercase text-gray-500">
            Showing {sortedReviews.length} reviews
          </span>
          <select
            value={reviewSort}
            onChange={(e) => setReviewSort(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black min-h-[40px]"
          >
            <option value="newest">Sort: Most Recent</option>
            <option value="highest">Sort: Highest Rating</option>
            <option value="lowest">Sort: Lowest Rating</option>
          </select>
        </div>

        {/* Review Cards List */}
        <div className="space-y-3">
          {sortedReviews.length === 0 ? (
            <div className="p-8 text-center bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]">
              <p className="text-xs text-gray-500">
                No reviews yet for this sneaker. Be the first to share your on-foot thoughts!
              </p>
            </div>
          ) : (
            sortedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 sm:p-6 bg-white border border-[#E5E7EB] rounded-2xl space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-black font-bold flex items-center justify-center text-sm">
                        {rev.userName[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{rev.userName}</h4>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user?.uid === rev.userId && (
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="text-xs text-black font-bold hover:underline min-h-[32px] flex items-center"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Review Title & Comment */}
                <h5 className="text-sm font-bold text-gray-900 font-heading">{rev.title}</h5>
                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>

                {/* Attached photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {rev.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Image Zoom Modal */}
      {zoomModalOpen && (
        <div
          onClick={() => setZoomModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={product.images[activeImageIndex]}
            alt={product.name}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Modals */}
      <WhatsAppModal
        product={product}
        selectedSize={selectedSize}
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
      />

      <ReviewModal
        product={product}
        existingReview={userExistingReview}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewSaved={fetchReviewsAndProduct}
      />
    </div>
  );
};
