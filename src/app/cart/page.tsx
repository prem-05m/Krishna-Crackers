'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some crackers to get started!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all text-lg"
        >
          Shop Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4 w-full sm:w-auto sm:flex-grow min-w-0">
                {/* Product Image */}
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎆</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.unit}</p>
                  <p className="text-primary font-semibold">₹{item.price} each</p>
                </div>

                {/* Remove button for mobile (Top Right) */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="sm:hidden text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:shrink-0 gap-4 mt-2 sm:mt-0">
                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => item.quantity === 1 ? removeItem(item.productId) : updateQuantity(item.productId, item.quantity - 1)}
                    className="w-9 h-9 rounded-xl border border-border bg-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0 min-w-[4rem]">
                  <p className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>

                {/* Remove for desktop */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="hidden sm:block text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-4">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Estimate</span>
                <span className="font-extrabold text-2xl text-primary">₹{subtotal.toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Final price confirmed at checkout</p>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors text-lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/products"
              className="block w-full mt-3 text-center py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}