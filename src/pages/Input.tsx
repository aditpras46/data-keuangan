import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpCircle, ArrowDownCircle, Info, Calendar, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function InputPage() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Makan',
    source: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = type === 'income' ? '/api/finance/income' : '/api/finance/expense';
    const payload = type === 'income' 
      ? { ...formData, source: formData.source || 'Lainnya' }
      : { ...formData };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Makan', 'Kebutuhan', 'Tabungan', 'Dana Darurat', 'Hiburan'];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-none flex items-center justify-center"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-dark">Berhasil Disimpan!</h2>
        <p className="text-gray-500">Data transaksi Anda telah dicatat ke Spreadsheet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-none border border-slate-200 dark:border-white/5 backdrop-blur-md">
        <button 
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-4 px-4 rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500",
            type === 'expense' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <ArrowDownCircle size={16} /> Pengeluaran
        </button>
        <button 
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-4 px-4 rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500",
            type === 'income' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <ArrowUpCircle size={16} /> Pemasukan
        </button>
      </div>

      <motion.div 
        key={type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-card p-8 border border-white/40 dark:border-white/5"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Nominal Transaksi</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-primary drop-shadow-sm">Rp</span>
              <input
                type="number"
                required
                placeholder="0"
                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-900/40 rounded-none border border-slate-200 dark:border-white/5 transition-all text-3xl font-black placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Tanggal</label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
                <input
                  type="date"
                  required
                  className="w-full pl-14 pr-6 py-5 input-glass font-bold text-sm dark:text-white"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            {type === 'expense' ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Kategori Anggaran</label>
                <div className="relative group">
                  <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
                  <select
                    className="w-full pl-14 pr-6 py-5 input-glass font-black text-sm appearance-none dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Sumber Pendapatan</label>
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Contoh: Gaji"
                    className="w-full pl-14 pr-6 py-5 input-glass font-bold text-sm dark:text-white"
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Catatan Tambahan</label>
            <div className="relative group">
              <FileText className="absolute left-5 top-5 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
              <textarea
                placeholder="Tambahkan detail transaksi..."
                rows={3}
                className="w-full pl-14 pr-6 py-5 input-glass font-bold text-sm resize-none dark:text-white"
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-white/5 rounded-none p-5 flex gap-4 border border-primary/10 dark:border-white/5">
            <Info className="text-primary shrink-0" size={20} />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
              {type === 'income' 
                ? 'Hasil pemasukan akan otomatis dialokasikan ke kategori anggaran sesuai persentase target Anda.'
                : 'Pengeluaran akan langsung memotong saldo pada kategori anggaran yang telah Anda tentukan.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-6 rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border-4 border-white/20 dark:border-black/20",
              type === 'income' ? "bg-primary text-white shadow-primary/30" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            )}
          >
            {loading ? 'Memproses...' : 'Konfirmasi Transaksi'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
