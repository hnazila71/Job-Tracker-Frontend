"use client";

import { useEffect, useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// --- Types ---
interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  application_date: string;
  status: string;
  platform?: string;
  notes?: string;
}
type ApplicationFormData = Omit<JobApplication, 'id' | 'user_id'>;

// --- Status Config ---
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'Applied':        { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/30',   hex: '#3b82f6' },
  'Screening':      { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', hex: '#a855f7' },
  'Interview HR':   { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', hex: '#eab308' },
  'Interview User': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', hex: '#f59e0b' },
  'Technical Test': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', hex: '#f97316' },
  'Offer':          { bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/30',  hex: '#22c55e' },
  'Rejected':       { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30',    hex: '#ef4444' },
};

const STATUS_OPTIONS = ['Applied', 'Screening', 'Interview HR', 'Interview User', 'Technical Test', 'Offer', 'Rejected'];
const PLATFORM_OPTIONS = ['LinkedIn', 'JobStreet', 'Glints', 'Website'];

function getStatusClasses(status: string) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return `${cfg.bg} ${cfg.text} ${cfg.border}`;
}

// --- Duplicate Detection ---
function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s\-_.,]/g, '');
}

function findSimilar(formData: ApplicationFormData, existing: JobApplication[], editingId?: string): JobApplication[] {
  const normCompany = normalize(formData.company_name);
  const normTitle = normalize(formData.job_title);
  return existing.filter(app => {
    if (app.id === editingId) return false;
    const ec = normalize(app.company_name);
    const et = normalize(app.job_title);
    const companyMatch = ec === normCompany || ec.includes(normCompany) || normCompany.includes(ec);
    const titleMatch = et === normTitle || et.includes(normTitle) || normTitle.includes(et);
    return companyMatch && titleMatch;
  });
}

// --- Eye Icons ---
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

