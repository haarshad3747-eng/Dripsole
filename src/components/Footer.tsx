import React, { useState } from 'react';
import { Send, Shield, Truck, RefreshCw, CheckCircle2, Lock, Instagram, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BRAND_NAME, BRAND_TAGLINE, INSTAGRAM_URL, SUPPORT_EMAIL } from '../config';

interface FooterProps {
  onNavigate: (tab: string, filterParams?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'subscribers'), {
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString()
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.warn('Subscription notice:', err);
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#F9FAFB] border-t border-[#E5E7EB] text-gray-700 pt-12 pb-8">
      
      {/* Brand Value Pillars (Light Theme) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-[#E5E7EB]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-black flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading">
                100% Deadstock Authentic
              </h4>
              <p className="text-[11px] text-gray-500">
                12-point legitimacy blacklight verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-black flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading">
                PAN India Express
              </h4>
              <p className="text-[11px] text-gray-500">
                Double-boxed air express delivery in 4-8 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-black flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading">
                Razorpay & UPI Secure
              </h4>
              <p className="text-[11px] text-gray-500">
                256-bit encrypted checkout. UPI, Cards & COD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-black flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading">
                7-Day Size Exchange
              </h4>
              <p className="text-[11px] text-gray-500">
                Hassle-free size exchange guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-gray-900 uppercase">
              {BRAND_NAME}
            </span>
          </div>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            {BRAND_NAME} is India’s premier sneaker and streetwear boutique. Delivering 100% verified deadstock grails, hyped retros, and collector-tier lifestyle kicks from Mumbai to Delhi, Bengaluru and beyond.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] hover:border-black text-gray-700 hover:text-black transition flex items-center justify-center min-w-[44px] min-h-[44px] shadow-xs"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <span className="text-xs text-gray-500">
              Follow our drops on Instagram
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading mb-4">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('products')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                All Sneaker Drops
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('products', { gender: ['Men'] })}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Shop Men
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('products', { gender: ['Women'] })}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Shop Women
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('account')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Order Tracking
              </button>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading mb-4">
            Policies & Info
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shipping')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Shipping Policy (India)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('returns')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Return & Refund Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('privacy')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('terms')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="text-gray-600 hover:text-black transition min-h-[32px] flex items-center"
              >
                Contact Concierge
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-heading mb-2">
            Secret Drop Access
          </h4>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Get early alerts 15 minutes before high-heat sneakers drop across India.
          </p>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>You're on the VIP list! Welcome to {BRAND_NAME}.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black min-h-[44px]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition min-h-[44px] flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Adding...' : 'Subscribe'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 text-center md:text-left">
          © {new Date().getFullYear()} {BRAND_NAME}. All prices in INR (₹). All rights reserved.
        </p>

        {/* Supported Payment Badges in Light Theme */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-gray-600">
          <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
            UPI / GPay / PhonePe
          </span>
          <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
            Paytm / BHIM
          </span>
          <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
            RuPay / Visa / Mastercard
          </span>
          <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
            Net Banking
          </span>
          <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
            COD Available
          </span>
        </div>
      </div>
    </footer>
  );
};
