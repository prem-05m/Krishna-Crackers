import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductsClient from '@/components/products/ProductsClient';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  await connectToDatabase();
  await Category.init();

  const allCategories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  const allProducts = await Product.find({ isAvailable: true }).populate('categoryId').sort({ createdAt: -1 }).lean();

  // Map products for client component
  const mappedProducts = allProducts.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    unit: p.unit ?? '',
    imageUrl: p.images?.[0]?.url ?? '',
    inStock: p.isAvailable !== false,
    categoryName: p.categoryId?.name ?? '',
    createdAt: p.createdAt?.toString() ?? '',
  }));

  const mappedCategories = allCategories.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug ?? c._id.toString(),
  }));

  return (
    <ProductsClient
      products={mappedProducts}
      categories={mappedCategories}
      initialCategory={categorySlug}
    />
  );
}