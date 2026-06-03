import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineLocationMarker, HiOutlineBriefcase,
  HiOutlineClock, HiOutlineStar, HiOutlineBookmark, HiOutlineFire,
  HiOutlineSparkles, HiOutlineCurrencyRupee, HiOutlineOfficeBuilding,
  HiOutlineGlobe, HiOutlineChevronRight, HiOutlineLightningBolt,
  HiOutlineHeart, HiOutlineShare, HiOutlineCheck, HiOutlineFilter,
  HiOutlineUsers, HiOutlineTrendingUp, HiOutlineX
} from 'react-icons/hi';

const TAGS = ['Remote', 'Full-time', 'High Match', 'New Today', 'Urgent', 'Senior', 'Startup', 'MNC'];
const SALARY_RANGES = ['Any', '3-6 LPA', '6-12 LPA', '12-20 LPA', '20-35 LPA', '35+ LPA'];

const mockJobs = Array.from({ length: 20 }, (_, i) => ({
  _id: `job_${i}`,
  title: ['Senior React Developer', 'Backend Engineer', 'DevOps Lead', 'ML Engineer', 'Full Stack Developer', 'Product Designer', 'Data Scientist', 'Cloud Architect'][i % 8],
  company: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay', 'CRED', 'PhonePe', 'Meesho', 'Swiggy', 'Zomato'][i % 10],
  location: ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Remote', 'Pune'][i % 6],
  salary: { min: (6 + i * 2) * 100000, max: (12 + i * 3) * 100000 },
  type: ['Full-time', 'Contract', 'Remote'][i % 3],
  skills: [['React', 'Node.js', 'AWS'], ['Python', 'ML', 'TensorFlow'], ['Go', 'K8s', 'Docker'], ['TypeScript', 'GraphQL', 'MongoDB']][i % 4],
  aiMatchScore: 50 + Math.floor(Math.random() * 50),
  applicants: 12 + Math.floor(Math.random() * 200),
  postedAt: new Date(Date.now() - (i + 1) * 3600000 * 12).toISOString(),
  isUrgent: i % 5 === 0,
  isFeatured: i % 7 === 0,
  companyRating: (3.5 + Math.random() * 1.5).toFixed(1),
  description: 'We are looking for a passionate engineer to join our fast-growing team. You will work on challenging problems at scale and have the opportunity to shape the product direction.',
  benefits: ['Health Insurance', 'Remote Friendly', 'Stock Options', 'Learning Budget'],
  status: 'ACTIVE',
}));

