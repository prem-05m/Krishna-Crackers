'use client';
import { useState, useEffect } from 'react';
import { logoutAction } from '@/app/actions/auth';
import Link from 'next/link';
import { User, Phone, MapPin, Save, LogOut, Package, Loader2, Check } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ phone: string; name: string; town: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.phone) {
          setProfile(data);
          setName(data.name || '');
          setTown(data.town || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, town }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-3">Login Required</h1>
      <p className="text-muted-foreground mb-8">Login with your phone number to view your profile and orders.</p>
      <Link href="/login" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors">
        Login / Sign Up
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid gap-6">
        {/* Phone Number Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="font-bold text-lg">+91 {profile.phone}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pl-13">This is your login ID. It cannot be changed.</p>
        </div>

        {/* Edit Details Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1">Delivery Details</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Save your name and town to auto-fill your next order.
          </p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Town / Village
              </label>
              <input
                value={town}
                onChange={e => setTown(e.target.value)}
                placeholder="Your town or village"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Details</>
              )}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          <Link href="/orders" className="flex items-center gap-4 p-4 hover:bg-accent transition-colors rounded-t-2xl">
            <Package className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">My Orders</span>
            <span className="ml-auto text-muted-foreground">→</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-4 p-4 w-full text-left hover:bg-destructive/5 transition-colors rounded-b-2xl text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}