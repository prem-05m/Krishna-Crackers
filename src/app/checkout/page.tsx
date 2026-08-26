'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { createOrderAction } from '@/app/actions/order';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', town: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    // Auto-fill from saved profile
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.phone) {
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            phone: data.phone || '',
            town: data.town || '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-primary hover:underline">← Go Shopping</Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createOrderAction({
        customer: { name: formData.name, phone: formData.phone, town: formData.town },
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          price: i.price,
        })),
        notes: formData.notes,
      });
      if (result.success) {
        clearCart();
        router.push(`/orders`);
      } else {
        setError(result.error ?? 'Failed to place order. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-10">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Delivery Details</h2>
              {!profileLoading && (formData.name || formData.town) && (
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full font-medium">
                  ✓ Auto-filled from profile
                </span>
              )}
            </div>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                <input
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Town / Village *</label>
                <input
                  required
                  placeholder="Your town or village"
                  value={formData.town}
                  onChange={e => setFormData({ ...formData, town: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Special Notes (optional)</label>
                <textarea
                  placeholder="Any special requests or notes"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                ) : (
                  `Place Order — ₹${subtotal.toFixed(0)} Estimate`
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                This is an estimate. Final price will be confirmed by our team.
              </p>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  {item.image && (
                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.unit} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Estimate</span>
                <span className="font-extrabold text-xl text-primary">₹{subtotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}