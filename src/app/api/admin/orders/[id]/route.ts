import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { mapOrder } from '../route';

export async function GET(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    Product.init(); // ensure model is registered for populate

    const order = await Order.findById(id).populate('items.productId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(mapOrder(order));
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(mapOrder(order));
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
