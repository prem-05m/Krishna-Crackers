import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
// Optional: we can add authentication middleware check here if needed, but for now we trust the Android app

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      activeProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Confirmed' }), // Or Processing/Ready based on logic
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true })
    ]);

    // Include Processing and Ready in confirmed if you prefer, or just exactly 'Confirmed'
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const readyOrders = await Order.countDocuments({ status: 'Ready' });

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      confirmedOrders: confirmedOrders + processingOrders + readyOrders, // Grouping them for the Android UI
      completedOrders,
      cancelledOrders,
      totalProducts,
      activeProducts
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
