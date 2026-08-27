'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import AddToCartButton from '@/components/cart/AddToCartButton';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  categoryName?: string;
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

export default function ProductsClient({ products, categories, initialCategory }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || '');
  const [sort, setSort] = useState<SortOption>('newest');
  const [showSort, setShowSort] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: '🆕 Newest First' },
    { value: 'price_asc', label: '💰 Price: Low → High' },
    { value: 'price_desc', label: '💎 Price: High → Low' },
    { value: 'name_asc', label: '🔤 A → Z' },
    { value: 'name_desc', label: '🔤 Z → A' },
  ];

  const filtered = useMemo(() => {
    let result = products;

    // Category filter
    if (activeCategory) {
      result = result.filter(p => p.categoryName?.toLowerCase() === activeCategory.toLowerCase() ||
        categories.find(c => c._id === activeCategory || c.slug === activeCategory)?.name.toLowerCase() === p.categoryName?.toLowerCase()
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q));
    }

    // Sort
    const sorted = [...result];
    switch (sort) {
      case 'price_asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price_desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'name_asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break; // newest = already sorted by server
    }
    return sorted;
  }, [products, activeCategory, search, sort, categories]);

  const activeLabel = sortOptions.find(o => o.value === sort)?.label || 'Newest First';
  const activeCategoryName = activeCategory
    ? categories.find(c => c._id === activeCategory || c.slug === activeCategory)?.name || 'Category'
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:border-primary/50 transition w-full sm:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">{activeLabel}</span>
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowSort(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors ${sort === opt.value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Category Filter */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
            <h2 className="text-sm font-bold mb-3 text-foreground uppercase tracking-wide">Categories</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    !activeCategory ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat._id}>
                  <button
                    onClick={() => setActiveCategory(cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                      activeCategory === cat._id || activeCategory === cat.slug
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeCategoryName}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                {search && <span className="ml-1">for "<strong>{search}</strong>"</span>}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🎆</span>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try a different search or category.</p>
              <button onClick={() => { setSearch(''); setActiveCategory(''); }} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => (
                <div
                  key={p._id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <Link href={`/products/${p._id}`} className="block">
                    <div className="relative h-40 bg-muted overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">🎆</div>
                      )}
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-xs bg-red-600 px-2 py-1 rounded-full">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 flex flex-col flex-1">
                    {p.categoryName && (
                      <span className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{p.categoryName}</span>
                    )}
                    <Link href={`/products/${p._id}`}>
                      <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-primary">₹{p.price}</span>
                      {p.unit && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.unit}</span>}
                    </div>
                    <div className="mt-auto">
                      <AddToCartButton product={p} className="w-full text-xs py-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
