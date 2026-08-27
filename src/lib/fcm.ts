import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK using environment variables
// This prevents multiple initializations during Next.js hot-reloading
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully.');
    } else {
      console.log('Firebase Admin not initialized: Missing environment variables.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

/**
 * Sends a push notification via Firebase Cloud Messaging API (V1).
 */
export async function sendNewOrderNotification(customerName: string, town: string, orderId: string) {
  if (!admin.apps.length) {
    console.log('Firebase Admin is not initialized, skipping push notification');
    return;
  }

  const topic = 'new_orders';

  const message = {
    topic: topic,
    notification: {
      title: '🎆 New Order Received!',
      body: `${customerName} from ${town} placed an order (${orderId})`,
    },
    data: {
      orderId,
      customerName,
      town,
      type: 'new_order',
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'krishna_orders',
        sound: 'default',
        priority: 'high' as const,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('FCM notification sent successfully:', response);
  } catch (error) {
    console.error('FCM notification error:', error);
  }
}
