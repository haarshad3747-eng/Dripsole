import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import type { Product } from '../types';
import { WHATSAPP_NUMBER, BRAND_NAME, CURRENCY_SYMBOL } from '../config';

interface WhatsAppModalProps {
  product: Product;
  selectedSize: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  product,
  selectedSize,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobile1, setMobile1] = useState('');
  const [mobile2, setMobile2] = useState('');
  const [size, setSize] = useState(selectedSize || Object.keys(product.sizes || {})[0] || '41');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `*New Order Request via ${BRAND_NAME} WhatsApp Desk* 👟🔥
    
*Product*: ${product.name}
*Brand*: ${product.brand}
*Size*: EU ${size} (UK/Europe sizing)
*Price*: ${CURRENCY_SYMBOL}${product.salePrice.toLocaleString('en-IN')}

*Delivery Details*:
*Name*: ${name}
*Address*: ${address}
*Landmark*: ${landmark || 'N/A'}
*City*: ${city}
*Pincode*: ${pincode}
*Primary Mobile*: ${mobile1}
*Alternate Mobile*: ${mobile2 || 'None'}

Please confirm availability and share payment link / COD confirmation. Thank you!`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl p-6 sm:p-7 text-gray-900 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg uppercase tracking-tight text-gray-900">
              Direct Order via WhatsApp
            </h3>
            <p className="text-xs text-gray-500">
              Instant concierge confirmation & priority dispatch.
            </p>
          </div>
        </div>

        {/* Product Summary Preview */}
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center gap-3 mb-5">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl bg-white border border-gray-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate text-gray-900">{product.name}</h4>
            <p className="text-xs text-gray-900 font-mono font-bold mt-0.5">
              {CURRENCY_SYMBOL}{product.salePrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan Malhotra"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Selected Size (EU) *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              >
                {Object.entries(product.sizes || {}).map(([s, qty]) => (
                  <option key={s} value={s}>
                    EU {s} {qty <= 0 ? '(Out of stock)' : `(${qty} left)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Delivery Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat/House No, Building, Street"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Metro / Mall"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai / Delhi"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Pincode *
              </label>
              <input
                type="number"
                required
                pattern="[0-9]{6}"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit pin"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Mobile Number 1 *
              </label>
              <input
                type="tel"
                required
                value={mobile1}
                onChange={(e) => setMobile1(e.target.value)}
                placeholder="10-digit WhatsApp number"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Mobile Number 2 (Optional)
              </label>
              <input
                type="tel"
                value={mobile2}
                onChange={(e) => setMobile2(e.target.value)}
                placeholder="Alternate phone"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 min-h-[48px] shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Launch WhatsApp Chat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
