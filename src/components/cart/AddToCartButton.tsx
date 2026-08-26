'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl?: string;
    inStock?: boolean;
  };
  className?: string;
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.productId === product._id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      image: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (product.inStock === false) {
    return (
      <button
        disabled
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-muted text-muted-foreground cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  // If already in cart — show quantity stepper
  if (qty > 0) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={() => qty === 1 ? removeItem(product._id) : updateQuantity(product._id, qty - 1)}
          className="w-10 h-10 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive border border-border flex items-center justify-center transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold text-lg min-w-[2rem] text-center">{qty}</span>
        <button
          onClick={() => updateQuantity(product._id, qty + 1)}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200
        ${added
          ? 'bg-green-500 text-white scale-95'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95'
        } ${className}`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}
