// src/app/register/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true); // Mulai loading

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftar');
      }

      setMessage('Pendaftaran berhasil! Anda akan diarahkan ke halaman login...');
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/'); // Arahkan ke halaman login
      }, 1);

    } catch (error) {
      console.error('Error saat mendaftar:', error);
      setIsSuccess(false); // Pastikan state sukses false jika error
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Terjadi kesalahan yang tidak diketahui');
      }
    } finally {
        // Hentikan loading hanya jika tidak sukses, agar pesan sukses tetap terlihat
        if (!isSuccess) {
            setIsLoading(false);
        }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">
          Buat Akun Baru
        </h1>
        <p className="text-center">
          Daftar untuk mulai melacak lamaran kerja Anda.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="sr-only">Nama Lengkap</label>
            <input id="name" name="name" type="text" required disabled={isLoading} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Alamat Email</label>
            <input id="email" name="email" type="email" required disabled={isLoading} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50" placeholder="Alamat Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input id="password" name="password" type="password" required disabled={isLoading} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 disabled:opacity-50" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {message && (
            <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          Sudah punya akun?{' '}
          <Link href="/" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
