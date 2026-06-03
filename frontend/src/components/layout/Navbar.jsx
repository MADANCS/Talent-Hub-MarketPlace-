import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineSearch, HiOutlineBell, HiOutlineUserCircle,
  HiMenu, HiX, HiOutlineBriefcase, HiOutlineUsers,
  HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineChatAlt2,
  HiOutlineSparkles, HiOutlineLogout, HiOutlineCog,
  HiOutlineHome, HiOutlineViewGrid, HiOutlineChevronDown,
  HiOutlineBookmark, HiOutlineMoon, HiOutlineSun
} from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/'
    || location.pathname === path;

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
  };

  // Role-based nav items
  const getCandidateLinks = () => [
    { to: '/my-feed',                label: 'Job Feed',    icon: <HiOutlineHome size={15} /> },
    { to: '/jobs',                   label: 'Browse Jobs', icon: <HiOutlineBriefcase size={15} /> },
    { to: '/candidate/applications', label: 'Applications',icon: <HiOutlineViewGrid size={15} /> },
    { to: '/candidate/saved-jobs',   label: 'Saved',       icon: <HiOutlineBookmark size={15} /> },
    { to: '/candidate/leaderboard',  label: 'Leaderboard', icon: <HiOutlineChartBar size={15} /> },
    { to: '/messages',               label: 'Messages',    icon: <HiOutlineChatAlt2 size={15} /> },
  ];

  const getRecruiterLinks = () => [
    { to: '/recruiter/dashboard',    label: 'Dashboard',  icon: <HiOutlineHome size={15} /> },
    { to: '/recruiter/analytics',    label: 'Analytics',  icon: <HiOutlineChartBar size={15} /> },
    { to: '/recruiter/talent',       label: 'Find Talent',icon: <HiOutlineUsers size={15} /> },
    { to: '/recruiter/pipeline',     label: 'Pipeline',   icon: <HiOutlineViewGrid size={15} /> },
    { to: '/recruiter/jobs',         label: 'My Jobs',    icon: <HiOutlineBriefcase size={15} /> },
    { to: '/messages',               label: 'Messages',   icon: <HiOutlineChatAlt2 size={15} /> },
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard',        label: 'Admin',      icon: <HiOutlineLightningBolt size={15} /> },
    { to: '/recruiter/talent',       label: 'Talent',     icon: <HiOutlineUsers size={15} /> },
    { to: '/jobs',                   label: 'Jobs',        icon: <HiOutlineBriefcase size={15} /> },
  ];

  const getPublicLinks = () => [
    { to: '/jobs',                label: 'Browse Jobs',   icon: <HiOutlineBriefcase size={15} /> },
    { to: '/talent-search',       label: 'Find Talent',  icon: <HiOutlineUsers size={15} /> },
    { to: '/market-intelligence', label: 'Market Intel', icon: <HiOutlineChartBar size={15} /> },
    { to: '/pricing',             label: 'Pricing',       icon: <HiOutlineSparkles size={15} /> },
  ];

  const navLinks = !user ? getPublicLinks()
    : user.role === 'RECRUITER' ? getRecruiterLinks()
    : user.role === 'ADMIN' ? getAdminLinks()
    : getCandidateLinks();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  const roleBadge = user?.role === 'RECRUITER'
    ? { label: 'Recruiter', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' }
    : user?.role === 'ADMIN'
    ? { label: 'Admin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    : user
    ? { label: 'Candidate', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
    : null;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HiOutlineLightningBolt size={18} className="text-white" />
            </div>
            <span className="text-base font-black text-white hidden sm:block tracking-tight">
              Talent<span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs items-center bg-slate-800 border border-white/5 rounded-xl px-3 py-2 focus-within:border-indigo-500/40 transition-all">
            <HiOutlineSearch size={15} className="text-slate-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies..."
              className="bg-transparent text-white text-xs ml-2 outline-none w-full placeholder-slate-600"
            />
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  isActive(link.to)
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all"
            >
              {isDarkMode ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
            </button>

            {user ? (
              <>
                <NotificationDropdown />

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 bg-slate-800 border border-white/5 rounded-xl hover:border-white/10 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center overflow-hidden shrink-0">
                      {user.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-black text-white">{user.name?.[0]}</span>
                      }
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-white leading-tight">{user.name?.split(' ')[0]}</p>
                      {roleBadge && (
                        <span className={`text-[8px] font-black uppercase border px-1.5 py-0.5 rounded-full ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      )}
                    </div>
                    <HiOutlineChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 py-2 overflow-hidden"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/5 mb-1">
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>

                        <Link to={getDashboardPath()} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                          <HiOutlineHome size={14} /> Dashboard
                        </Link>
                        <Link to={`/profile/${user._id}`} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                          <HiOutlineUserCircle size={14} /> My Profile
                        </Link>
                        <Link to="/profile/edit" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                          <HiOutlineCog size={14} /> Settings
                        </Link>
                        <Link to="/pricing" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors">
                          <HiOutlineSparkles size={14} /> Upgrade Plan
                        </Link>

                        <div className="border-t border-white/5 mt-1 pt-1">
                          <button onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                            <HiOutlineLogout size={14} /> Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
                  Log in
                </Link>
                <Link to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/5 bg-slate-900 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="flex items-center bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 mb-3">
                <HiOutlineSearch size={15} className="text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..."
                  className="bg-transparent text-white text-sm ml-2 outline-none w-full placeholder-slate-600" />
              </form>

              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive(link.to)
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  {link.icon} {link.label}
                </Link>
              ))}

              {/* Auth section */}
              <div className="pt-3 border-t border-white/5 mt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                        <span className="font-black text-white">{user.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        {roleBadge && <span className={`text-[9px] font-black uppercase ${roleBadge.color}`}>{roleBadge.label}</span>}
                      </div>
                    </div>
                    <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
                      <HiOutlineHome size={16} /> Dashboard
                    </Link>
                    <Link to="/profile/edit" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
                      <HiOutlineCog size={16} /> Settings
                    </Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 rounded-xl">
                      <HiOutlineLogout size={16} /> Log Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-3 text-sm font-bold text-slate-300 border border-white/10 rounded-xl hover:bg-white/5">
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-3 text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl">
                      Get Started →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
