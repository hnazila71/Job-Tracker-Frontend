// src/app/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Langkah 1: Login untuk mendapatkan token
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Terjadi kesalahan');
      }
      
      const { accessToken } = loginData;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        
        // --- PERBAIKAN UTAMA DI SINI ---
        // Langkah 2: Gunakan token untuk mengambil profil pengguna
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const profileData = await profileResponse.json();
        if (!profileResponse.ok) {
            // Jika gagal ambil profil, tetap lanjutkan tapi tanpa nama
            console.error('Gagal mengambil data profil');
        } else if (profileData.name) {
            // Langkah 3: Simpan nama pengguna ke localStorage
            localStorage.setItem('userName', profileData.name);
        }
        // ---------------------------------
      }
      
      setMessage('Login berhasil! Mengarahkan ke dashboard...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Error saat login:', error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Terjadi kesalahan yang tidak diketahui');
      }
    } finally {
        setIsLoading(false); // Hentikan loading
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">
          Selamat Datang di Job Tracker
        </h1>
        <p className="text-center">
          Silakan masuk untuk melanjutkan
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Alamat Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <p className={`text-sm text-center ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}