import React, { useRef } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Percent, 
  Sparkles, 
  Layers, 
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import type { Product, SneakerBrand, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BRAND_NAME, BRAND_TAGLINE } from '../config';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (tab: string, filterParams?: any) => void;
}

const BRAND_TILES: { name: SneakerBrand; logo: string; image: string }[] = [
  { 
    name: 'Nike', 
    logo: 'NIKE', 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Air Jordan', 
    logo: 'JORDAN', 
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Adidas', 
    logo: 'ADIDAS', 
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'New Balance', 
    logo: 'NEW BALANCE', 
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Asics', 
    logo: 'ASICS', 
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Puma', 
    logo: 'PUMA', 
    image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Vans', 
    logo: 'VANS', 
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Converse', 
    logo: 'CONVERSE', 
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Birkenstock', 
    logo: 'BIRKENSTOCK', 
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    name: 'Crocs', 
    logo: 'CROCS', 
    image: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=600&q=80' 
  },
];

const ACCESSORY_TILES: { name: ProductCategory; label: string; image: string }[] = [
  { name: 'Backpacks', label: 'Sneaker Backpacks', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sunglasses', label: 'Streetwear Shades', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80' },
  { name: 'Watches', label: 'Tactical Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Earbuds', label: 'Bass Wireless Audio', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sandals', label: 'Street Slides & Clogs', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80' },
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const hypedScrollRef = useRef<HTMLDivElement>(null);
  const clearanceScrollRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const hypedKicks = products.filter(p => p.isHyped || p.rating >= 4.8);
  const clearanceKicks = products.filter(p => p.isClearance || (p.price - p.salePrice) >= 2000);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16 bg-[#FFFFFF] text-[#111827] overflow-x-hidden">
      
      {/* 1. Full-Width Hero Banner (Clean Light Editorial Style) */}
      <section className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-[#F3F4F6] border-b border-[#E5E7EB] overflow-hidden">
        
        {/* Subtle Background Sneaker Collage */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-multiply scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6]/70 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-gray-800 text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>INDIA'S PREMIER SNEAKER BOUTIQUE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight uppercase text-gray-900 leading-none mb-6">
            AUTHENTIC KICKS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
              STREETWEAR DROPS.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-600 mb-8 font-normal leading-relaxed">
            100% verified deadstock Air Jordans, Dunks, Yeezys, and hype retros. Insured express delivery across India with 7-day size exchange guarantee.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('products')}
              className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gray-800 text-white font-extrabold uppercase tracking-wider rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95 min-h-[48px]"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('shop-by-brand');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold uppercase tracking-wider rounded-xl text-sm border border-[#E5E7EB] transition min-h-[48px] shadow-xs"
            >
              Browse Brands
            </button>
          </div>

          {/* Micro Stats */}
          <div className="mt-12 pt-6 border-t border-[#E5E7EB] grid grid-cols-3 max-w-lg mx-auto gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-mono font-black text-gray-900">100%</div>
              <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-mono">Authentic</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-mono font-black text-gray-900">4-8 Days</div>
              <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-mono">Pan India Air</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-mono font-black text-gray-900">4.9 ★</div>
              <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-mono">Trust Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Brand Tiles */}
      <section id="shop-by-brand" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">
              Top Labels
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
              Shop by Brand
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition min-h-[44px]"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 10 Brand Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {BRAND_TILES.map((brand) => (
            <div
              key={brand.name}
              onClick={() => onNavigate('products', { brand: [brand.name] })}
              className="group relative h-28 sm:h-36 rounded-2xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-gray-400 transition duration-300 cursor-pointer shadow-xs"
            >
              <img
                src={brand.image}
                alt={brand.name}
                loading="lazy"
                className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end text-white">
                <span className="font-heading font-black text-sm sm:text-base uppercase tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1 mt-0.5">
                  <span>Browse drops</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. "Hyped Kicks" Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-rose-600 mb-0.5">
                High Demand
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
                Hyped Kicks
              </h2>
            </div>
          </div>

          {/* Desktop Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollCarousel(hypedScrollRef, 'left')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-gray-400 text-gray-700 hover:text-black flex items-center justify-center transition shadow-xs"
              aria-label="Previous hyped kicks"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel(hypedScrollRef, 'right')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-gray-400 text-gray-700 hover:text-black flex items-center justify-center transition shadow-xs"
              aria-label="Next hyped kicks"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={hypedScrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
        >
          {hypedKicks.map((product) => (
            <div
              key={product.id}
              className="min-w-[240px] sm:min-w-[280px] max-w-[280px] snap-start shrink-0"
            >
              <ProductCard product={product} onSelect={onSelectProduct} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Shop by Category Tiles: Men / Women */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Men Category Tile */}
          <div
            onClick={() => onNavigate('products', { gender: ['Men'] })}
            className="group relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-gray-400 transition duration-500 cursor-pointer shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80"
              alt="Shop Men Sneaker Collection"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1">
                Curated Drop
              </span>
              <h3 className="text-3xl sm:text-4xl font-black font-heading uppercase mb-2">
                Men's Collection
              </h3>
              <p className="text-xs text-gray-300 max-w-sm mb-4">
                High-top retros, basketball grails, and clean street silhouettes.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-100 px-4 py-2.5 rounded-xl w-max shadow-md min-h-[44px]">
                <span>Shop Men Drops</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Women Category Tile */}
          <div
            onClick={() => onNavigate('products', { gender: ['Women'] })}
            className="group relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-gray-400 transition duration-500 cursor-pointer shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"
              alt="Shop Women Sneaker Collection"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1">
                Curated Drop
              </span>
              <h3 className="text-3xl sm:text-4xl font-black font-heading uppercase mb-2">
                Women's Collection
              </h3>
              <p className="text-xs text-gray-300 max-w-sm mb-4">
                Everyday classics, pastel colorways, and chunky street soles.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-100 px-4 py-2.5 rounded-xl w-max shadow-md min-h-[44px]">
                <span>Shop Women Drops</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Stock Clearance" Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700 mb-0.5">
                Limited Stock
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
                Stock Clearance
              </h2>
            </div>
          </div>

          {/* Desktop Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollCarousel(clearanceScrollRef, 'left')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-gray-400 text-gray-700 hover:text-black flex items-center justify-center transition shadow-xs"
              aria-label="Previous clearance items"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel(clearanceScrollRef, 'right')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-gray-400 text-gray-700 hover:text-black flex items-center justify-center transition shadow-xs"
              aria-label="Next clearance items"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={clearanceScrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
        >
          {clearanceKicks.map((product) => (
            <div
              key={product.id}
              className="min-w-[240px] sm:min-w-[280px] max-w-[280px] snap-start shrink-0"
            >
              <ProductCard product={product} onSelect={onSelectProduct} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Accessories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">
              Gear & Essentials
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-gray-900 tracking-tight">
              Streetwear Accessories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { category: ['Backpacks', 'Sunglasses', 'Watches', 'Earbuds', 'Sandals'] })}
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition min-h-[44px]"
          >
            <span>Explore All Gear</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ACCESSORY_TILES.map((acc) => (
            <div
              key={acc.name}
              onClick={() => onNavigate('products', { category: [acc.name] })}
              className="group relative h-48 sm:h-60 rounded-2xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-gray-400 transition duration-300 cursor-pointer shadow-xs flex flex-col justify-end p-4"
            >
              <img
                src={acc.image}
                alt={acc.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="relative z-10 text-white">
                <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-wider block">
                  {acc.name}
                </span>
                <h4 className="text-sm font-bold font-heading leading-tight mt-0.5">
                  {acc.label}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. About Us Blurb (Clean Light Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-700 bg-white border border-[#E5E7EB] px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>The {BRAND_NAME} Promise</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black font-heading uppercase text-gray-900 tracking-tight leading-tight mb-4">
              Curated by Sneakerheads. <br />
              Delivered Fast Across India.
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              {BRAND_NAME} was created to remove the stress from sneaker shopping in India. Every pair passing through our warehouse is checked under UV blacklight, stitch-inspected, and tagged with our signature RFID security seal by trained authenticators.
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
              With logistics hubs in Mumbai and Delhi, we dispatch pan-India with verified live tracking, instant UPI checkout, and dedicated WhatsApp concierge support.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs rounded-xl tracking-wider transition min-h-[44px]"
              >
                Our Legit-Check Protocol
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black hover:underline min-h-[44px] flex items-center"
              >
                Chat with Concierge →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
