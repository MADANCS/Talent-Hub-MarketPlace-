import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineFilter, HiOutlineLocationMarker,
  HiOutlineBriefcase, HiOutlineStar, HiOutlineSparkles,
  HiOutlineBookmark, HiOutlineExternalLink, HiOutlineChevronDown,
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineCurrencyRupee,
  HiOutlineGlobe, HiOutlineCheck, HiOutlineX, HiOutlineAdjustments
} from 'react-icons/hi';

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'Go',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Next.js',
  'Machine Learning', 'DevOps', 'Flutter', 'Swift', 'Rust', 'SQL', 'Redis'
];

const AVAILABILITY = ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 3 months'];
const EXPERIENCE_LEVELS = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

const TalentSearch = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    minSalary: '',
    maxSalary: '',
    isOpenToWork: false,
    remotePreference: '',
    experienceLevel: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [saved, setSaved] = useState(new Set());

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search };
      if (filters.skills.length) params.skills = filters.skills.join(',');
      if (filters.location) params.location = filters.location;
      if (filters.isOpenToWork) params.isOpenToWork = true;
      const res = await userAPI.searchCandidates(params);
      setCandidates(res.data?.candidates || res.data?.users || []);
      setTotal(res.data?.total || 0);
    } catch {
      // Generate mock data for demo
      const mockCandidates = Array.from({ length: 12 }, (_, i) => ({
        _id: `mock_${i}`,
        name: ['Arjun Patel', 'Priya Sharma', 'Rahul Kumar', 'Sneha Gupta', 'Vikram Singh', 'Ananya Reddy', 'Karthik Nair', 'Meera Joshi', 'Aditya Verma', 'Riya Kapoor', 'Sanjay Rao', 'Divya Iyer'][i],
        skills: SKILL_OPTIONS.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 4)),
        location: ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'][Math.floor(Math.random() * 6)],
        bio: 'Passionate software engineer with expertise in building scalable applications and solving complex problems.',
        isOpenToWork: Math.random() > 0.3,
        profileCompleteness: 60 + Math.floor(Math.random() * 40),
        aiMatchScore: 55 + Math.floor(Math.random() * 45),
        experience: [{ title: ['Sr. Engineer', 'Full Stack Dev', 'Backend Lead', 'Frontend Dev'][Math.floor(Math.random() * 4)], company: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys'][Math.floor(Math.random() * 5)] }],
        avatar: '',
        expectedSalary: (8 + Math.floor(Math.random() * 30)) * 100000,
        gamification: { level: 1 + Math.floor(Math.random() * 10), rank: ['Initiate', 'Explorer', 'Specialist', 'Expert', 'Master'][Math.floor(Math.random() * 5)] }
      }));
      setCandidates(mockCandidates);
      setTotal(mockCandidates.length);
    } finally {
      setLoading(false);
    }
  }, [search, filters, page]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(debouncedSearch), 200);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const toggleSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    toast.success(saved.has(id) ? 'Removed from saved' : 'Candidate saved');
  };

  const getMatchColor = (score) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-violet-950/50" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
              <HiOutlineSparkles size={12} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI-Powered Discovery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Find <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Exceptional</span> Talent
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">Search across {total || '500+'}  verified candidates with AI-powered matching scores</p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/5 focus-within:border-indigo-500/40 transition-all">
              <HiOutlineSearch size={18} className="text-slate-500 ml-5" />
              <input
                value={debouncedSearch}
                onChange={e => setDebouncedSearch(e.target.value)}
                placeholder="Search by name, skill, location..."
                className="flex-1 bg-transparent text-white text-sm py-4 px-4 outline-none placeholder-slate-600"
              />
              <button onClick={() => setShowFilters(!showFilters)}
                className={`mr-2 p-2.5 rounded-xl transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <HiOutlineAdjustments size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-b border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
              {/* Skills */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button key={skill} onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        filters.skills.includes(skill)
                          ? 'bg-indigo-600 text-white border border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-white/10'
                      }`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                  <input value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                    placeholder="City or Remote"
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remote Pref</p>
                  <select value={filters.remotePreference} onChange={e => setFilters(p => ({ ...p, remotePreference: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none">
                    <option value="">All</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Open to Work</p>
                  <button onClick={() => setFilters(p => ({ ...p, isOpenToWork: !p.isOpenToWork }))}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      filters.isOpenToWork ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-white/5'
                    }`}>
                    {filters.isOpenToWork ? '✅ Yes Only' : 'All Candidates'}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</p>
                  <select value={filters.experienceLevel} onChange={e => setFilters(p => ({ ...p, experienceLevel: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none">
                    <option value="">All</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-slate-400">
            <span className="text-white font-bold">{total}</span> candidates found
            {filters.skills.length > 0 && <span className="text-indigo-400 ml-2">· {filters.skills.length} skills selected</span>}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-white/5 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-slate-800 rounded w-2/3" /><div className="h-3 bg-slate-800 rounded w-1/2" /></div>
                </div>
                <div className="space-y-2"><div className="h-3 bg-slate-800 rounded" /><div className="h-3 bg-slate-800 rounded w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((c, i) => (
              <motion.div key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group overflow-hidden"
              >
                {/* Match Score Bar */}
                <div className="h-1 bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${c.aiMatchScore || 0}%` }} />
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> :
                        <span className="text-xl font-black text-indigo-400">{c.name?.[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                        {c.isOpenToWork && (
                          <span className="shrink-0 text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">
                            Open
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.experience?.[0]?.title}{c.experience?.[0]?.company ? ` at ${c.experience[0].company}` : ''}
                      </p>
                      {c.location && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <HiOutlineLocationMarker size={10} /> {c.location}
                        </p>
                      )}
                    </div>
                    <div className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs font-black ${getMatchColor(c.aiMatchScore || 0)}`}>
                      {c.aiMatchScore || 0}%
                    </div>
                  </div>

                  {/* Bio */}
                  {c.bio && <p className="text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">{c.bio}</p>}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.skills?.slice(0, 5).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {c.skills?.length > 5 && (
                      <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-400">+{c.skills.length - 5}</span>
                    )}
                  </div>

                  {/* Level & Salary */}
                  <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-500">
                    {c.gamification && (
                      <span className="flex items-center gap-1">
                        <HiOutlineStar size={10} className="text-amber-400" />
                        Lv.{c.gamification.level} · {c.gamification.rank}
                      </span>
                    )}
                    {c.expectedSalary > 0 && (
                      <span className="flex items-center gap-1">
                        <HiOutlineCurrencyRupee size={10} />
                        {(c.expectedSalary / 100000).toFixed(0)}L/yr
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/profile/${c._id}`}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5">
                      <HiOutlineUser size={12} /> View Profile
                    </Link>
                    <button onClick={() => toggleSave(c._id)}
                      className={`px-3 py-2.5 rounded-xl transition-all ${
                        saved.has(c._id) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                      }`}>
                      <HiOutlineBookmark size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(Math.ceil(total / 12))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentSearch;
