import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAddedItem: CartItem | null;
  wishlistIds: string[];
  wishlistProducts: Product[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kv_cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items]);

  // Sync wishlist from Firestore when user is signed in
  useEffect(() => {
    if (!user) {
      setWishlistProducts([]);
      return;
    }

    const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
    const unsubscribe = onSnapshot(wishlistRef, (snap) => {
      const prods: Product[] = [];
      snap.forEach((d) => {
        prods.push(d.data() as Product);
      });
      setWishlistProducts(prods);
    }, (error) => {
      console.warn('Wishlist listener error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const wishlistIds = useMemo(() => wishlistProducts.map(p => p.id), [wishlistProducts]);

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const wishDocRef = doc(db, 'users', user.uid, 'wishlist', product.id);
    try {
      if (isWishlisted(product.id)) {
        await deleteDoc(wishDocRef);
      } else {
        await setDoc(wishDocRef, {
          ...product,
          addedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/wishlist/${product.id}`);
    }
  };

  const addToCart = (product: Product, size: string, quantity = 1) => {
    const newItem: CartItem = {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || '',
      size,
      quantity,
    };

    setItems(prev => {
      const index = prev.findIndex(i => i.productId === product.id && i.size === size);
      if (index > -1) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          quantity: next[index].quantity + quantity
        };
        return next;
      }
      return [...prev, newItem];
    });

    setLastAddedItem(newItem);
    setIsDrawerOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.productId === productId && item.size === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = useMemo(() => items.reduce((acc, curr) => acc + curr.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, curr) => acc + curr.salePrice * curr.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        lastAddedItem,
        wishlistIds,
        wishlistProducts,
        isWishlisted,
        toggleWishlist,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
