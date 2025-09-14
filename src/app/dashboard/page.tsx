// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState, FormEvent, useRef } from 'react';

// Tipe data
interface JobApplication { id: string; company_name: string; job_title: string; application_date: string; status: string; platform?: string; notes?: string; }
type ApplicationFormData = Omit<JobApplication, 'id' | 'user_id'>;

// Komponen Modal dengan shortcut platform
const ApplicationModal = ({ isOpen, onClose, onSubmit, initialData }: {
  isOpen: boolean; onClose: () => void; onSubmit: (formData: ApplicationFormData) => void; initialData?: JobApplication | null;
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({ company_name: '', job_title: '', platform: '', status: 'Applied', notes: '', application_date: new Date().toISOString().split('T')[0] });
  const platformOptions = ['LinkedIn', 'JobStreet', 'Glints', 'Website'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name, job_title: initialData.job_title, platform: initialData.platform || '', status: initialData.status,
        notes: initialData.notes || '', application_date: new Date(initialData.application_date).toISOString().split('T')[0]
      });
    } else {
      setFormData({ company_name: '', job_title: '', platform: 'LinkedIn', status: 'Applied', notes: '', application_date: new Date().toISOString().split('T')[0] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSubmit(formData); };
  const statusOptions = ['Applied', 'Screening', 'Interview HR', 'Interview User', 'Technical Test', 'Offer', 'Rejected'];
  const setDateQuick = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setFormData({ ...formData, application_date: date.toISOString().split('T')[0] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{initialData ? 'Edit Lamaran' : 'Tambah Lamaran Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium">Nama Perusahaan</label>
            <input id="company_name" type="text" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
          </div>
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium">Posisi yang Dilamar</label>
            <input id="job_title" type="text" required value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Melamar</label>
            <div className="flex items-center gap-2">
              <input type="date" name="application_date" value={formData.application_date} onChange={(e) => setFormData({ ...formData, application_date: e.target.value })} className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
              <button type="button" onClick={() => setDateQuick(0)} className="px-2 py-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-md">Hari ini</button>
              <button type="button" onClick={() => setDateQuick(1)} className="px-2 py-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-md">Kemarin</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Platform</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platformOptions.map(p => (
                  <button key={p} type="button" onClick={() => setFormData({ ...formData, platform: p })} className={`px-3 py-1 text-sm rounded-full border ${formData.platform === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Atau tulis platform lain..." value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium">Status</label>
              <select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600">
                {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Batal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Komponen Dropdown Status ---
const StatusDropdown = ({ app, onStatusChange, isOpen, onToggle }: {
  app: JobApplication; onStatusChange: (id: string, newStatus: string) => void;
  isOpen: boolean; onToggle: () => void;
}) => {
  const statusOptions = ['Applied', 'Screening', 'Interview HR', 'Interview User', 'Technical Test', 'Offer', 'Rejected'];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) onToggle();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleSelect = (newStatus: string) => { onStatusChange(app.id, newStatus); };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'offer': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'interview hr': case 'interview user': case 'technical test': return 'bg-yellow-400 text-yellow-900';
      case 'applied': case 'screening': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={onToggle} className={`text-xs font-medium px-3 py-1 rounded-full w-28 text-center ${getStatusColor(app.status)}`}>
        {app.status}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 border dark:border-gray-600">
          {statusOptions.map(status => (
            <a key={status} href="#" onClick={(e) => { e.preventDefault(); handleSelect(status); }} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              {status}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}


export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const fetchApplications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/'; return; }
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Gagal mengambil data lamaran');
      const data: JobApplication[] = await response.json();
      setApplications(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Terjadi kesalahan tidak diketahui');
    } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    // --- AMBIL NAMA PENGGUNA DARI LOCALSTORAGE ---
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    // ------------------------------------------
    fetchApplications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName'); // Hapus juga nama saat logout
    window.location.href = '/';
  };

  const handleOpenAddModal = () => { setEditingApp(null); setIsModalOpen(true); };
  const handleOpenEditModal = (app: JobApplication) => { setEditingApp(app); setIsModalOpen(true); };

  const handleFormSubmit = async (formData: ApplicationFormData) => {
    const token = localStorage.getItem('accessToken');
    const method = editingApp ? 'PUT' : 'POST';
    const url = editingApp ? `${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${editingApp.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/tracker`;
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Gagal menyimpan data'); }
      setIsModalOpen(false);
      fetchApplications();
    } catch (error) {
        if (error instanceof Error) alert(error.message);
        else alert('Terjadi kesalahan tidak diketahui');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus lamaran ini?")) { return; }
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Gagal menghapus lamaran');
      fetchApplications();
    } catch (error) {
        if (error instanceof Error) alert(error.message);
        else alert('Terjadi kesalahan tidak diketahui');
    }
  };
  
  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('accessToken');
    const currentApp = applications.find(app => app.id === id);
    if (!currentApp) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...currentApp, status: newStatus }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui status');
      fetchApplications();
      setOpenDropdownId(null);
    } catch (error) {
        if (error instanceof Error) alert(error.message);
        else alert('Terjadi kesalahan tidak diketahui');
    }
  };

  const handleDropdownToggle = (appId: string) => { setOpenDropdownId(prevId => (prevId === appId ? null : appId)); };

  return (
    <>
      <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingApp} />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          {/* --- TAMPILKAN NAMA PENGGUNA DI SINI --- */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Selamat Datang, {userName}!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ini adalah daftar lamaran kerjamu.</p>
          </div>
          {/* -------------------------------------- */}
          <div className="flex items-center gap-4">
            <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
              + Tambah Lamaran
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              Logout
            </button>
          </div>
        </header>
        <main>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Daftar Lamaran Kerja Anda</h2>
            {isLoading && <p>Memuat data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!isLoading && !error && (
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div key={app.id} className="p-4 border dark:border-gray-700 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="w-full sm:w-auto">
                        <h3 className="font-bold text-lg">{app.job_title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{app.company_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tanggal Melamar: {new Date(app.application_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                        <StatusDropdown 
                          app={app} 
                          onStatusChange={handleQuickStatusUpdate}
                          isOpen={openDropdownId === app.id}
                          onToggle={() => handleDropdownToggle(app.id)}
                        />
                        <button onClick={() => handleOpenEditModal(app)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDelete(app.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  ))
                ) : ( <p>Anda belum memiliki data lamaran kerja.</p> )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}