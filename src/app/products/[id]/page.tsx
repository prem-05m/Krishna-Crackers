import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/cart/AddToCartButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  await connectToDatabase();

  let product: any;
  try {
    product = await Product.findById(id).populate('categoryId').lean();
  } catch {
    notFound();
  }

  if (!product) notFound();

  const category = product.categoryId as any;
  const images: string[] = (product.images ?? []).map((img: any) => img.url);

  const productForCart = {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    unit: product.unit ?? '',
    imageUrl: images[0] ?? '',
    inStock: product.isAvailable !== false,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        {category && (
          <>
            <Link
              href={`/products?category=${category.slug || category._id.toString()}`}
              className="hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
                🎆
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 border-primary/40">
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {category && (
            <Link
              href={`/products?category=${category.slug || category._id.toString()}`}
              className="text-sm font-medium text-primary uppercase tracking-wider hover:underline"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-extrabold text-primary">₹{product.price}</span>
            {product.unit && (
              <span className="text-muted-foreground text-lg">/ {product.unit}</span>
            )}
          </div>

          {/* Stock Badge */}
          <div className="mb-6">
            {product.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Safety Notice */}
          {product.safetyNotice && (
            <div className="mb-8 p-4 rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                ⚠️ {product.safetyNotice}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-auto">
            <AddToCartButton product={productForCart} className="w-full text-lg py-4" />
            <Link
              href="/cart"
              className="block w-full mt-3 text-center py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
