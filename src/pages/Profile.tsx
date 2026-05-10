import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Smartphone, CreditCard, Mail, Save, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    dana: '',
    ovo: '',
    seabank: '',
    bca: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        
        // Also fetch user name from /api/auth/me
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        setProfile({
          ...data,
          name: userData.name || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setMessage('Profil berhasil disimpan!');
      } else {
        setMessage('Gagal menyimpan profil.');
      }
    } catch (err) {
      setMessage('Error koneksi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 bg-[#f8fbff] min-h-screen pb-32">
      <div className="px-6 pt-10 pb-16 bg-primary text-white rounded-b-[3rem] text-center">
         <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
            <User size={48} />
         </div>
         <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile.name || 'USER Name'}</h2>
         <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-1">{profile.email}</p>
      </div>

      <div className="px-6 -mt-8">
         <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Akun</h3>
               
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email (Login)</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                           type="email" 
                           readOnly 
                           value={profile.email}
                           className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm font-bold outline-none"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor DANA</label>
                     <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                        <input 
                           type="text" 
                           placeholder="08xx..."
                           value={profile.dana}
                           onChange={e => setProfile({...profile, dana: e.target.value})}
                           className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:border-primary transition-colors"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor OVO</label>
                     <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-purple" size={18} />
                        <input 
                           type="text" 
                           placeholder="08xx..."
                           value={profile.ovo}
                           onChange={e => setProfile({...profile, ovo: e.target.value})}
                           className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:border-accent-purple transition-colors"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rekening Seabank</label>
                     <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-orange" size={18} />
                        <input 
                           type="text" 
                           placeholder="9019..."
                           value={profile.seabank}
                           onChange={e => setProfile({...profile, seabank: e.target.value})}
                           className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:border-accent-orange transition-colors"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rekening BCA</label>
                     <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                        <input 
                           type="text" 
                           placeholder="1234..."
                           value={profile.bca}
                           onChange={e => setProfile({...profile, bca: e.target.value})}
                           className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                        />
                     </div>
                  </div>
               </div>

               {message && (
                 <p className={cn(
                   "text-[10px] font-black text-center uppercase tracking-widest",
                   message.includes('berhasil') ? "text-emerald-500" : "text-rose-500"
                 )}>
                   {message}
                 </p>
               )}

               <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                  {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
               </button>
            </div>
         </form>

         <button 
            onClick={logout}
            className="w-full mt-6 py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
         >
            <LogOut size={16} />
            Keluar Aplikasi
         </button>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
   return classes.filter(Boolean).join(' ');
}
