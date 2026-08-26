import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';

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
  unitCount: 1,
  inStock: (p.stock ?? 1) > 0,
  isActive: p.isAvailable,
  imageUrl: p.images && p.images.length > 0 ? p.images[0].url : ''
});

export async function PATCH(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    await connectToDatabase();

    // Map Android updates to Mongo updates
    const mongoUpdates: any = {};
    if (updates.name !== undefined) mongoUpdates.name = updates.name;
    if (updates.description !== undefined) mongoUpdates.description = updates.description;
    if (updates.price !== undefined) mongoUpdates.price = updates.price;
    if (updates.unit !== undefined) mongoUpdates.unit = updates.unit;
    if (updates.isActive !== undefined) mongoUpdates.isAvailable = updates.isActive;
    if (updates.inStock !== undefined) mongoUpdates.stock = updates.inStock ? 100 : 0;
    if (updates.imageUrl !== undefined) mongoUpdates.images = [{ publicId: 'android_upload', url: updates.imageUrl }];

    const updatedProduct = await Product.findByIdAndUpdate(id, mongoUpdates, { new: true }).populate('categoryId');
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(mapProduct(updatedProduct));
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
