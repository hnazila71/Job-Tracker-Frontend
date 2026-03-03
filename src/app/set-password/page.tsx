"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  );
}

function SetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password minimal 6 karakter');
      return;
    }
    if (password !== confirm) {
      setMessage('Password dan konfirmasi tidak cocok');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan password');

      setIsSuccess(true);
      setMessage('Password berhasil ditambahkan! Sekarang kamu bisa login dengan email & password.');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-slate-400">Link tidak valid.</p>
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">Kembali ke Register</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
        <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-indigo-300 text-sm font-medium">Akun Google terdeteksi</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Email <span className="text-white font-medium">{email}</span> sudah terdaftar melalui Google.
            Tambahkan password agar bisa login dengan email & password juga.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-6">Buat Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400 text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password Baru</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading || isSuccess}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi Password</label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              disabled={isLoading || isSuccess}
              placeholder="Ulangi password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition">
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {message && (
          <p className={`text-sm text-center py-2 px-3 rounded-lg ${isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Menyimpan...' : isSuccess ? 'Berhasil!' : 'Simpan Password'}
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Lewati dulu?{' '}
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
          Login dengan Google
        </Link>
      </p>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Tambah Password</h1>
          <p className="text-slate-400 mt-1 text-sm">Hubungkan akun Google dengan password</p>
        </div>

        <Suspense fallback={<div className="text-slate-400 text-center">Memuat...</div>}>
          <SetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
