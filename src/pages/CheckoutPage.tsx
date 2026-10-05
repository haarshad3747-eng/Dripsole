import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Coins, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import type { PaymentMethodType, ShippingAddress, Order, StoreSettings } from '../types';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../config';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigate: (tab: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Address State
  const [address, setAddress] = useState<ShippingAddress>(() => {
    try {
      const saved = localStorage.getItem('dripsole_shipping_address');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: user?.displayName || '',
      phone: '',
      secondaryPhone: '',
      email: user?.email || '',
      addressLine1: '',
      landmark: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    };
  });

  // Store Settings (Fetched from Firestore)
  const [settings, setSettings] = useState<StoreSettings>({
    defaultPaymentMethod: 'upi',
    codFee: 99,
    paymentMethodsEnabled: {
      upi: true,
      card: true,
      netbanking: true,
      wallets: true,
      emi: true,
      cod: true,
    }
  });

  // Payment Selection State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Processing & Error State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Fetch settings from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists()) {
          const s = snap.data() as StoreSettings;
          setSettings(s);
          setSelectedMethod(s.defaultPaymentMethod || 'upi');
        }
      } catch (err) {
        console.warn('Could not load store settings', err);
      }
    };
    fetchSettings();
  }, []);

  // Calculate totals
  const isCod = selectedMethod === 'cod';
  const codFee = isCod ? (settings.codFee || 99) : 0;
  const grandTotal = subtotal + codFee;

  // Check how many payment methods are enabled
  const enabledCount = Object.values(settings.paymentMethodsEnabled || {}).filter(Boolean).length;
  const isEmiAvailable = grandTotal >= 3000 && settings.paymentMethodsEnabled.emi;

  // Pay button label
  const getButtonText = () => {
    if (isProcessing) return 'Verifying Payment...';
    if (selectedMethod === 'upi') return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')} via UPI`;
    if (selectedMethod === 'cod') return `Confirm Cash on Delivery (${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')})`;
    if (selectedMethod === 'card') return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')} via Card`;
    if (selectedMethod === 'netbanking') return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')} via Net Banking`;
    if (selectedMethod === 'wallets') return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')} via Wallet`;
    if (selectedMethod === 'emi') return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')} on Easy EMI`;
    return `Pay ${CURRENCY_SYMBOL}${grandTotal.toLocaleString('en-IN')}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPaymentFailed(false);

    // Validate phone and pincode
    const cleanPhone = address.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    const cleanPincode = address.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your bag is empty. Please add sneakers to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      // Save address locally for convenience
      try {
        localStorage.setItem('dripsole_shipping_address', JSON.stringify(address));
      } catch {}

      // Simulate Razorpay Gateway authentication & webhook verification delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const orderPayload: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest_' + Math.random().toString(36).substring(2, 9),
        customerEmail: address.email,
        customerName: address.fullName,
        userEmail: address.email,
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          brand: it.brand,
          size: it.size,
          price: it.salePrice,
          salePrice: it.salePrice,
          quantity: it.quantity,
          image: it.image
        })),
        shippingAddress: address,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'cod' ? 'COD' : 'Paid',
        orderStatus: 'Processing',
        subtotal: subtotal,
        shippingFee: 0,
        codFee: codFee,
        discount: 0,
        totalAmount: grandTotal,
        trackingLink: 'https://bluedart.com/tracking?ref=DS' + Math.floor(100000 + Math.random() * 900000),
        razorpayPaymentId: selectedMethod !== 'cod' ? 'pay_drip_' + Math.random().toString(36).substring(2, 10) : undefined,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      const createdOrder: Order = {
        ...orderPayload,
        id: docRef.id
      };

      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      console.warn('Order submission notice:', err);
      setErrorMessage('Transaction could not be completed. Please try again or switch method.');
      setPaymentFailed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center bg-white text-gray-900">
        <h2 className="text-2xl font-black font-heading uppercase text-gray-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 text-xs mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl min-h-[44px]"
        >
          Explore Sneakers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6 mb-8">
        <div>
          <button
            onClick={() => onNavigate('cart')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-2 min-h-[32px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
            Checkout · {CURRENCY_SYMBOL}{grandTotal.toLocaleString('en-IN')}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold hidden sm:inline">256-Bit Razorpay Protected</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Delivery Address & Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-heading font-black text-base uppercase text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">Pan India Air Dispatch</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. Aryan Malhotra"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="For tracking & invoice"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Number (WhatsApp tracking) *
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alternate Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={address.secondaryPhone || ''}
                      onChange={(e) => setAddress({ ...address, secondaryPhone: e.target.value })}
                      placeholder="Secondary contact"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address, Flat/House No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    placeholder="e.g. Flat 402, Skyline Towers, Linking Road"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.landmark || ''}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="Nearby landmark"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="number"
                      required
                      pattern="[0-9]{6}"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="6-digit PIN"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Choose Payment Method Card */}
            <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-heading font-black text-base uppercase text-gray-900">
                    Payment Method
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Razorpay Verified</span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* UPI Primary Method (Google Pay, PhonePe, Paytm, BHIM, UPI ID) */}
              {settings.paymentMethodsEnabled.upi && (
                <div className="space-y-3 mb-4">
                  <div
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      selectedMethod === 'upi'
                        ? 'bg-white border-black shadow-sm ring-1 ring-black'
                        : 'bg-white/70 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 text-black flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <span>UPI (Instant Zero-Fee)</span>
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              FASTEST
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Google Pay, PhonePe, Paytm, BHIM or any UPI ID
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedMethod === 'upi' ? 'border-black bg-black' : 'border-gray-300'
                      }`}>
                        {selectedMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {selectedMethod === 'upi' && (
                      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'gpay', name: 'Google Pay' },
                          { id: 'phonepe', name: 'PhonePe' },
                          { id: 'paytm', name: 'Paytm' },
                          { id: 'bhim', name: 'BHIM / Any' },
                        ].map((app) => (
                          <button
                            type="button"
                            key={app.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedUpiApp(app.id); }}
                            className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition min-h-[44px] ${
                              selectedUpiApp === app.id
                                ? 'bg-black text-white border-black'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                            }`}
                          >
                            {app.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* More payment options toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-semibold min-h-[38px] transition"
                >
                  <span>{showMoreOptions ? 'Hide other options' : 'More payment options'}</span>
                  {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMoreOptions && (
                  <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
                    {/* Cards */}
                    {settings.paymentMethodsEnabled.card && (
                      <div
                        onClick={() => setSelectedMethod('card')}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedMethod === 'card'
                            ? 'bg-white border-black shadow-sm ring-1 ring-black'
                            : 'bg-white/70 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Credit / Debit Card</span>
                            <span className="text-[10px] text-gray-500">Visa, Mastercard, RuPay, Amex</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod === 'card' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}

                    {/* Net Banking */}
                    {settings.paymentMethodsEnabled.netbanking && (
                      <div
                        onClick={() => setSelectedMethod('netbanking')}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedMethod === 'netbanking'
                            ? 'bg-white border-black shadow-sm ring-1 ring-black'
                            : 'bg-white/70 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Net Banking</span>
                            <span className="text-[10px] text-gray-500">HDFC, ICICI, SBI, Axis & 50+ Banks</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod === 'netbanking' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedMethod === 'netbanking' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}

                    {/* Wallets */}
                    {settings.paymentMethodsEnabled.wallets && (
                      <div
                        onClick={() => setSelectedMethod('wallets')}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedMethod === 'wallets'
                            ? 'bg-white border-black shadow-sm ring-1 ring-black'
                            : 'bg-white/70 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Wallets</span>
                            <span className="text-[10px] text-gray-500">Paytm, Mobikwik, Amazon Pay</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod === 'wallets' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedMethod === 'wallets' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}

                    {/* EMI */}
                    {isEmiAvailable && (
                      <div
                        onClick={() => setSelectedMethod('emi')}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedMethod === 'emi'
                            ? 'bg-white border-black shadow-sm ring-1 ring-black'
                            : 'bg-white/70 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Coins className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Easy EMI</span>
                            <span className="text-[10px] text-gray-500">Available on orders above ₹3,000</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod === 'emi' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedMethod === 'emi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}

                    {/* Cash on Delivery */}
                    {settings.paymentMethodsEnabled.cod && (
                      <div
                        onClick={() => setSelectedMethod('cod')}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedMethod === 'cod'
                            ? 'bg-white border-black shadow-sm ring-1 ring-black'
                            : 'bg-white/70 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-gray-700" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                              <span className="text-[10px] font-mono text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                +₹{settings.codFee || 99} verification fee
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500">Pay cash or UPI at your doorstep</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedMethod === 'cod' ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Order Summary & Place Order */}
          <div className="space-y-4">
            <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-6 text-gray-900 space-y-4">
              <h2 className="font-heading font-black text-lg uppercase tracking-wide border-b border-[#E5E7EB] pb-3 text-gray-900">
                Order Review
              </h2>

              {/* Item preview */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-1 text-xs">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-[#E5E7EB] bg-white" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">EU {item.size} • Qty {item.quantity}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {CURRENCY_SYMBOL}{(item.salePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E5E7EB] pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-900">{CURRENCY_SYMBOL}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-mono uppercase font-bold">FREE</span>
                </div>
                {isCod && (
                  <div className="flex justify-between text-gray-600">
                    <span>Cash on Delivery Handling</span>
                    <span className="font-mono text-gray-900">{CURRENCY_SYMBOL}{codFee}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E7EB] pt-4 flex items-baseline justify-between">
                <span className="font-heading text-sm font-bold uppercase text-gray-700">Total:</span>
                <span className="font-mono text-2xl font-black text-gray-900">
                  {CURRENCY_SYMBOL}{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-extrabold uppercase text-xs sm:text-sm tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md min-h-[48px] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </span>
                ) : (
                  <span>{getButtonText()}</span>
                )}
              </button>

              {paymentFailed && (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase rounded-lg border border-gray-300 transition"
                >
                  Try Again
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-bit SSL encrypted • Instant Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
