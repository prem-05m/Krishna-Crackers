import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function Home() {
  await connectToDatabase();
  await Category.init();

  const allCategories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  const allProducts = await Product.find({ isAvailable: true }).populate('categoryId').sort({ createdAt: -1 }).lean();

  // Group products by category
  const productsByCategory: Record<string, { category: any; products: any[] }> = {};
  for (const cat of allCategories) {
    const id = (cat as any)._id.toString();
    productsByCategory[id] = { category: cat, products: [] };
  }
  for (const p of allProducts) {
    const catId = (p as any).categoryId?._id?.toString() || (p as any).categoryId?.toString();
    if (catId && productsByCategory[catId]) {
      productsByCategory[catId].products.push(p);
    }
  }

  const categorySections = Object.values(productsByCategory).filter(s => s.products.length > 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Premium Quality Fireworks
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Light Up Your{' '}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Celebrations
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Shop premium fireworks for every occasion. Get instant estimates and deliver joy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop All Products
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-full hover:bg-accent transition-all text-lg"
            >
              View Cart
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Quick Nav */}
      {allCategories.length > 0 && (
        <section className="py-8 px-4 border-b border-border bg-card/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <Link
                href="/products"
                className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90"
              >
                All Products
              </Link>
              {allCategories.map((cat: any) => (
                <Link
                  key={cat._id.toString()}
                  href={`/products?category=${cat.slug || cat._id.toString()}`}
                  className="shrink-0 px-5 py-2.5 rounded-full border border-border text-foreground font-medium text-sm hover:bg-accent hover:border-primary/30 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products By Category */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {categorySections.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <span className="text-7xl mb-4">🎆</span>
            <h2 className="text-2xl font-bold mb-2">Products coming soon!</h2>
            <p className="text-muted-foreground">Check back later for our fireworks collection.</p>
          </div>
        ) : (
          categorySections.map(({ category, products }) => (
            <section key={(category as any)._id.toString()}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{(category as any).name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
                </div>
                <Link
                  href={`/products?category=${(category as any).slug || (category as any)._id.toString()}`}
                  className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(0, 8).map((p: any) => {
                  const productForCart = {
                    _id: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    unit: p.unit ?? '',
                    imageUrl: p.images?.[0]?.url ?? '',
                    inStock: p.isAvailable !== false,
                  };
                  return (
                    <div
                      key={p._id.toString()}
                      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <Link href={`/products/${p._id}`} className="block">
                        <div className="relative h-40 bg-muted overflow-hidden">
                          {p.images && p.images.length > 0 ? (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                              🎆
                            </div>
                          )}
                          {!p.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold text-xs bg-red-600 px-2 py-1 rounded-full">Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        <Link href={`/products/${p._id}`}>
                          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-primary">₹{p.price}</span>
                          {p.unit && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.unit}</span>
                          )}
                        </div>
                        <div className="mt-auto">
                          <AddToCartButton product={productForCart} className="w-full text-xs py-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {products.length > 8 && (
                <div className="mt-6 text-center">
                  <Link
                    href={`/products?category=${(category as any).slug || (category as any)._id.toString()}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all text-sm"
                  >
                    View all {products.length} {(category as any).name} products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
}