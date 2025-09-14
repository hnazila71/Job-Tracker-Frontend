// src/app/dashboard/page.tsx

"use client";

export default function DashboardPage() {
  const handleLogout = () => {
    // Hapus token dari penyimpanan
    localStorage.removeItem('accessToken');
    // Arahkan ke halaman login
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Job Tracker</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daftar Lamaran Kerja Anda</h2>
          <p className="text-gray-600">
            Fitur untuk menampilkan daftar lamaran akan dibuat di sini.
          </p>
        </div>
      </main>
    </div>
  );
}