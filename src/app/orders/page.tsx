'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Pending:    { label: 'Pending',    color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
  Confirmed:  { label: 'Confirmed',  color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30',    icon: CheckCircle },
  Processing: { label: 'Processing', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Package },
  Ready:      { label: 'Ready',      color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: Package },
  Completed:  { label: 'Completed',  color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30',  icon: CheckCircle },
  Cancelled:  { label: 'Cancelled',  color: 'text-red-700 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30',      icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setError(data.error || 'Failed to load orders');
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-destructive mb-4">{error}</p>
      <Link href="/login" className="text-primary hover:underline">Login to view orders →</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8">Start shopping to place your first order!</p>
          <Link href="/products" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const Icon = cfg.icon;
            const isExpanded = expandedId === order._id;
            const date = new Date(order.createdAt);

            return (
              <div key={order._id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                {/* Order Header */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">#{order.orderId || order._id.slice(-6).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-lg text-primary">₹{order.totalAmount.toFixed(0)}</p>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5">
                    {/* Status Timeline */}
                    <div className="flex items-center gap-1 py-4 overflow-x-auto">
                      {['Pending', 'Confirmed', 'Processing', 'Ready', 'Completed'].map((s, i, arr) => {
                        const statuses = ['Pending', 'Confirmed', 'Processing', 'Ready', 'Completed'];
                        const currentIdx = statuses.indexOf(order.status);
                        const stepIdx = statuses.indexOf(s);
                        const done = order.status !== 'Cancelled' && stepIdx <= currentIdx;
                        const active = stepIdx === currentIdx;
                        return (
                          <div key={s} className="flex items-center gap-1 shrink-0">
                            <div className={`flex flex-col items-center gap-1`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                done ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'
                              }`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
                            </div>
                            {i < arr.length - 1 && (
                              <div className={`w-6 h-0.5 mb-4 ${done && stepIdx < currentIdx ? 'bg-primary' : 'bg-border'}`} />
                            )}
                          </div>
                        );
                      })}
                      {order.status === 'Cancelled' && (
                        <span className="ml-auto text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded-full">Cancelled</span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</h3>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">{item.unit} × {item.quantity}</span>
                          <span className="font-semibold">₹{item.subtotal.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-bold">Total Estimate</span>
                      <span className="font-extrabold text-primary text-xl">₹{order.totalAmount.toFixed(0)}</span>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-4 p-3 bg-muted rounded-xl text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{order.customer?.name}</span></p>
                      <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{order.customer?.phone}</span></p>
                      <p><span className="text-muted-foreground">Town:</span> <span className="font-medium">{order.customer?.town}</span></p>
                      {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
                    </div>

                    {/* Bill Link */}
                    <Link
                      href={`/orders/${order._id}/bill`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                    >
                      View & Download Bill
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
