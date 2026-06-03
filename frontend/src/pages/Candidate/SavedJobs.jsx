import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import {
  HiOutlineBookmark, HiOutlineBriefcase, HiOutlineLocationMarker,
  HiOutlineCurrencyDollar, HiOutlineTrash, HiOutlineExternalLink,
  HiOutlineChartBar, HiOutlineStar, HiOutlineChat, HiOutlineUserCircle,
  HiOutlineSearch, HiOutlineFilter
} from 'react-icons/hi';

const STATUS_COLORS = {
  ACTIVE:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  CLOSED:  'bg-red-500/10 border-red-500/20 text-red-400',
  PAUSED:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
  EXPIRED: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
};

const SavedJobs = () => {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [removing, setRemoving]   = useState(null);
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState('All');

  const sidebarLinks = [
    { label: 'Dashboard',    path: '/candidate/dashboard',    icon: HiOutlineChartBar },
    { label: 'Applications', path: '/candidate/applications', icon: HiOutlineBriefcase },
    { label: 'Saved Jobs',   path: '/candidate/saved-jobs',   icon: HiOutlineBookmark },
    { label: 'Leaderboard',  path: '/candidate/leaderboard',  icon: HiOutlineStar },
    { label: 'Messages',     path: '/messages',               icon: HiOutlineChat },
    { label: 'Profile',      path: '/profile/edit',           icon: HiOutlineUserCircle },
  ];

  useEffect(() => {
    userAPI.getSavedJobs()
      .then(res => setJobs(res.data.savedJobs || []))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId) => {
    setRemoving(jobId);
    try {
      await userAPI.unsaveJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job removed from saved');
    } catch {
      toast.error('Failed to remove job');
    } finally {
      setRemoving(null);
    }
  };

  const jobTypes = ['All', ...new Set(jobs.map(j => j.jobType).filter(Boolean))];

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || j.jobType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={sidebarLinks} />

      <main className="flex-1 overflow-y-auto px-6 py-10 relative">
        {/* Glow BG */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <HiOutlineBookmark className="text-indigo-400" />
                Saved Jobs
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} bookmarked
              </p>
            </div>
            <Link to="/jobs"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Browse More Jobs
            </Link>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-indigo-500/40 transition-all">
              <HiOutlineSearch className="text-slate-500 shrink-0" size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search saved jobs..."
                className="bg-transparent text-white text-sm ml-3 outline-none w-full placeholder-slate-600"
              />
            </div>
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <HiOutlineFilter className="text-slate-500" size={16} />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-900 border border-white/5 text-slate-300 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500/40">
                {jobTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Job Cards */}
          {loading ? (
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-slate-900/40 rounded-[24px] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-slate-900/20 rounded-[32px] border border-dashed border-slate-800">
              <HiOutlineBookmark size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg mb-2">No saved jobs yet</p>
              <p className="text-slate-600 text-sm mb-6">Bookmark jobs you're interested in to review them later</p>
              <Link to="/jobs"
                className="px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-500 transition-all">
                Explore Jobs
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filtered.map((job, i) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 rounded-[24px] p-5 transition-all flex items-center gap-5"
                  >
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-xl font-black text-slate-500 shrink-0 overflow-hidden">
                      {job.companyLogo
                        ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-2xl" />
                        : job.company?.[0] || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link to={`/jobs/${job._id}`}
                          className="text-white font-bold text-base hover:text-indigo-400 transition-colors truncate">
                          {job.title}
                        </Link>
                        <span className={`hidden sm:inline text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[job.status] || STATUS_COLORS.ACTIVE}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm font-medium truncate">{job.company}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {job.location && (
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase">
                            <HiOutlineLocationMarker size={11} /> {job.location}
                          </span>
                        )}
                        {job.jobType && (
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase">
                            <HiOutlineBriefcase size={11} /> {job.jobType}
                          </span>
                        )}
                        {job.salaryMin > 0 && (
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase">
                            <HiOutlineCurrencyDollar size={11} />
                            {job.salaryMin >= 1000
                              ? `₹${Math.round(job.salaryMin/1000)}k – ₹${Math.round(job.salaryMax/1000)}k`
                              : `₹${job.salaryMin} – ₹${job.salaryMax}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Link to={`/jobs/${job._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <HiOutlineExternalLink size={12} /> Apply
                      </Link>
                      <button
                        onClick={() => handleRemove(job._id)}
                        disabled={removing === job._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-600 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        {removing === job._id
                          ? <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          : <HiOutlineTrash size={12} />}
                        {removing === job._id ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedJobs;
