const fs = require('fs');
const path = require('path');

const files = {
  'src/app/globals.css': `@import "tailwindcss";

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
}

@layer base {
  :root {
    --background: 260 50% 5%;
    --foreground: 210 40% 98%;
    --card: 260 40% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 260 40% 8%;
    --popover-foreground: 210 40% 98%;
    --primary: 11 80% 55%;
    --primary-foreground: 210 40% 98%;
    --secondary: 260 30% 15%;
    --secondary-foreground: 210 40% 98%;
    --muted: 260 30% 15%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 260 30% 15%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 260 30% 18%;
    --input: 260 30% 18%;
    --ring: 11 80% 55%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
  'src/app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Krishna Crackers - Premium Fireworks',
  description: 'Buy premium fireworks online with Krishna Crackers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={\`\${inter.className} min-h-screen flex flex-col bg-background text-foreground\`}>
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}`,
  'src/app/page.tsx': `import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
        Light Up Your Celebrations
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10">
        Premium quality fireworks for every occasion. Shop online and get estimates instantly.
      </p>
      <Link 
        href="/products"
        className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(165,65,45,0.4)] hover:shadow-[0_0_40px_rgba(165,65,45,0.6)] text-lg"
      >
        Shop Now
      </Link>
    </div>
  );
}`,
  'src/components/layout/Navbar.tsx': `'use client';
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
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Krishna Crackers
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/profile" className="hover:text-primary transition-colors"><User className="w-6 h-6" /></Link>
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
    </nav>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Restored', filepath);
}
