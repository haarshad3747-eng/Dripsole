import React, { useState } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  updateDoc 
} from 'firebase/firestore';
import type { Product, Review } from '../types';

interface ReviewModalProps {
  product: Product;
  existingReview?: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSaved: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  product,
  existingReview,
  isOpen,
  onClose,
  onReviewSaved
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>(existingReview?.photos || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleAddPhoto = () => {
    if (photoUrl.trim() && photoUrl.startsWith('http')) {
      setPhotos([...photos, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !title.trim() || !comment.trim()) {
      setError('Please provide a rating, title, and review description.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Check for verified purchase (delivered order containing this product)
      let verifiedPurchase = false;
      try {
        const orderQ = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          where('orderStatus', '==', 'Delivered')
        );
        const orderSnap = await getDocs(orderQ);
        orderSnap.forEach(d => {
          const ord = d.data();
          if (ord.items && ord.items.some((it: any) => it.productId === product.id)) {
            verifiedPurchase = true;
          }
        });
      } catch (err) {
        console.warn('Could not check verified purchase status', err);
      }

      const reviewId = existingReview ? existingReview.id : `${product.id}_${user.uid}`;
      const reviewDocRef = doc(db, 'reviews', reviewId);

      const reviewPayload: Review = {
        id: reviewId,
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Sneaker Fan',
        userAvatar: user.photoURL || '',
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos,
        verifiedPurchase: verifiedPurchase || existingReview?.verifiedPurchase || false,
        isHidden: false,
        createdAt: existingReview?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(reviewDocRef, reviewPayload);

      // Recalculate and update product rating & review count
      try {
        const allReviewsSnap = await getDocs(
          query(collection(db, 'reviews'), where('productId', '==', product.id))
        );
        let total = 0;
        let count = 0;
        allReviewsSnap.forEach(snapDoc => {
          const r = snapDoc.data() as Review;
          if (!r.isHidden) {
            total += r.rating;
            count++;
          }
        });
        const newAvg = count > 0 ? Number((total / count).toFixed(1)) : 5.0;
        await updateDoc(doc(db, 'products', product.id), {
          rating: newAvg,
          reviewCount: count
        });
      } catch (err) {
        console.warn('Could not update aggregated product rating', err);
      }

      onReviewSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
      handleFirestoreError(err, OperationType.WRITE, `reviews/${product.id}_${user.uid}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      setSubmitting(true);
      await deleteDoc(doc(db, 'reviews', existingReview.id));
      onReviewSaved();
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${existingReview.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl p-6 sm:p-7 text-gray-900 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-heading font-black text-xl uppercase tracking-tight text-gray-900 mb-1">
          {existingReview ? 'Edit Your Sneaker Review' : 'Write a Sneaker Review'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Reviewing: <span className="text-black font-semibold">{product.name}</span>
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Overall Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label={`${star} Stars`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono text-sm font-bold text-gray-900">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              Review Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cleanest silhouette in my rotation!"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              Your Review
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Materials, comfort, on-foot feel, and sizing tips..."
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              Photo URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl text-xs font-semibold min-h-[44px]"
              >
                Add
              </button>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {existingReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition min-h-[44px]"
              >
                Delete Review
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs text-gray-600 hover:text-black rounded-xl border border-gray-300 hover:bg-gray-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition min-h-[44px] shadow-xs"
              >
                {submitting ? 'Saving...' : existingReview ? 'Update Review' : 'Post Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
