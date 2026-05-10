import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Plus, BarChart3, LogOut, User, Sun, Moon, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-sans overflow-x-hidden">
      {/* Mobile Frame Wrapper */}
      <div className="w-full max-w-md min-h-screen md:h-[850px] md:min-h-0 bg-white dark:bg-[#0b101c] md:rounded-[3.5rem] md:shadow-2xl overflow-hidden relative flex flex-col border-[8px] border-slate-900 shadow-3xl">
        
        {/* Notch */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50"></div>

        {/* Header - Simple Menu & Profile */}
        <header className="bg-primary px-6 pt-12 pb-4 flex justify-between items-center text-white">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Activity size={24} />
          </button>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
                <p className="text-xs font-black tracking-tight leading-none italic uppercase">Member</p>
             </div>
             <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img src={`https://i.pravatar.cc/100?u=${user?.id || '1'}`} alt="avatar" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900">
          <Outlet />
        </main>

        {/* Navigation Bottom - Creative Style from Image */}
        <div className="bg-primary px-6 py-2 overflow-visible relative">
           <div className="absolute -top-10 left-0 right-0 h-12 bg-primary rounded-t-[3rem]"></div>
           <nav className="flex items-center justify-between px-2 pt-2 pb-6 relative z-10">
              <BottomNavItem to="/" icon={<LayoutDashboard size={20} />} />
              <BottomNavItem to="/reports" icon={<BarChart3 size={20} />} />
              <BottomNavItem to="/input" icon={<Plus size={20} />} />
              <BottomNavItem to="/history" icon={<History size={20} />} />
              <BottomNavItem to="/profile" icon={<User size={20} />} />
           </nav>
        </div>
      </div>
    </div>
  );
}

function BottomNavItem({ to, icon }: { to: string, icon: React.ReactNode }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "nav-circle",
        isActive && "nav-circle-active"
      )}
    >
      {icon}
    </NavLink>
  );
}
