'use server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendNewOrderNotification } from '@/lib/fcm';

export async function createOrderAction(orderData: { customer: { name: string; phone: string; town: string }; items: any[]; notes?: string; }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };
    await connectToDatabase();
    await User.findByIdAndUpdate(session.user.id, { name: orderData.customer.name, town: orderData.customer.town });
    let totalAmount = 0;
    const processedItems = orderData.items.map((item: any) => {
      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;
      return { productId: item.productId, name: item.name, unit: item.unit, quantity: item.quantity, price: item.price, subtotal };
    });
    const orderId = `KC-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = await Order.create({
      orderId,
      userId: session.user.id,
      customer: orderData.customer,
      items: processedItems,
      totalAmount,
      notes: orderData.notes,
      status: 'Pending',
    });

    // Send push notification to admin
    sendNewOrderNotification(orderData.customer.name, orderData.customer.town, orderId).catch(() => {});

    return { success: true, orderId: order.orderId };
  } catch (error: any) {
    console.error('Create order error:', error);
    return { success: false, error: 'Failed to create order' };
  }
}