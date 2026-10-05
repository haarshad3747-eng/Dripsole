import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { NewsletterModal } from './components/NewsletterModal';
import { PaymentModal } from './components/PaymentModal';

import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { StaticPages } from './pages/StaticPages';

import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_PRODUCTS } from './data/seedProducts';
import type { Product, Order, FilterState } from './types';

function StoreLayout() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [collectionFilters, setCollectionFilters] = useState<Partial<FilterState>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  const { items, subtotal, clearCart } = useCart();

  useEffect(() => {
    // Real-time listener for products collection
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (!snap.empty) {
          const prods: Product[] = [];
          snap.forEach(d => {
            prods.push({ id: d.id, ...d.data() } as Product);
          });
          setProducts(prods);
        }
        setLoadingProducts(false);
      },
      (err) => {
        console.warn('Products subscription note:', err);
        setLoadingProducts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync window hash for easy navigation / back button
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('product/')) {
        const prodId = hash.replace('product/', '');
        const found = products.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentTab('product-detail');
        }
      } else if (hash === 'admin') {
        setCurrentTab('admin');
      } else if (hash === 'cart') {
        setCurrentTab('cart');
      } else if (hash === 'checkout') {
        setCurrentTab('checkout');
      } else if (hash === 'wishlist') {
        setCurrentTab('wishlist');
      } else if (hash === 'account') {
        setCurrentTab('account');
      } else if (hash === 'products') {
        setCurrentTab('products');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products]);

  // Navigate Helper
  const handleNavigate = (tab: string, filterParams?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (filterParams) {
      setCollectionFilters(filterParams);
    } else {
      setCollectionFilters({});
    }
    setCurrentTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentTab('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = `product/${product.id}`;
  };

  const handleOpenProductById = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      handleSelectProduct(found);
    } else {
      handleNavigate('products');
    }
  };

  const handleOrderSuccess = (order: Order) => {
    clearCart();
    setIsPaymentPopupOpen(false);
    setLastPlacedOrder(order);
    setCurrentTab('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (queryText: string) => {
    setCollectionFilters({ searchQuery: queryText });
    setCurrentTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* Main Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
      />

      {/* Dynamic Page Rendering */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'products' && (
          <CollectionPage
            products={products}
            initialFilters={collectionFilters}
            onSelectProduct={handleSelectProduct}
            loading={loadingProducts}
          />
        )}

        {currentTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'cart' && (
          <CartPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'confirmation' && lastPlacedOrder && (
          <OrderConfirmationPage
            order={lastPlacedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'account' && (
          <AccountPage
            onNavigate={handleNavigate}
            onOpenProductById={handleOpenProductById}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            onNavigate={handleNavigate}
            onRefreshCatalog={() => {}}
          />
        )}

        {['about', 'contact', 'shipping', 'returns', 'privacy', 'terms'].includes(currentTab) && (
          <StaticPages
            type={currentTab as any}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Cart Drawer with Checkout opening the Payment popup */}
      <CartDrawer
        onNavigate={handleNavigate}
        onOpenPayment={() => setIsPaymentPopupOpen(true)}
      />

      {/* Real Google Auth Modal */}
      <AuthModal />

      {/* High-impact VIP Newsletter Subscription Lead Modal (Appears once to new visitors) */}
      <NewsletterModal />

      {/* Requirement 4: Sleek Payment Popup after tapping Checkout */}
      <PaymentModal
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        items={items}
        subtotal={subtotal}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreLayout />
      </CartProvider>
    </AuthProvider>
  );
}
