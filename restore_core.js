const fs = require('fs');
const path = require('path');

const files = {
  'src/middleware.ts': `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/profile', '/orders', '/checkout'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  const session = request.cookies.get('session')?.value;
  let parsedSession = null;
  if (session) {
    try { parsedSession = await decrypt(session); } catch (e) {}
  }
  if (isProtectedRoute && !parsedSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthRoute && parsedSession) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};`,
  'src/lib/mongoose.ts': `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default connectToDatabase;`,
  'src/lib/auth.ts': `import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-for-development';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, { algorithms: ['HS256'] });
  return payload;
}

export async function loginUser(userId: string, phone: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ user: { id: userId, phone }, expires });
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0), path: '/' });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try { return await decrypt(session); } catch (err) { return null; }
}`,
  'src/models/User.ts': `import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name?: string;
  town?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: false },
  town: { type: String, required: false },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;`,
  'src/models/Category.ts': `import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: { publicId: string; url: string; };
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: false },
  image: { publicId: { type: String, required: false }, url: { type: String, required: false } },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;`,
  'src/models/Product.ts': `import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description?: string;
  price: number;
  unit: string;
  images: { publicId: string; url: string; }[];
  isAvailable: boolean;
  stock?: number;
  safetyNotice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  images: [{ publicId: { type: String, required: true }, url: { type: String, required: true } }],
  isAvailable: { type: Boolean, default: true },
  stock: { type: Number, required: false },
  safetyNotice: { type: String, required: false },
}, { timestamps: true });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;`,
  'src/models/Order.ts': `import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId;
  customer: { name: string; phone: string; town: string; };
  items: IOrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false });

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { name: { type: String, required: true }, phone: { type: String, required: true }, town: { type: String, required: true } },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
  notes: { type: String, required: false },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;`,
  'src/store/cartStore.ts': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
      const existingItem = state.items.find((i) => i.productId === item.productId);
      if (existingItem) {
        return { items: state.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) };
      }
      return { items: [...state.items, item] };
    }),
    removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
    updateQuantity: (productId, quantity) => set((state) => ({ items: state.items.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i) })),
    clearCart: () => set({ items: [] }),
    getSubtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
  }), { name: 'krishna-crackers-cart' })
);`,
  'src/app/actions/auth.ts': `'use server';
import { loginUser, logoutUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function loginAction(phone: string) {
  try {
    await connectToDatabase();
    let user = await User.findOne({ phone });
    if (!user) { user = await User.create({ phone }); }
    await loginUser(user._id.toString(), user.phone);
    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to authenticate' };
  }
}

export async function logoutAction() {
  await logoutUser();
  return { success: true };
}`,
  'src/app/actions/order.ts': `'use server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';

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
    const orderId = \`KC-\${Math.floor(100000 + Math.random() * 900000)}\`;
    const order = await Order.create({
      orderId,
      userId: session.user.id,
      customer: orderData.customer,
      items: processedItems,
      totalAmount,
      notes: orderData.notes,
      status: 'Pending',
    });
    return { success: true, orderId: order.orderId };
  } catch (error: any) {
    console.error('Create order error:', error);
    return { success: false, error: 'Failed to create order' };
  }
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Restored', filepath);
}
