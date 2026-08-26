import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

    const mapped = orders.map((o: any) => ({
      _id: o._id.toString(),
      orderId: o.orderId,
      customer: o.customer,
      items: o.items.map((i: any) => ({
        name: i.name,
        unit: i.unit,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal,
      })),
      totalAmount: o.totalAmount,
      status: o.status,
      notes: o.notes || '',
      createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Fetch customer orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
