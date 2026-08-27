/**
 * Sends a push notification via Firebase Cloud Messaging (Legacy HTTP API).
 * Uses the FCM Server Key stored in environment variables.
 */
export async function sendNewOrderNotification(customerName: string, town: string, orderId: string) {
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.log('FCM_SERVER_KEY not set, skipping push notification');
    return;
  }

  const topic = 'new_orders'; // All admin devices subscribe to this topic

  const payload = {
    to: `/topics/${topic}`,
    notification: {
      title: '🎆 New Order Received!',
      body: `${customerName} from ${town} placed an order (${orderId})`,
      sound: 'default',
    },
    data: {
      orderId,
      customerName,
      town,
      type: 'new_order',
    },
    android: {
      priority: 'high',
      notification: {
        channel_id: 'krishna_orders',
        sound: 'default',
        priority: 'high',
      },
    },
  };

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log('FCM notification sent:', result);
  } catch (error) {
    console.error('FCM notification error:', error);
  }
}
