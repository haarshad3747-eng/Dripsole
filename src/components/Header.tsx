import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  Instagram, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BRAND_NAME, INSTAGRAM_URL } from '../config';
import type { SneakerBrand } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, filterParams?: any) => void;
  onSearch: (query: string) => void;
}

const BRANDS: SneakerBrand[] = [
  'Nike',
  'Adidas',
  'Air Jordan',
  'New Balance',
  'Puma',
  'Vans',
  'Converse',
  'Asics',
  'Birkenstock',
  'Crocs'
];

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onSearch }) => {
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();
  const { cartCount, wishlistIds, openDrawer, setShowAuthModal } = useCart();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sneakersDropdownOpen, setSneakersDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSneakersDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchOpen(false);
    }
  };

  const handleBrandClick = (brand: SneakerBrand) => {
    setSneakersDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('products', { brand: [brand] });
  };

  return (
    <>
      {/* Top Banner Notice (Clean Light Theme) */}
      <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wide text-gray-700 flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>FREE EXPRESS AIR DELIVERY ON ALL PRE-PAID ORDERS ACROSS INDIA (4-8 BUSINESS DAYS)</span>
        <span className="hidden md:inline-block text-gray-400">•</span>
        <span className="hidden md:inline-block text-gray-900 font-bold">100% VERIFIED AUTHENTIC</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left min-h-[44px] focus:outline-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-gray-900 uppercase flex items-center gap-0.5">
                {BRAND_NAME}
                <span className="text-rose-600">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 block -mt-1 font-mono hidden sm:block">
                Sneaker Lab
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 text-sm font-semibold tracking-wide transition-colors min-h-[44px] flex items-center ${
                currentTab === 'home' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`px-3 py-2 text-sm font-semibold tracking-wide transition-colors min-h-[44px] flex items-center ${
                currentTab === 'products' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              Products
            </button>

            {/* Sneakers Dropdown by Brand */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSneakersDropdownOpen(!sneakersDropdownOpen)}
                className={`px-3 py-2 text-sm font-semibold tracking-wide transition-colors min-h-[44px] flex items-center gap-1 ${
                  sneakersDropdownOpen ? 'text-black font-bold' : 'text-gray-600 hover:text-black'
                }`}
              >
                <span>Sneakers</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sneakersDropdownOpen ? 'rotate-180 text-black' : 'text-gray-500'}`} />
              </button>

              {sneakersDropdownOpen && (
                <div 
                  className="absolute left-0 mt-1 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ maxWidth: 'calc(100vw - 32px)' }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-3 py-1.5 border-b border-gray-100 mb-1">
                    Shop by Brand
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {BRANDS.map(brand => (
                      <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-between"
                      >
                        <span>{brand}</span>
                        <span className="text-[10px] text-gray-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('products', { gender: ['Men'] })}
              className="px-3 py-2 text-sm font-semibold tracking-wide text-gray-600 hover:text-black transition-colors min-h-[44px] flex items-center"
            >
              Shop Men
            </button>

            <button
              onClick={() => onNavigate('products', { gender: ['Women'] })}
              className="px-3 py-2 text-sm font-semibold tracking-wide text-gray-600 hover:text-black transition-colors min-h-[44px] flex items-center"
            >
              Shop Women
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="px-3 py-2 text-sm font-semibold tracking-wide text-gray-600 hover:text-black transition-colors min-h-[44px] flex items-center"
            >
              Contact
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Search Bar / Input */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search kicks, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-44 sm:w-64 bg-gray-100 border border-gray-300 rounded-full py-1.5 pl-3.5 pr-8 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Search sneakers"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Instagram Link */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] hidden sm:flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>

            {/* Wishlist Icon with Count */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2.5 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-black text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Icon with Item Count */}
            <button
              onClick={openDrawer}
              className="p-2.5 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-black text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Google Login */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-gray-300 hover:border-black transition-colors min-w-[44px] min-h-[44px] justify-center"
                  aria-label="User Account"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-black hover:bg-gray-800 text-white rounded-xl transition-all min-h-[44px] shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Log in</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && user && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ maxWidth: 'calc(100vw - 32px)' }}
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.displayName || 'Sneakerhead'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-black text-white rounded uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('account'); }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>My Account & Orders</span>
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('wishlist'); }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>Wishlist ({wishlistIds.length})</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('admin'); }}
                        className="w-full text-left px-3 py-2 text-xs text-black font-bold hover:bg-gray-100 rounded-xl flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-black" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={async () => { setUserDropdownOpen(false); await logout(); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="space-y-1 mb-4">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
                className="w-full text-left py-2.5 px-3 text-sm font-bold text-gray-900 hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center"
              >
                Home
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('products'); }}
                className="w-full text-left py-2.5 px-3 text-sm font-bold text-gray-900 hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center"
              >
                All Products
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('products', { gender: ['Men'] }); }}
                className="w-full text-left py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center"
              >
                Shop Men
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('products', { gender: ['Women'] }); }}
                className="w-full text-left py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center"
              >
                Shop Women
              </button>

              {/* Mobile Brands Accordion */}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 px-3 mb-1">
                  Sneaker Brands
                </p>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {BRANDS.map(brand => (
                    <button
                      key={brand}
                      onClick={() => handleBrandClick(brand)}
                      className="text-left text-xs py-2 px-2.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg min-h-[44px] flex items-center"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
                  className="w-full text-left py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center"
                >
                  Contact Us
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
                    className="w-full text-left py-2.5 px-3 text-sm font-bold text-black hover:bg-gray-100 rounded-xl min-h-[44px] flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Auth Bottom Bar */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {user.photoURL && (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-xs font-semibold text-gray-900">{user.displayName}</span>
                  </div>
                  <button
                    onClick={async () => { setMobileMenuOpen(false); await logout(); }}
                    className="text-xs text-red-600 hover:text-red-700 p-2 min-h-[44px] flex items-center"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowAuthModal(true); }}
                  className="w-full py-3 bg-black text-white font-bold uppercase tracking-wider rounded-xl text-xs min-h-[44px] flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Log in with Google</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