// --- Set Password Modal (untuk Google user) ---
const SetPasswordModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (password: string) => Promise<void> }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) { setMessage('Password minimal 6 karakter'); return; }
    if (password !== confirm) { setMessage('Password dan konfirmasi tidak cocok'); return; }
    setIsLoading(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm disabled:opacity-50";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Tambah Password</h2>
            <p className="text-slate-400 text-xs mt-0.5">Agar bisa login tanpa Google</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password Baru</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required disabled={isLoading} placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} required disabled={isLoading} placeholder="Ulangi password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition">
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          {message && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{message}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition text-sm">Batal</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition text-sm disabled:opacity-50">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Duplicate Warning Modal ---
const DuplicateWarningModal = ({ matches, onConfirm, onCancel }: {
  matches: JobApplication[]; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
    <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Lamaran Serupa Ditemukan</h3>
            <p className="text-slate-400 text-sm">Kamu mungkin sudah pernah melamar di tempat ini</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {matches.map(app => (
            <div key={app.id} className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3">
              <p className="text-white text-sm font-medium">{app.job_title}</p>
              <p className="text-slate-300 text-sm">{app.company_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClasses(app.status)}`}>{app.status}</span>
                <span className="text-slate-500 text-xs">{new Date(app.application_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-sm mb-5">Apakah kamu tetap ingin menambahkan lamaran ini?</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition text-sm">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg font-semibold transition text-sm">
            Tambah Tetap
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Add Password Prompt Modal (muncul setelah login jika Google user belum set password) ---
const AddPasswordPromptModal = ({ onAddPassword, onSkip }: { onAddPassword: () => void; onSkip: () => void }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm">
      <div className="p-7 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Lengkapi Akun Kamu</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-1">
          Kamu login via Google, tapi belum punya password.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Tambahkan password agar bisa masuk dengan <span className="text-white font-medium">email & password</span> kapan saja, tanpa bergantung pada Google.
        </p>

        {/* Benefits */}
        <div className="w-full bg-slate-700/40 border border-slate-700 rounded-xl p-4 mb-6 space-y-2.5 text-left">
          {[
            'Login tanpa koneksi akun Google',
            'Lebih aman dengan dua metode login',
            'Akses tetap ada meski akun Google bermasalah',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onAddPassword}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all mb-3"
        >
          Tambahkan Password Sekarang
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-slate-400 hover:text-slate-300 text-sm font-medium transition"
        >
          Lewati untuk Sekarang
        </button>
      </div>
    </div>
  </div>
);

// --- Modal ---
const ApplicationModal = ({ isOpen, onClose, onSubmit, initialData }: {
  isOpen: boolean; onClose: () => void; onSubmit: (formData: ApplicationFormData) => void; initialData?: JobApplication | null;
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    company_name: '', job_title: '', platform: 'LinkedIn', status: 'Applied', notes: '',
    application_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name,
        job_title: initialData.job_title,
        platform: initialData.platform || '',
        status: initialData.status,
        notes: initialData.notes || '',
        application_date: new Date(initialData.application_date).toISOString().split('T')[0],
      });
    } else {
      setFormData({ company_name: '', job_title: '', platform: 'LinkedIn', status: 'Applied', notes: '', application_date: new Date().toISOString().split('T')[0] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSubmit(formData); };
  const setDateQuick = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setFormData(prev => ({ ...prev, application_date: d.toISOString().split('T')[0] }));
  };

  const inputCls = "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{initialData ? 'Edit Lamaran' : 'Tambah Lamaran Baru'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Perusahaan</label>
              <input type="text" required value={formData.company_name} onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))} className={inputCls} placeholder="Tokopedia" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Posisi</label>
              <input type="text" required value={formData.job_title} onChange={(e) => setFormData(p => ({ ...p, job_title: e.target.value }))} className={inputCls} placeholder="Frontend Developer" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Tanggal Melamar</label>
            <div className="flex gap-2">
              <input type="date" value={formData.application_date} onChange={(e) => setFormData(p => ({ ...p, application_date: e.target.value }))} className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => setDateQuick(0)} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition whitespace-nowrap">Hari ini</button>
              <button type="button" onClick={() => setDateQuick(1)} className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition whitespace-nowrap">Kemarin</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Platform</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PLATFORM_OPTIONS.map(p => (
                <button key={p} type="button" onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                  className={`px-3 py-1 text-xs rounded-full border transition ${formData.platform === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  {p}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Atau tulis platform lain..." value={formData.platform || ''} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className={inputCls}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Catatan</label>
            <textarea value={formData.notes || ''} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Catatan tambahan..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition text-sm">Batal</button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition text-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Custom Tooltip for Charts ---
const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-medium">{p.name ? `${p.name}: ` : ''}<span style={{ color: p.fill || '#6366f1' }}>{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Dashboard ---
export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [duplicateMatches, setDuplicateMatches] = useState<JobApplication[]>([]);
  const [pendingFormData, setPendingFormData] = useState<ApplicationFormData | null>(null);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);

  const fetchApplications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/'; return; }
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal mengambil data lamaran');
      const data: JobApplication[] = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    fetchApplications();
    // Cek apakah user Google yang belum punya password
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.google_id !== undefined) {
            const hp = d.has_password as boolean;
            setHasPassword(hp);
            // Tampilkan prompt setiap login jika belum set password
            if (!hp && !sessionStorage.getItem('pwPromptShown')) {
              setIsPasswordPromptOpen(true);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // --- Stats ---
  const stats = useMemo(() => ({
    total: applications.length,
    active: applications.filter(a => a.status !== 'Offer' && a.status !== 'Rejected').length,
    offer: applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }), [applications]);

  // --- Donut chart data ---
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: STATUS_CONFIG[name]?.hex || '#6366f1' }));
  }, [applications]);

  // --- Bar chart data (last 6 months) ---
  const barData = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleDateString('id-ID', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      });
    }
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const d = new Date(a.application_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return months.map(m => ({ name: m.label, Lamaran: counts[m.key] || 0 }));
  }, [applications]);

  // --- Filtered list ---
  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const matchSearch = searchQuery === '' ||
        a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.job_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'Semua' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('pwPromptShown');
    router.push('/');
  };

  const saveApplication = async (formData: ApplicationFormData) => {
    const token = localStorage.getItem('accessToken');
    const method = editingApp ? 'PUT' : 'POST';
    const url = editingApp ? `${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${editingApp.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/tracker`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Gagal menyimpan data'); }
      const savedApp: JobApplication = await res.json();
      setIsModalOpen(false);
      if (editingApp) {
        setApplications(prev => prev.map(a => a.id === editingApp.id ? savedApp : a));
      } else {
        setApplications(prev => [savedApp, ...prev]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui');
    }
  };

  const handleFormSubmit = (formData: ApplicationFormData) => {
    // Cek duplikat hanya saat tambah baru (bukan edit)
    if (!editingApp) {
      const similar = findSimilar(formData, applications);
      if (similar.length > 0) {
        setPendingFormData(formData);
        setDuplicateMatches(similar);
        return;
      }
    }
    saveApplication(formData);
  };

  const handleDuplicateConfirm = () => {
    if (pendingFormData) saveApplication(pendingFormData);
    setDuplicateMatches([]);
    setPendingFormData(null);
  };

  const handleDuplicateCancel = () => {
    setDuplicateMatches([]);
    setPendingFormData(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus lamaran ini?')) return;
    const token = localStorage.getItem('accessToken');
    const prev = applications;
    setApplications(p => p.filter(a => a.id !== id));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal menghapus');
    } catch (error) {
      setApplications(prev);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('accessToken');
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp || currentApp.status === newStatus) return;
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...currentApp, status: newStatus }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui status');
    } catch (error) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: currentApp.status } : a));
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const handleSetPassword = async (password: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    setHasPassword(true);
    setIsSetPasswordOpen(false);
  };

  const firstName = userName.split(' ')[0];

  const handlePasswordPromptAdd = () => {
    sessionStorage.setItem('pwPromptShown', '1');
    setIsPasswordPromptOpen(false);
    setIsSetPasswordOpen(true);
  };

  const handlePasswordPromptSkip = () => {
    sessionStorage.setItem('pwPromptShown', '1');
    setIsPasswordPromptOpen(false);
  };

  return (
    <>
      <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingApp} />
      {duplicateMatches.length > 0 && (
        <DuplicateWarningModal matches={duplicateMatches} onConfirm={handleDuplicateConfirm} onCancel={handleDuplicateCancel} />
      )}
      {isPasswordPromptOpen && (
        <AddPasswordPromptModal onAddPassword={handlePasswordPromptAdd} onSkip={handlePasswordPromptSkip} />
      )}
      {isSetPasswordOpen && (
        <SetPasswordModal onClose={() => setIsSetPasswordOpen(false)} onSubmit={handleSetPassword} />
      )}

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm sm:text-base">Halo, {firstName}!</h1>
                <p className="text-slate-400 text-xs hidden sm:block">Semangat dalam mencari kerja</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tombol set-password: hanya muncul jika Google user tanpa password */}
              {hasPassword === false && (
                <button
                  onClick={() => setIsSetPasswordOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium rounded-lg transition"
                  title="Tambahkan password agar bisa login tanpa Google"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <span className="hidden sm:inline">Tambah Password</span>
                </button>
              )}
              <button
                onClick={() => { setEditingApp(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">Tambah</span>
              </button>
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-200 text-sm transition px-2 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Lamaran', value: stats.total, color: 'text-indigo-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'Masih Aktif', value: stats.active, color: 'text-cyan-400', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { label: 'Offer', value: stats.offer, color: 'text-green-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Ditolak', value: stats.rejected, color: 'text-red-400', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map(card => (
              <div key={card.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-medium">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-slate-700/50`}>
                    <svg className={`w-5 h-5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          {applications.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Donut Chart */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="text-white font-semibold text-sm mb-4">Distribusi Status</h3>
                <div className="flex items-center justify-center" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                      <Legend
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                        wrapperStyle={{ paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="text-white font-semibold text-sm mb-4">Lamaran per Bulan</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1e293b' }} />
                      <Bar dataKey="Lamaran" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari perusahaan atau posisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none cursor-pointer min-w-36"
            >
              <option value="Semua" className="bg-slate-800">Semua Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
            </select>
          </div>

          {/* Application List */}
          <div>
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
            )}
            {!isLoading && !error && (
              <>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-400 text-sm">{applications.length === 0 ? 'Belum ada lamaran. Tambahkan lamaran pertamamu!' : 'Tidak ada hasil yang cocok.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map((app) => {
                      const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['Applied'];
                      return (
                        <div key={app.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm hover:border-slate-600/50 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${statusCfg.bg.replace('/20', '')} ring-2 ring-current ${statusCfg.text}`} />
                                <div>
                                  <h3 className="text-white font-semibold text-sm leading-tight">{app.job_title}</h3>
                                  <p className="text-slate-300 text-sm mt-0.5">{app.company_name}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {app.platform && (
                                      <span className="text-slate-500 text-xs">{app.platform}</span>
                                    )}
                                    <span className="text-slate-500 text-xs">
                                      {new Date(app.application_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  {app.notes && <p className="text-slate-500 text-xs mt-1 truncate max-w-xs">{app.notes}</p>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Status Select */}
                              <div className="relative">
                                <select
                                  value={app.status}
                                  onChange={(e) => handleQuickStatusUpdate(app.id, e.target.value)}
                                  className={`text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${getStatusClasses(app.status)} bg-transparent`}
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s} className="text-white bg-slate-800">{s}</option>
                                  ))}
                                </select>
                                <svg className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusCfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>

                              <button
                                onClick={() => { setEditingApp(app); setIsModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                title="Hapus"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Count info */}
                {applications.length > 0 && (
                  <p className="text-slate-500 text-xs text-center mt-4">
                    Menampilkan {filteredApplications.length} dari {applications.length} lamaran
                  </p>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
