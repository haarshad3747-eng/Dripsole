import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Truck, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BRAND_NAME, SUPPORT_EMAIL, WHATSAPP_NUMBER, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../config';

interface StaticPageProps {
  type: 'about' | 'contact' | 'shipping' | 'returns' | 'privacy' | 'terms';
  onNavigate: (tab: string) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white text-gray-900">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
            Concierge Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-heading uppercase tracking-tight mt-1 mb-3 text-gray-900">
            Contact {BRAND_NAME}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Have a question about sizing, drop schedules, order tracking, or authentication? Our team is on standby 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Direct channels */}
          <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="font-heading font-black text-lg uppercase tracking-wide border-b border-[#E5E7EB] pb-3 text-gray-900">
              Direct Desks
            </h2>

            <div className="space-y-4 text-xs">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 bg-white hover:bg-gray-50 border border-gray-300 hover:border-black rounded-2xl transition group min-h-[50px] shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">WhatsApp VIP Concierge</span>
                  <span className="text-gray-500 font-mono">+91 98765 43210 (10 AM - 10 PM IST)</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-2xl min-h-[50px] shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Direct Email</span>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-500 font-mono hover:text-black">
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 bg-white hover:bg-gray-50 border border-gray-300 hover:border-black rounded-2xl transition min-h-[50px] shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm">IG</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Instagram DM</span>
                  <span className="text-gray-500 font-mono">{INSTAGRAM_HANDLE}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-2xl min-h-[50px] shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Vault Showroom & Fulfillment</span>
                  <span className="text-gray-500">Bandra West, Mumbai, Maharashtra 400050</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8">
            <h2 className="font-heading font-black text-lg uppercase tracking-wide border-b border-[#E5E7EB] pb-3 mb-6 text-gray-900">
              Send a Query
            </h2>

            {contactSubmitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-black text-xl uppercase text-gray-900">Message Dispatched</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Our concierge will respond to your registered email address within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message or Query</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about restocks, sizing advice, or order inquiries..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Query</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white text-gray-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
            Behind The Label
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading uppercase tracking-tight mt-1 mb-4 text-gray-900">
            About {BRAND_NAME}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Founded with one obsession: bringing 100% authentic hyped kicks and cutting-edge streetwear grails to the Indian sneakerheads without the risk of fakes or painful customs delays.
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-6 sm:p-8 bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl">
            <h2 className="font-heading font-black text-xl uppercase mb-3 text-gray-900">The Authenticity Standard</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              Every single pair in our inventory goes through our proprietary 12-point authentication protocol before it ever enters our vault. We inspect stitching density, UV-light watermark stamps, insole glue patterns, box labels, and production batch codes against manufacturer master archives.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              If any kick fails even one inspection metric, it never touches our store. We back every sale with a 100% money-back authenticity guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl text-center">
              <ShieldCheck className="w-8 h-8 text-black mx-auto mb-2" />
              <h3 className="font-heading font-bold text-sm uppercase text-gray-900">Verified Deadstock</h3>
              <p className="text-xs text-gray-500 mt-1">Brand new with original packaging, spare laces, and factory tags.</p>
            </div>
            <div className="p-6 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl text-center">
              <Truck className="w-8 h-8 text-black mx-auto mb-2" />
              <h3 className="font-heading font-bold text-sm uppercase text-gray-900">Pan-India Air</h3>
              <p className="text-xs text-gray-500 mt-1">Double-boxed insured express delivery across all 28 states.</p>
            </div>
            <div className="p-6 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl text-center">
              <RefreshCw className="w-8 h-8 text-black mx-auto mb-2" />
              <h3 className="font-heading font-bold text-sm uppercase text-gray-900">7-Day Size Exchange</h3>
              <p className="text-xs text-gray-500 mt-1">Smooth size swap if your fit isn't spot on upon delivery.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shipping & Policies
  const titles: Record<string, string> = {
    shipping: 'Shipping & Delivery Policy',
    returns: 'Returns & Exchange Policy',
    privacy: 'Privacy & Data Protection',
    terms: 'Terms & Conditions of Service',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white text-gray-900">
      <div className="border-b border-[#E5E7EB] pb-6 mb-8">
        <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
          {BRAND_NAME} Legal & Policies
        </span>
        <h1 className="text-2xl sm:text-4xl font-black font-heading uppercase tracking-tight mt-1 text-gray-900">
          {titles[type] || 'Store Policy'}
        </h1>
      </div>

      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
        {type === 'shipping' && (
          <>
            <p>
              All orders are dispatched from our Mumbai central temperature-controlled vault via premium express air cargo (BlueDart Air and Delhivery Express).
            </p>
            <h3 className="font-heading font-bold text-base uppercase text-gray-900">Transit Timelines</h3>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li>Metro Cities (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Kolkata): 2-4 business days.</li>
              <li>Tier 2 and Tier 3 Cities: 4-7 business days.</li>
              <li>North-East, J&K, and Remote Locations: 6-9 business days.</li>
            </ul>
            <p>
              Every pair is double-boxed with heavy-gauge corrugated outer boxes and air-cushioned bubble wrap to ensure the collector shoebox arrives in factory-mint condition.
            </p>
          </>
        )}

        {type === 'returns' && (
          <>
            <p>
              We want every sneaker purchase to be an experience you love. Because all our pairs are collectible deadstock, we offer a dedicated 7-day size replacement guarantee.
            </p>
            <h3 className="font-heading font-bold text-base uppercase text-gray-900">Conditions for Exchange</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The sneakers must remain unworn with zero crease marks on the vamp or dirt on the outsole.</li>
              <li>The original tamper-evident {BRAND_NAME} authentication hang-tag must remain intact and attached.</li>
              <li>The original shoebox, extra laces, and accessories must be returned in mint condition.</li>
            </ul>
            <p>
              To initiate an exchange, please ping our WhatsApp desk at +91 98765 43210 with your order ID.
            </p>
          </>
        )}

        {type === 'privacy' && (
          <>
            <p>
              {BRAND_NAME} respects your privacy. We collect minimal personal data strictly necessary to fulfill your sneaker deliveries, facilitate payment gateway verification via Razorpay, and transmit shipping tracking SMS/WhatsApp notifications.
            </p>
            <p>
              We do not sell, rent, or trade customer contact details with any unauthorized third parties. Payment details such as card numbers and UPI pins are processed directly on PCI-DSS certified gateway servers and never stored on our database.
            </p>
          </>
        )}

        {type === 'terms' && (
          <>
            <p>
              By accessing {BRAND_NAME}, you agree to our terms of service. All prices displayed are in Indian National Rupees (₹ / INR) inclusive of all applicable Goods and Services Tax (GST).
            </p>
            <p>
              We reserve the right to cancel orders in cases of pricing discrepancies, suspected unauthorized bot activity, or fraudulent charge attempts.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
