'use client';
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
}