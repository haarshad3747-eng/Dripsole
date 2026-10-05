import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BRAND_NAME } from '../config';

export const NewsletterModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('dripsole_lead_modal_seen');
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('dripsole_lead_modal_seen', 'true');
    } catch {}
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'subscribers'), {
        email: email.trim().toLowerCase(),
        source: 'welcome_modal',
        subscribedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Subscription save notice:', err);
    } finally {
      setSubmitted(true);
      setLoading(false);
      try {
        localStorage.setItem('dripsole_lead_modal_seen', 'true');
      } catch {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-sm border border-gray-200 transition"
          aria-label="Close lead popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Visual Header / Banner */}
        <div className="relative md:w-5/12 bg-gray-100 min-h-[160px] md:min-h-[380px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
            alt="Dripsole Sneaker Drop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
              VIP Drop Alert
            </span>
            <p className="text-xs font-semibold text-gray-100 mt-1">
              Never miss a 10:00 AM sneaker drop.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-xl uppercase tracking-tight text-gray-900">
                You're On The VIP List!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Use promo code <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-300">VAULT10</span> at checkout for 10% off your first sneaker order.
              </p>
              <button
                onClick={handleDismiss}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition min-h-[44px]"
              >
                Shop Now With 10% Off
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Exclusive Welcome Perk</span>
                </div>
                <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-gray-900 leading-none">
                  GET 10% OFF YOUR FIRST PAIR
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Join 85,000+ Indian sneakerheads. Receive instant promo codes, secret shock drop links, and restock alerts.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-black hover:bg-gray-900 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 min-h-[46px] shadow-sm disabled:opacity-60"
                >
                  <span>{loading ? 'Subscribing...' : 'Claim 10% Discount'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                  No spam, ever.
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="hover:underline text-gray-500"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
