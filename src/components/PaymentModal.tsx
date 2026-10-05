import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Wallet, 
  Coins, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import type { PaymentMethodType, ShippingAddress, Order, StoreSettings, CartItem } from '../types';
import { CURRENCY_SYMBOL, BRAND_NAME } from '../config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  initialAddress?: ShippingAddress | null;
  onOrderSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  initialAddress,
  onOrderSuccess,
}) => {
  const { user } = useAuth();

  // Settings
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

  // Step: 'address' | 'payment' | 'processing' | 'failed'
  const isAddressComplete = (addr?: ShippingAddress | null) => {
    return Boolean(
      addr?.fullName?.trim() &&
      addr?.phone?.trim() &&
      addr?.addressLine1?.trim() &&
      addr?.pincode?.trim() &&
      addr?.city?.trim()
    );
  };

  const [step, setStep] = useState<'address' | 'payment' | 'processing' | 'failed'>(
    isAddressComplete(initialAddress) ? 'payment' : 'address'
  );

  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (initialAddress && isAddressComplete(initialAddress)) return initialAddress;
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

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch settings from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists()) {
          setSettings(snap.data() as StoreSettings);
        }
      } catch (err) {
        console.warn('Settings load notice:', err);
      }
    };
    fetchSettings();
  }, []);

  // Update step when opened or address changes
  useEffect(() => {
    if (isOpen) {
      setStep(isAddressComplete(address) ? 'payment' : 'address');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCod = selectedMethod === 'cod';
  const codFee = isCod ? (settings.codFee || 99) : 0;
  const grandTotal = subtotal + codFee;
  const isEmiAvailable = grandTotal >= 3000 && settings.paymentMethodsEnabled.emi;

  const handleSaveAddressAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName.trim() || !address.phone.trim() || !address.addressLine1.trim() || !address.pincode.trim() || !address.city.trim()) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }
    try {
      localStorage.setItem('dripsole_shipping_address', JSON.stringify(address));
    } catch {}
    setErrorMessage(null);
    setStep('payment');
  };

  const handleExecutePayment = async (method: PaymentMethodType, upiAppOrId?: string) => {
    try {
      setSelectedMethod(method);
      setStep('processing');
      setErrorMessage(null);

      // Simulated Razorpay API checkout and verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderPayload: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest_' + Date.now(),
        customerEmail: address.email.trim() || 'customer@dripsole.in',
        customerName: address.fullName.trim(),
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          brand: it.brand,
          size: it.size,
          price: it.price || it.salePrice,
          salePrice: it.salePrice,
          quantity: it.quantity,
          image: it.image
        })),
        shippingAddress: address,
        paymentMethod: method,
        paymentStatus: method === 'cod' ? 'COD' : 'Paid',
        orderStatus: 'Processing',
        subtotal,
        codFee,
        discount: 0,
        totalAmount: grandTotal,
        trackingLink: 'https://bluedart.com/tracking?ref=DS' + Math.floor(100000 + Math.random() * 900000),
        razorpayPaymentId: method !== 'cod' ? 'pay_drip_' + Math.random().toString(36).substring(2, 10) : undefined,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      const createdOrder: Order = {
        ...orderPayload,
        id: docRef.id
      };

      onOrderSuccess(createdOrder);
      onClose();
    } catch (err: any) {
      console.warn('Payment failed:', err);
      setErrorMessage('Payment was not completed. Please try again or switch to another method.');
      setStep('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal / Bottom Sheet Card */}
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header with Title, Total, and Close */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                {step === 'address' ? 'Step 1 of 2' : 'Secure Razorpay Checkout'}
              </span>
            </div>
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-gray-900 mt-0.5">
              {step === 'address' ? 'Delivery Address' : 'Choose payment method'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block -mb-0.5">Total</span>
              <span className="font-mono font-black text-base text-gray-900">
                {CURRENCY_SYMBOL}{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center border border-gray-200 transition"
              aria-label="Close payment modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* STEP 1: Quick Address Form */}
          {step === 'address' && (
            <form onSubmit={handleSaveAddressAndContinue} className="space-y-3.5">
              <p className="text-xs text-gray-500">
                Where should we dispatch your authenticated pair?
              </p>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Phone (for tracking & OTP) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  placeholder="Order updates & tax invoice"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="Flat/House No., Building, Street"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
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
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="6-digit PIN"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 min-h-[48px] shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Choose Payment Method */}
          {step === 'payment' && (
            <div className="space-y-4">
              
              {/* Address Quick Preview / Edit */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <span className="font-bold text-gray-900 block truncate">{address.fullName}</span>
                  <span className="text-gray-500 truncate block text-[11px]">
                    {address.addressLine1}, {address.city} - {address.pincode}
                  </span>
                </div>
                <button
                  onClick={() => setStep('address')}
                  className="text-xs font-bold text-black hover:underline shrink-0 px-2 py-1"
                >
                  Change
                </button>
              </div>

              {/* UPI Options (Apps First) */}
              {settings.paymentMethodsEnabled.upi && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant UPI Apps (Recommended)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      0% Fees • Instant
                    </span>
                  </div>

                  {/* UPI App Tiles */}
                  <div className="grid grid-cols-2 gap-2">
                    
                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => handleExecutePayment('upi', 'gpay')}
                      className="p-3 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center gap-2.5 text-left group min-h-[52px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                        {/* GPay SVG Icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-black">
                          Google Pay
                        </span>
                        <span className="text-[10px] text-gray-500">Fast 1-tap UPI</span>
                      </div>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => handleExecutePayment('upi', 'phonepe')}
                      className="p-3 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center gap-2.5 text-left group min-h-[52px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5f259f] flex items-center justify-center shrink-0 font-black text-sm border border-indigo-100">
                        पे
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-black">
                          PhonePe
                        </span>
                        <span className="text-[10px] text-gray-500">App / QR</span>
                      </div>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => handleExecutePayment('upi', 'paytm')}
                      className="p-3 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center gap-2.5 text-left group min-h-[52px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#00b9f5] flex items-center justify-center shrink-0 font-bold text-[10px] border border-sky-100">
                        Paytm
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-black">
                          Paytm UPI
                        </span>
                        <span className="text-[10px] text-gray-500">Instant transfer</span>
                      </div>
                    </button>

                    {/* BHIM / Other UPI */}
                    <button
                      type="button"
                      onClick={() => handleExecutePayment('upi', 'bhim')}
                      className="p-3 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center gap-2.5 text-left group min-h-[52px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs border border-amber-100">
                        BHIM
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block group-hover:text-black">
                          BHIM / Cred
                        </span>
                        <span className="text-[10px] text-gray-500">Any UPI app</span>
                      </div>
                    </button>
                  </div>

                  {/* Enter UPI ID field */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 mt-1">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customUpiId}
                        onChange={(e) => setCustomUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black min-h-[40px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('upi', customUpiId || 'custom_upi')}
                        className="px-4 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl min-h-[40px]"
                      >
                        Verify & Pay
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* More Payment Options Accordion */}
              <div>
                {!showMoreOptions ? (
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(true)}
                    className="w-full py-2.5 text-xs text-gray-600 hover:text-black font-semibold flex items-center justify-center gap-1.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl transition min-h-[44px]"
                  >
                    <span>More payment options (Cards, Net Banking, COD)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-200 border-t border-gray-200">
                    
                    {/* Credit / Debit Card */}
                    {settings.paymentMethodsEnabled.card && (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('card')}
                        className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center justify-between text-left min-h-[52px]"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-700" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">Credit or Debit Card</span>
                            </div>
                            <span className="text-[10px] text-gray-500">Visa, Mastercard, RuPay, Maestro</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-black">Pay →</span>
                      </button>
                    )}

                    {/* Net Banking */}
                    {settings.paymentMethodsEnabled.netbanking && (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('netbanking')}
                        className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center justify-between text-left min-h-[52px]"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900">Net Banking</span>
                            <span className="text-[10px] text-gray-500 block">HDFC, ICICI, SBI, Axis & 50+ Banks</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-black">Pay →</span>
                      </button>
                    )}

                    {/* Digital Wallets */}
                    {settings.paymentMethodsEnabled.wallets && (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('wallets')}
                        className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center justify-between text-left min-h-[52px]"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900">Wallets</span>
                            <span className="text-[10px] text-gray-500 block">Paytm, Mobikwik, Freecharge</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-black">Pay →</span>
                      </button>
                    )}

                    {/* EMI */}
                    {isEmiAvailable && (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('emi')}
                        className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center justify-between text-left min-h-[52px]"
                      >
                        <div className="flex items-center gap-3">
                          <Coins className="w-5 h-5 text-gray-700" />
                          <div>
                            <span className="text-xs font-bold text-gray-900">Cardless / Bank EMI</span>
                            <span className="text-[10px] text-gray-500 block">Easy monthly installments</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-black">Pay →</span>
                      </button>
                    )}

                    {/* Cash on Delivery */}
                    {settings.paymentMethodsEnabled.cod && (
                      <button
                        type="button"
                        onClick={() => handleExecutePayment('cod')}
                        className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition flex items-center justify-between text-left min-h-[52px]"
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-gray-700" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                +₹{settings.codFee} handling
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 block">Pay cash or UPI at delivery doorstep</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-black">Place COD Order →</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowMoreOptions(false)}
                      className="w-full text-center text-[11px] text-gray-500 hover:text-gray-900 py-1 flex items-center justify-center gap-1"
                    >
                      <span>Show fewer options</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP: Processing State */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin mx-auto" />
              <div>
                <h3 className="font-heading font-black text-lg uppercase text-gray-900">
                  Processing Razorpay Payment
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Authorizing transaction for {CURRENCY_SYMBOL}{grandTotal.toLocaleString('en-IN')}. Please do not refresh.
                </p>
              </div>
            </div>
          )}

          {/* STEP: Failed State with Try Again */}
          {step === 'failed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg uppercase text-gray-900">
                  Payment Was Not Completed
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {errorMessage || 'The gateway transaction was cancelled or declined. You can retry or choose an alternate payment method.'}
                </p>
              </div>
              <div className="flex gap-2 max-w-xs mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 text-center flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured by Razorpay • 256-bit encrypted authentication</span>
        </div>
      </div>
    </div>
  );
};
