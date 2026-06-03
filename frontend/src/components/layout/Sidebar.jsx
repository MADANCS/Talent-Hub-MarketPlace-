import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiOutlineLogout, HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ links = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`h-screen sticky top-0 left-0 bg-slate-900 border-r border-white/5 flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo */}
      <div className={`p-5 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        {!isCollapsed ? (
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              J
            </div>
            <span className="text-base font-black text-white tracking-tight">
              Job<span className="text-indigo-400">Sleuths</span>
            </span>
          </Link>
        ) : (
          <Link to="/" className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/30">
            J
          </Link>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link, i) => {
          const active = location.pathname === link.path;
          return (
            <Link key={i} to={link.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                  <link.icon size={18} />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold truncate">
                    {link.label}
                  </span>
                )}
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 relative">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-white">{user?.name?.[0]}</span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold truncate">{user?.role?.toLowerCase()}</p>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <HiOutlineLogout size={16} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[-12px] w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-sm z-10"
        >
          {isCollapsed ? <HiOutlineChevronRight size={12} /> : <HiOutlineChevronLeft size={12} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
