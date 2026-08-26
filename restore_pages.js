const fs = require('fs');
const path = require('path');

const files = {
  'src/app/cart/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const subtotal = getSubtotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-12"><p>Empty Cart</p><Link href="/products" className="text-primary">Shop</Link></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-4">
            {items.map(item => (
              <div key={item.productId} className="flex bg-card p-4 rounded-xl border border-border">
                <div className="flex-grow">
                  <h3 className="font-bold">{item.name}</h3>
                  <p>₹{item.price} x {item.quantity}</p>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-destructive">Remove</button>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-96 bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4">Total: ₹{subtotal}</h3>
            <Link href="/checkout" className="block w-full text-center py-3 bg-primary text-primary-foreground rounded-xl">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}`,
  'src/app/checkout/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { createOrderAction } from '@/app/actions/order';

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', town: '', notes: '' });
  
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handlePlaceOrder = async (e: any) => {
    e.preventDefault();
    const result = await createOrderAction({ customer: formData, items });
    if (result.success) { clearCart(); router.push(\`/orders/\${result.orderId}/success\`); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="space-y-4 max-w-lg mx-auto">
        <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-muted border border-border rounded" />
        <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-muted border border-border rounded" />
        <input required placeholder="Town" value={formData.town} onChange={e => setFormData({...formData, town: e.target.value})} className="w-full p-3 bg-muted border border-border rounded" />
        <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded">Place Order (Estimate ₹{getSubtotal()})</button>
      </form>
    </div>
  );
}`,
  'src/app/login/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const result = await loginAction(phone);
    if (result.success) { router.push('/profile'); router.refresh(); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-muted border border-border rounded" />
        <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded">Login Securely</button>
      </form>
    </div>
  );
}`,
  'src/app/products/page.tsx': `import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/Product';
import Link from 'next/link';
export const revalidate = 60;

export default async function ProductsPage() {
  await connectToDatabase();
  const products = await Product.find({ isAvailable: true }).lean();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <Link href={\`/products/\${p._id}\`} key={p._id} className="bg-card p-4 rounded-xl border border-border">
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-primary mt-2">₹{p.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}`,
  'src/app/profile/page.tsx': `import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <p>Logged in as {session.user.phone}</p>
      <form action={logoutAction} className="mt-8">
        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded">Sign Out</button>
      </form>
    </div>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Restored', filepath);
}
