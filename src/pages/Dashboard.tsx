import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  allocations: {
    category: string;
    allocated: number;
    spent: number;
    percent: number;
    remaining: number;
  }[];
  recentTransactions: any[];
}

const chartData = [
  { name: 'JUN', purple: 400, yellow: 240, teal: 300 },
  { name: 'JUL', purple: 300, yellow: 139, teal: 200 },
  { name: 'AUG', purple: 500, yellow: 380, teal: 450 },
  { name: 'SEP', purple: 450, yellow: 390, teal: 400 },
];

export default function Dashboard() {
  const { user, isDemo } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finance/dashboard?month=${selectedMonth}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const changeMonth = (offset: number) => {
    const d = new Date(selectedMonth + '-01');
    d.setMonth(d.getMonth() + offset);
    setSelectedMonth(d.toISOString().substring(0, 7));
  };

  if (loading && !data) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#050810]">
      <div className="animate-spin rounded-none h-8 w-8 border-4 border-primary border-r-transparent"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 bg-[#f8fbff] min-h-screen">
      {/* Top Section - Blue Background */}
      <div className="bg-primary text-white pt-6 pb-12 px-6 rounded-none shadow-xl relative overflow-hidden">
        {/* Connection Status Badge */}
        <div className="flex justify-center mb-6">
           <div className={cn(
             "px-4 py-1.5 rounded-none flex items-center gap-2 backdrop-blur-md border",
             isDemo ? "bg-amber-500/20 border-amber-500/30 text-amber-200" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
           )}>
              {isDemo ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isDemo ? 'Demo Mode (Local)' : 'Synced with Spreadsheet'}
              </span>
           </div>
        </div>

        <div className="flex items-center justify-between mb-8">
           <button onClick={() => changeMonth(-1)} className="p-2 bg-white/10 rounded-none hover:bg-white/20">
              <ChevronLeft size={20} />
           </button>
           <div className="text-center">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">Periode</p>
              <h2 className="text-sm font-black uppercase tracking-widest italic">{new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
           </div>
           <button onClick={() => changeMonth(1)} className="p-2 bg-white/10 rounded-none hover:bg-white/20">
              <ChevronRight size={20} />
           </button>
        </div>

        <p className="text-center text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-2">Total Saldo</p>
        <h1 className="text-4xl font-black text-center tracking-tight mb-8">
          Rp {data?.balance.toLocaleString('id-ID')}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-white/10 rounded-none p-4 backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold text-white/60 uppercase mb-1">Uang Masuk</p>
              <p className="text-lg font-black text-emerald-300">Rp {data?.totalIncome.toLocaleString('id-ID')}</p>
           </div>
           <div className="bg-white/10 rounded-none p-4 backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold text-white/60 uppercase mb-1">Uang Keluar</p>
              <p className="text-lg font-black text-rose-300">Rp {data?.totalExpense.toLocaleString('id-ID')}</p>
           </div>
        </div>

        <div className="flex justify-between items-center gap-2">
           <button className="action-pill action-pill-active flex-1">Overview</button>
           <button className="action-pill action-pill-inactive flex-1">Daily Log</button>
        </div>
      </div>

      {/* Demo Mode Guide */}
      {isDemo && (
        <div className="mx-6 mt-6 p-6 bg-amber-50 border border-amber-100 rounded-none shadow-sm">
           <div className="flex items-center gap-3 mb-4 text-amber-600">
              <Database size={20} />
              <h3 className="font-black text-sm uppercase tracking-widest text-amber-800">Setup Spreadsheet</h3>
           </div>
           <p className="text-xs text-amber-700 leading-relaxed mb-4">
              Aplikasi saat ini berjalan dalam <b>Mode Demo</b>. Data Anda baru tersimpan di memori sementara. Untuk menyimpan ke Google Sheets:
           </p>
           <ol className="text-[11px] text-amber-700 space-y-2 list-decimal pl-4 font-medium">
              <li>Buka Spreadsheet Anda di browser.</li>
              <li>Klik tombol <b>Bagikan (Share)</b>.</li>
              <li>Tambahkan email Service Account sebagai <b>Editor</b>.</li>
              <li>Masukkan <b>Spreadsheet ID</b> di pengaturan aplikasi.</li>
           </ol>
        </div>
      )}

      {/* Allocation Diagram Section */}
      <div className="px-6 py-10 -mt-6">
        <div className="bg-white rounded-none p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-lg text-slate-900 italic tracking-tighter">ALOKASI DANA</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Split</p>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-none flex items-center justify-center text-primary">
              <PieChartIcon size={24} />
            </div>
          </div>

          {/* Allocation Bar Chart / Nominal List */}
          <div className="space-y-6">
            {data?.allocations.map((item, idx) => {
              const colors = ['bg-accent-teal', 'bg-accent-purple', 'bg-accent-pink', 'bg-accent-orange', 'bg-slate-400'];
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-2.5 h-2.5 rounded-none", colors[idx % colors.length])}></div>
                       <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{item.category}</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      Rp {item.spent.toLocaleString('id-ID')} <span className="text-[9px] text-slate-400 font-bold">/ Rp {item.allocated.toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.percent, 100)}%` }}
                      className={cn("h-full rounded-none shadow-sm", colors[idx % colors.length])}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info Area */}
      <div className="px-6 pb-24">
         <div className="flex items-center gap-4 p-5 bg-white rounded-none shadow-lg border border-slate-50">
            <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center text-primary">
               <Activity size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status Keuangan</p>
               <p className="text-sm font-black text-slate-900 italic">Dompet Sehat & Terkendali</p>
            </div>
         </div>
      </div>
    </div>
  );
}
