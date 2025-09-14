// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from 'react';

// Definisikan tipe data untuk lamaran kerja
interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  application_date: string;
  status: string;
  platform?: string;
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/';
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/tracker', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Gagal mengambil data lamaran');
        }
        const data: JobApplication[] = await response.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'offer':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'interview hr':
      case 'interview user':
      case 'technical test':
        return 'bg-yellow-400 text-yellow-900';
      case 'applied':
      case 'screening':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    // Tambahkan gaya dark mode untuk background utama
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <header className="flex justify-between items-center mb-8">
        {/* Hapus warna teks eksplisit */}
        <h1 className="text-3xl font-bold">Dashboard Job Tracker</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main>
        {/* Tambahkan gaya dark mode untuk kartu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Hapus warna teks eksplisit */}
          <h2 className="text-xl font-semibold mb-4">Daftar Lamaran Kerja Anda</h2>
          
          {isLoading && <p>Memuat data...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && (
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} className="p-4 border dark:border-gray-700 rounded-md shadow-sm flex justify-between items-center">
                    <div>
                      {/* Hapus warna teks eksplisit */}
                      <h3 className="font-bold text-lg">{app.job_title}</h3>
                      <p>{app.company_name}</p>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))
              ) : (
                <p>Anda belum memiliki data lamaran kerja.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}