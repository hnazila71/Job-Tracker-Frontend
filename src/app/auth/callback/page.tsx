// src/app/auth/callback/page.tsx

"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');

    if (token && name) {
      // Simpan token dan nama ke localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userName', decodeURIComponent(name));
      
      // Arahkan ke dashboard
      router.push('/dashboard');
    } else {
      // Jika gagal, arahkan kembali ke halaman login
      console.error("Google Auth Callback Error: Token tidak ditemukan.");
      router.push('/');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Mengarahkan Anda...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}