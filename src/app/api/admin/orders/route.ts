import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Helper to map DB Product to Android Product
const mapProduct = (p: any) => {
  if (!p) return null;
  return {
    _id: p._id?.toString(),
    name: p.name || 'Unknown',
    description: p.description || '',
    price: p.price || 0,
    category: null, // Minimal category info for order item
    unit: p.unit || '',
    unitCount: 1,
    inStock: true,
    isActive: true,
    imageUrl: p.images && p.images.length > 0 ? p.images[0].url : ''
  };
};

export const mapOrder = (o: any) => {
  const dateObj = new Date(o.createdAt);
  return {
    _id: o._id.toString(),
    customer: o.customer,
    items: o.items.map((i: any) => ({
      // Handle case where productId is populated vs just an ObjectId
      product: mapProduct(i.productId) || {
        _id: i.productId?.toString(),
        name: i.name,
        price: i.price,
        unit: i.unit,
        description: '',
        category: null,
        unitCount: 1,
        inStock: false,
        isActive: false,
        imageUrl: ''
      },
      quantity: i.quantity,
      unitPrice: i.price,
      subtotal: i.subtotal
    })),
    totalAmount: o.totalAmount,
    status: o.status,
    orderDate: dateObj.toISOString().split('T')[0],
    orderTime: dateObj.toTimeString().split(' ')[0],
    orderId: o.orderId || '',
    notes: o.notes || ''
  };
};

export async function GET() {
  try {
    await connectToDatabase();
    // Pre-register models in case they aren't loaded
    Product.init();
    Category.init();
    
    const orders = await Order.find().populate('items.productId').sort({ createdAt: -1 });
    return NextResponse.json(orders.map(mapOrder));
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
