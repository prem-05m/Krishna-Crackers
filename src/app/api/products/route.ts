import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Helper to map DB product to Android product
const mapProduct = (p: any) => ({
  _id: p._id.toString(),
  name: p.name,
  description: p.description || '',
  price: p.price,
  category: p.categoryId ? { 
    _id: p.categoryId._id?.toString() || p.categoryId.toString(), 
    name: p.categoryId.name || 'Unknown', 
    isActive: p.categoryId.isActive ?? true 
  } : null,
  unit: p.unit,
  unitCount: p.unitCount ?? 1,
  inStock: (p.stock ?? 1) > 0,
  isActive: p.isAvailable,
  imageUrl: p.images && p.images.length > 0 ? p.images[0].url : ''
});

export async function GET() {
  try {
    await connectToDatabase();
    // Populate categoryId to get category name
    const products = await Product.find().populate('categoryId').sort({ createdAt: -1 });
    return NextResponse.json(products.map(mapProduct));
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectToDatabase();

    // Mapping Android payload to MongoDB model
    const newProduct = await Product.create({
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.category?._id || data.categoryId, // handle both cases
      unit: data.unit,
      unitCount: data.unitCount ?? 1,
      isAvailable: data.isActive,
      stock: data.inStock ? 100 : 0, // Mock stock based on inStock boolean
      images: data.imageUrl ? [{ publicId: 'android_upload', url: data.imageUrl }] : []
    });

    const populatedProduct = await Product.findById(newProduct._id).populate('categoryId');
    return NextResponse.json(mapProduct(populatedProduct));
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
