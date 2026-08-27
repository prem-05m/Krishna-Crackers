import type { Metadata } from 'next';
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
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}