const JobCard = ({ job, onApply, onSave, saved }) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const salaryStr = job.salary
    ? `₹${(job.salary.min / 100000).toFixed(0)}–${(job.salary.max / 100000).toFixed(0)} LPA`
    : 'Salary not disclosed';

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const scoreColor = (job.aiMatchScore || 0) >= 80
    ? 'from-emerald-500 to-teal-500'
    : (job.aiMatchScore || 0) >= 60
    ? 'from-blue-500 to-indigo-500'
    : 'from-amber-500 to-orange-500';

  const handleApply = async () => {
    setApplying(true);
    await onApply(job._id);
    setApplied(true);
    setApplying(false);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/5 ${
        job.isFeatured ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'border-white/5 hover:border-indigo-500/20'
      }`}>
      {/* Featured banner */}
      {job.isFeatured && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-b border-indigo-500/20 flex items-center gap-2">
          <HiOutlineLightningBolt size={11} className="text-indigo-400" />
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Featured Opportunity</span>
        </div>
      )}
      {/* AI Match score bar */}
      <div className="h-0.5 bg-slate-800">
        <div className={`h-full bg-gradient-to-r ${scoreColor}`} style={{ width: `${job.aiMatchScore}%`, transition: 'width 1s ease' }} />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 border border-white/5 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-white">{job.company?.[0]}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate leading-tight">{job.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                  <HiOutlineOfficeBuilding size={11} /> {job.company}
                  <span className="text-slate-600">·</span>
                  <HiOutlineStar size={10} className="text-amber-400" />
                  <span className="text-amber-400">{job.companyRating}</span>
                </p>
              </div>
              <div className={`shrink-0 px-2.5 py-1.5 rounded-xl bg-gradient-to-r ${scoreColor} text-white text-[10px] font-black`}>
                {job.aiMatchScore}% match
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><HiOutlineLocationMarker size={10} /> {job.location}</span>
              <span className="flex items-center gap-1"><HiOutlineCurrencyRupee size={10} /> {salaryStr}</span>
              <span className="flex items-center gap-1"><HiOutlineBriefcase size={10} /> {job.type}</span>
              <span className="flex items-center gap-1 ml-auto"><HiOutlineClock size={10} /> {timeAgo(job.postedAt)}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills?.slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-wider">{skill}</span>
              ))}
              {job.isUrgent && (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <HiOutlineFire size={9} /> Urgent
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.benefits?.map(b => (
                    <span key={b} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <HiOutlineCheck size={9} /> {b}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><HiOutlineUsers size={10} /> {job.applicants} applicants</span>
            <button onClick={() => setExpanded(!expanded)} className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
              {expanded ? 'Show less' : 'View details'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => onSave(job._id)}
              className={`p-2 rounded-xl transition-all ${saved ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <HiOutlineBookmark size={14} />
            </button>
            <button
              onClick={handleApply}
              disabled={applying || applied}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                applied
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              } disabled:opacity-70`}>
              {applying ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
               applied ? <><HiOutlineCheck size={12} /> Applied</> : '⚡ Quick Apply'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const JobFeed = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [salaryRange, setSalaryRange] = useState('Any');
  const [topStats, setTopStats] = useState({ views: 1247, matches: 23, saved: 5 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await jobAPI.getJobs({ limit: 20, status: 'ACTIVE' });
        const data = res.data?.jobs || [];
        setJobs(data.length ? data : mockJobs);
      } catch {
        setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await applicationAPI.apply({ jobId, coverLetter: 'I am very interested in this position.' });
      toast.success('🚀 Application submitted!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      if (msg.includes('already')) toast.error('Already applied to this job');
      else toast.error(msg);
    }
  };

  const toggleSave = (id) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast('Removed from saved'); }
      else { next.add(id); toast.success('Job saved!'); }
      return next;
    });
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag ||
      (activeTag === 'Remote' && j.location?.includes('Remote')) ||
      (activeTag === 'Urgent' && j.isUrgent) ||
      (activeTag === 'High Match' && (j.aiMatchScore || 0) >= 80) ||
      (activeTag === 'Featured' && j.isFeatured);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-950/80 via-slate-950 to-violet-950/40 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">👋 Good to see you back, {user?.name?.split(' ')[0]}</p>
                <h1 className="text-3xl font-black text-white mb-1">Your AI-Curated <span className="text-indigo-400">Job Feed</span></h1>
                <p className="text-sm text-slate-400">Personalized matches based on your skills and preferences</p>
              </motion.div>

              {/* Search */}
              <div className="relative mt-6 flex items-center bg-slate-900 border border-white/10 rounded-2xl focus-within:border-indigo-500/40 transition-all">
                <HiOutlineSearch size={16} className="text-slate-500 ml-4" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search jobs, companies..."
                  className="flex-1 bg-transparent text-white text-sm py-3.5 px-3 outline-none placeholder-slate-600" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeTag === tag ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-white/10'
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:min-w-[260px]">
              {[
                { label: 'Profile Views', value: topStats.views, icon: '👁️', color: 'indigo' },
                { label: 'AI Matches', value: topStats.matches, icon: '🎯', color: 'violet' },
                { label: 'Jobs Saved', value: savedJobs.size + topStats.saved, icon: '🔖', color: 'amber' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-lg font-black text-white">{s.value}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-400">
            <span className="text-white font-bold">{filtered.length}</span> jobs found {activeTag && <span className="text-indigo-400">· {activeTag}</span>}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HiOutlineTrendingUp size={14} />
            <span>Sorted by AI Match</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-44 bg-slate-900 rounded-2xl border border-white/5 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-slate-500">No jobs match your search</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))
              .map((job, i) => (
                <JobCard key={job._id} job={job} onApply={handleApply}
                  onSave={() => toggleSave(job._id)} saved={savedJobs.has(job._id)} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFeed;
