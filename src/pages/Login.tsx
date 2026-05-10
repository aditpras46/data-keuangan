import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, User, Loader2, BarChart3, Fingerprint, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          login(data.user);
          navigate('/');
        } else {
          setIsLogin(true);
          setError('Akun berhasil dibuat! Silahkan masuk.');
        }
      } else {
        setError(data.error || 'Terjadi kesalahan sistem');
      }
    } catch (err) {
      setError('Gangguan koneksi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-50"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-none blur-[120px] -mr-40 -mt-40"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-none blur-[100px] -ml-20 -mb-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center justify-center gap-6 mb-12">
          <div className="w-20 h-20 bg-primary rounded-none flex items-center justify-center shadow-3xl shadow-primary/40 rotate-12 hover:rotate-0 transition-transform duration-700 group">
            <BarChart3 className="text-white w-10 h-10 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white italic">FINTRACK</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2 opacity-80">Wealth Intelligence</p>
          </div>
        </div>

        <div className="modern-card p-10 border border-white/40 dark:border-white/5 !rounded-none shadow-4xl backdrop-blur-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {isLogin ? 'Selamat Datang' : 'Mulai Sekarang'}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
               {isLogin ? 'Masuk untuk sistem keamanan' : 'Registrasi akun premium gratis'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-500/10 text-rose-500 p-4 rounded-none text-[10px] font-black uppercase tracking-wider mb-8 border border-rose-500/20 flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-rose-500 rounded-none animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative group">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    className="w-full pl-14 pr-6 py-4 input-glass font-bold text-sm dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative group">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Alamat Email"
                  className="w-full pl-14 pr-6 py-4 input-glass font-bold text-sm dark:text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-14 pr-6 py-4 input-glass font-bold text-sm dark:text-white"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-none font-black uppercase tracking-widest text-[10px] shadow-3xl shadow-primary/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 border-4 border-white/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Fingerprint size={18} />
                  {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              {isLogin ? 'Belum punya akun? ' : 'Sudah terdaftar? '}
              <span className="text-primary underline decoration-primary/20 underline-offset-4 ml-1">
                {isLogin ? 'Mulai Daftar' : 'Masuk Sini'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-3 opacity-30">
           <ShieldCheck size={16} className="text-slate-500" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
             SECURED BY AI-TECH
           </p>
        </div>
      </motion.div>
    </div>
  );
}
