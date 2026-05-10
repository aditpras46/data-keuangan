import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard,
  ShoppingCart,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finance/stats?month=${selectedMonth}`)
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
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 bg-white min-h-screen pb-32">
      {/* Header Container */}
      <div className="px-6 pt-10 pb-6 bg-slate-50 rounded-b-[3rem] border-b border-slate-100 flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">STATISTIK</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Laporan Arus Kas</p>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
               <ChevronLeft size={16} />
            </button>
            <div className="text-center">
               <p className="text-[10px] font-black italic text-slate-900">{new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
               <ChevronRight size={16} />
            </button>
         </div>
      </div>

      <div className="px-6 space-y-10 mt-10">
        {/* Income Breakdown */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Jenis Pemasukan</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CreditCard size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            {data?.allocations.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ShoppingCart size={24} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-tighter">ESTIMASI ALOKASI {item.category}</p>
                   <p className="text-sm font-black text-slate-900">Rp {item.allocated.toLocaleString('id-ID')}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Expense Breakdown */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Jenis Pengeluaran</h3>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <ShoppingCart size={16} />
            </div>
          </div>

          <div className="space-y-4">
             {data?.allocations.map((item: any, i: number) => (
               <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                   <CreditCard size={24} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5 tracking-tighter">REALISASI {item.category}</p>
                    <p className="text-sm font-black text-slate-900">Rp {item.spent.toLocaleString('id-ID')}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-rose-400 mb-0.5">{Math.round((item.spent / (item.allocated || 1)) * 100)}%</p>
                    <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-rose-400" style={{ width: `${Math.min((item.spent / (item.allocated || 1)) * 100, 100)}%` }}></div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
}
