'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  
  useEffect(() => { setMounted(true); }, []);
  
  const cartItemsCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 mr-2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent truncate">
              Krishna Crackers
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
              <Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href="/profile" className="hidden md:block hover:text-primary transition-colors"><User className="w-6 h-6" /></Link>
            <Link href="/cart" className="relative hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium hover:bg-accent hover:text-primary transition-colors">Home</Link>
            <Link href="/products" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium hover:bg-accent hover:text-primary transition-colors">Shop</Link>
            <Link href="/orders" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium hover:bg-accent hover:text-primary transition-colors">My Orders</Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium hover:bg-accent hover:text-primary transition-colors">My Profile</Link>
          </div>
        </div>
      )}
    </nav>
  );
}