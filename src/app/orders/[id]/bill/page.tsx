'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SHOP = {
  name: 'Krishna Crackers',
  tagline: 'Premium Quality Fireworks',
  address: 'Thiyagadurgam, Tamil Nadu',
  phone: '',
  gstin: '',
};

export default function BillPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((orders: any[]) => {
        const found = orders.find((o: any) => o._id === params.id);
        setOrder(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);


  const handleDownload = async () => {
    if (!billRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(billRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `Krishna-Crackers-Bill-${order?.orderId || order?._id?.slice(-6)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!billRef.current) return;
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(billRef.current, { pixelRatio: 2 });
      if (!blob) return;
      const file = new File([blob], 'bill.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Krishna Crackers Bill', files: [file] });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-muted-foreground">Order not found.</p>
      <Link href="/orders" className="text-primary hover:underline mt-4 block">← Back to Orders</Link>
    </div>
  );

  const date = new Date(order.createdAt);
  const billNo = order.orderId || order._id.slice(-8).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Bill/Receipt */}
      <div
        ref={billRef}
        className="bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-orange-600 text-white px-8 py-6 text-center">
          <div className="text-3xl font-extrabold tracking-wide mb-1">🎆 {SHOP.name}</div>
          <div className="text-sm opacity-90">{SHOP.tagline}</div>
          <div className="text-sm opacity-80 mt-1">{SHOP.address}</div>
        </div>

        {/* Bill Details */}
        <div className="px-8 py-4 flex justify-between items-start border-b border-gray-200 bg-gray-50">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Bill No.</p>
            <p className="font-bold text-lg">#{billNo}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
            <p className="font-medium">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-sm text-gray-500">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-8 py-4 bg-orange-50 border-b border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Details</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold">{order.customer?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-semibold">{order.customer?.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Town / Village</p>
              <p className="font-semibold">{order.customer?.town || '—'}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 text-gray-600 font-semibold">#</th>
                <th className="text-left py-2 text-gray-600 font-semibold">Item</th>
                <th className="text-center py-2 text-gray-600 font-semibold">Unit</th>
                <th className="text-center py-2 text-gray-600 font-semibold">Qty</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Rate</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, i: number) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2.5 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-center text-gray-500 text-xs">{item.unit}</td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-semibold">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-8 py-4 border-t-2 border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-bold text-lg ${
                order.status === 'Completed' ? 'text-green-600' :
                order.status === 'Cancelled' ? 'text-red-600' : 'text-orange-600'
              }`}>{order.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Estimate</p>
              <p className="text-3xl font-extrabold text-orange-600">₹{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Notes: {order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 text-center bg-gradient-to-r from-red-700 to-orange-600 text-white">
          <p className="text-sm font-medium">⚠️ This is an ESTIMATE. Final price confirmed by our team.</p>
          <p className="text-xs opacity-75 mt-1">Thank you for choosing Krishna Crackers! 🎆</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bill-content, #bill-content * { visibility: visible; }
          #bill-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
