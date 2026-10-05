import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  SlidersHorizontal, 
  Search, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type { Product, SneakerBrand, FilterState } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CURRENCY_SYMBOL } from '../config';

interface CollectionPageProps {
  products: Product[];
  initialFilters?: Partial<FilterState>;
  onSelectProduct: (product: Product) => void;
  loading?: boolean;
}

const ALL_BRANDS: SneakerBrand[] = [
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

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

export const CollectionPage: React.FC<CollectionPageProps> = ({
  products,
  initialFilters = {},
  onSelectProduct,
  loading = false,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters.brand || []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialFilters.sizes || []);
  const [selectedGender, setSelectedGender] = useState<string[]>(initialFilters.gender || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.category || []);
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.searchQuery || '');

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedGender([]);
    setSelectedCategories([]);
    setPriceMax(100000);
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedGender.length > 0 ||
    selectedCategories.length > 0 ||
    priceMax < 100000 ||
    minRating > 0 ||
    inStockOnly ||
    searchQuery.trim() !== '';

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleGender = (g: string) => {
    setSelectedGender(prev => 
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]
    );
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Gender
      if (selectedGender.length > 0 && !selectedGender.includes(product.gender) && product.gender !== 'Unisex') {
        return false;
      }

      // Category
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Size Availability
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some(s => (product.sizes?.[s] || 0) > 0);
        if (!hasSize) return false;
      }

      // Price
      if (product.salePrice > priceMax) {
        return false;
      }

      // Rating
      if (minRating > 0 && (product.rating || 0) < minRating) {
        return false;
      }

      // In Stock
      if (inStockOnly) {
        const total = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
        if (total <= 0 || product.isSoldOut) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [
    products, 
    searchQuery, 
    selectedBrands, 
    selectedGender, 
    selectedCategories, 
    selectedSizes, 
    priceMax, 
    minRating, 
    inStockOnly, 
    sortBy
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white text-gray-900">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-[#E5E7EB] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Vault Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading uppercase tracking-tight text-gray-900">
            All Sneaker Drops
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Showing {filteredProducts.length} authentic kicks & streetwear silhouettes.
          </p>
        </div>

        {/* Sorting & Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-gray-900 min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-300 hover:border-gray-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-black min-h-[44px] cursor-pointer"
            >
              <option value="newest">Sort: Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters (Clean Light Style) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-5 space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-black" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-black font-semibold hover:underline flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search within catalog */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keyword or silhouette..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black min-h-[40px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                Brand
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {ALL_BRANDS.map(brand => (
                  <label
                    key={brand}
                    className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer py-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-gray-300 text-black focus:ring-0 w-4 h-4 cursor-pointer accent-black"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter (EU 36-45) */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                Size (EU)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {SIZES.map(s => {
                  const isSelected = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`h-9 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center min-h-[36px] ${
                        isSelected
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Standard UK & EU sizing
              </span>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                Gender
              </label>
              <div className="flex gap-2">
                {['Men', 'Women'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGender(g)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition min-h-[40px] ${
                      selectedGender.includes(g)
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                <span>Max Price</span>
                <span className="text-gray-900 font-bold">
                  {CURRENCY_SYMBOL}{priceMax.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="4000"
                max="100000"
                step="2000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-black bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
                <span>₹4k</span>
                <span>₹1 Lakh</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[0, 4.5, 4.8].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition min-h-[36px] ${
                      minRating === r
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {r === 0 ? 'All' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-[#E5E7EB]">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-black w-4 h-4 cursor-pointer accent-black"
                />
                <span>In Stock items only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid: 2 cols mobile, 3 tablet, 3/4 desktop */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-3">
                  <div className="aspect-square bg-gray-100 rounded-xl" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900 uppercase mb-2">
                No matching kicks found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                We couldn't find any sneakers matching your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-extrabold uppercase text-xs rounded-xl tracking-wider transition min-h-[44px]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white border-l border-[#E5E7EB] text-gray-900 flex flex-col p-5 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="font-heading font-black text-base uppercase text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                  Filters
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-5">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-2">
                    Brand
                  </label>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {ALL_BRANDS.map(brand => (
                      <label key={brand} className="flex items-center gap-2 text-xs text-gray-700 py-1">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-gray-300 text-black w-4 h-4 accent-black"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-2">
                    Size (EU)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`h-9 rounded-lg text-xs font-mono font-bold ${
                          selectedSizes.includes(s)
                            ? 'bg-black text-white'
                            : 'bg-gray-100 border border-gray-300 text-gray-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {['Men', 'Women'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGender(g)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                          selectedGender.includes(g)
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-100 border-gray-300 text-gray-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                    <span>Max Price</span>
                    <span className="text-gray-900 font-bold">₹{priceMax.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="4000"
                    max="100000"
                    step="2000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-black"
                  />
                </div>
              </div>

              {/* Mobile Filter Footer */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetFilters}
                  className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold uppercase min-h-[44px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="py-3 px-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold uppercase min-h-[44px]"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
