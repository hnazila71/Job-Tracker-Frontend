// src/app/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Impor useRouter

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter(); // <-- Inisialisasi router

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
      }

      // --- PERUBAHAN UTAMA ADA DI SINI ---
      
      // 1. Simpan token ke localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      setMessage('Login berhasil! Mengarahkan ke dashboard...');

      // 2. Arahkan (redirect) ke halaman dashboard setelah 1 detik
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Error saat login:', error);
      setMessage(error.message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Selamat Datang di Job Tracker
        </h1>
        <p className="text-center text-gray-600">
          Silakan masuk untuk melanjutkan
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="sr-only">Alamat Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Input Password */}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Tempat untuk menampilkan pesan */}
          {message && (
            <p className={`text-sm text-center ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Tombol Login */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}