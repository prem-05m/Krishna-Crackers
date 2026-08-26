import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';
import AddToCartButton from '@/components/cart/AddToCartButton';
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  await connectToDatabase();

  const allCategories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  let query: any = { isAvailable: true };
  let activeCategoryName = 'All Products';

  if (categorySlug) {
    const foundCategory = allCategories.find((c: any) =>
      c.slug === categorySlug || c._id.toString() === categorySlug
    );
    if (foundCategory) {
      query.categoryId = (foundCategory as any)._id;
      activeCategoryName = (foundCategory as any).name;
    }
  }

  const products = await Product.find(query).populate('categoryId').sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar: Category Filter */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-foreground">Categories</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`block px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    !categorySlug
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Products
                </Link>
              </li>
              {allCategories.map((cat: any) => (
                <li key={cat._id.toString()}>
                  <Link
                    href={`/products?category=${cat.slug || cat._id.toString()}`}
                    className={`block px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      categorySlug === (cat.slug || cat._id.toString())
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{activeCategoryName}</h1>
          <p className="text-muted-foreground mb-8">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🎆</span>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">No products available in this category yet.</p>
              <Link href="/products" className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
                View All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => {
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
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Product Image — links to detail */}
                    <Link href={`/products/${p._id}`} className="block">
                      <div className="relative h-48 bg-muted overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
                            🎆
                          </div>
                        )}
                        {!p.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-full">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-1">
                      {p.categoryId && (
                        <span className="text-xs text-primary font-medium uppercase tracking-wide">
                          {(p.categoryId as any).name ?? 'Uncategorized'}
                        </span>
                      )}
                      <Link href={`/products/${p._id}`}>
                        <h3 className="font-bold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-primary">₹{p.price}</span>
                        {p.unit && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {p.unit}
                          </span>
                        )}
                      </div>
                      {/* Add to Cart */}
                      <div className="mt-auto">
                        <AddToCartButton product={productForCart} className="w-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}