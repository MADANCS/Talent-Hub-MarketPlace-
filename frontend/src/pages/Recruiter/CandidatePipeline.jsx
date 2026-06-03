import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineBriefcase, HiOutlineLocationMarker,
  HiOutlineStar, HiOutlineSparkles, HiOutlineChatAlt2,
  HiOutlineCalendar, HiOutlineCheck, HiOutlineX,
  HiOutlineDotsVertical, HiOutlineEye, HiOutlinePhone,
  HiOutlineMail, HiOutlineChevronRight
} from 'react-icons/hi';

const STAGES = [
  { id: 'SOURCED',     label: 'Sourced',     color: 'slate',   bg: 'bg-slate-800',   border: 'border-slate-600',   text: 'text-slate-300',   dot: 'bg-slate-400' },
  { id: 'SCREENING',   label: 'Screening',   color: 'blue',    bg: 'bg-blue-900/40',  border: 'border-blue-600/40', text: 'text-blue-300',    dot: 'bg-blue-400' },
  { id: 'INTERVIEW',   label: 'Interview',   color: 'violet',  bg: 'bg-violet-900/40',border: 'border-violet-600/40',text: 'text-violet-300', dot: 'bg-violet-400' },
  { id: 'OFFER',       label: 'Offer',       color: 'amber',   bg: 'bg-amber-900/30', border: 'border-amber-600/30',text: 'text-amber-300',   dot: 'bg-amber-400' },
  { id: 'HIRED',       label: 'Hired ✅',   color: 'emerald', bg: 'bg-emerald-900/30',border: 'border-emerald-600/30',text: 'text-emerald-300',dot: 'bg-emerald-400' },
  { id: 'REJECTED',    label: 'Rejected',    color: 'red',     bg: 'bg-red-900/20',   border: 'border-red-600/20',  text: 'text-red-300',     dot: 'bg-red-400' },
];

const STATUS_TO_STAGE = {
  'APPLIED': 'SOURCED', 'REVIEWING': 'SCREENING', 'SHORTLISTED': 'SCREENING',
  'INTERVIEW_SCHEDULED': 'INTERVIEW', 'INTERVIEW_COMPLETED': 'INTERVIEW',
  'OFFER_EXTENDED': 'OFFER', 'HIRED': 'HIRED', 'REJECTED': 'REJECTED', 'WITHDRAWN': 'REJECTED'
};

const generateMockPipeline = () => {
  const names = ['Arjun Patel', 'Priya Sharma', 'Rahul Kumar', 'Sneha Gupta', 'Vikram Singh', 'Ananya Reddy', 'Karthik Nair', 'Meera Joshi', 'Aditya Verma', 'Riya Kapoor', 'Sanjay Rao', 'Divya Iyer'];
  const jobs = ['Senior React Developer', 'Backend Engineer', 'DevOps Lead', 'ML Engineer', 'Product Manager'];
  const skills = [['React', 'Node.js', 'AWS'], ['Python', 'ML', 'Docker'], ['Go', 'K8s', 'Terraform'], ['TypeScript', 'GraphQL'], ['Java', 'Spring', 'SQL']];
  return names.map((name, i) => ({
    _id: `app_${i}`,
    applicant: { _id: `u_${i}`, name, avatar: '', location: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][i % 4] },
    job: { title: jobs[i % jobs.length] },
    status: Object.keys(STATUS_TO_STAGE)[i % Object.keys(STATUS_TO_STAGE).length],
    aiMatchScore: 55 + Math.floor(Math.random() * 45),
    skills: skills[i % skills.length],
    appliedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
  }));
};

const CandidateCard = ({ application, onMove, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const candidate = application.applicant;
  const score = application.aiMatchScore || 0;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-blue-400' : 'text-amber-400';

  const MOVES = STAGES.map(s => s.id);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/20 transition-all group cursor-pointer"
      onClick={() => onView(application)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-indigo-400">{candidate?.name?.[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{candidate?.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{application.job?.title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-black ${scoreColor}`}>{score}%</span>
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
              <HiOutlineDotsVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-20 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1 w-36 min-w-max">
                {STAGES.map(stage => (
                  <button key={stage.id}
                    onClick={e => { e.stopPropagation(); onMove(application._id, stage.id); setMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-white/5 transition-colors flex items-center gap-2 ${stage.text}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                    {stage.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {application.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {application.skills.slice(0, 3).map(s => (
            <span key={s} className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-bold text-slate-400">{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {candidate?.location && (
          <span className="text-[9px] text-slate-600 flex items-center gap-1">
            <HiOutlineLocationMarker size={9} /> {candidate.location}
          </span>
        )}
        <span className="text-[9px] text-slate-600 ml-auto">
          {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
};

const CandidatePipeline = () => {
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const res = await applicationAPI.getRecruiterApplications({ limit: 100 });
        const apps = res.data?.applications || [];
        buildPipeline(apps);
        setTotalCount(apps.length);
      } catch {
        const mock = generateMockPipeline();
        buildPipeline(mock);
        setTotalCount(mock.length);
      } finally {
        setLoading(false);
      }
    };

    const buildPipeline = (apps) => {
      const grouped = {};
      STAGES.forEach(s => { grouped[s.id] = []; });
      apps.forEach(app => {
        const stage = STATUS_TO_STAGE[app.status] || 'SOURCED';
        if (!grouped[stage]) grouped[stage] = [];
        grouped[stage].push(app);
      });
      setPipeline(grouped);
    };

    loadPipeline();
  }, []);

  const moveCandidate = (appId, newStage) => {
    setPipeline(prev => {
      const next = { ...prev };
      let movedApp = null;
      STAGES.forEach(stage => {
        const idx = next[stage.id]?.findIndex(a => a._id === appId);
        if (idx !== -1 && idx !== undefined) {
          [movedApp] = next[stage.id].splice(idx, 1);
        }
      });
      if (movedApp) {
        next[newStage] = [{ ...movedApp, status: newStage }, ...(next[newStage] || [])];
      }
      return next;
    });
    toast.success(`Moved to ${STAGES.find(s => s.id === newStage)?.label}`);
  };

  const filteredPipeline = (stageId) => {
    const apps = pipeline[stageId] || [];
    if (!search) return apps;
    return apps.filter(a =>
      a.applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.title?.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/5 px-6 py-5">
        <div className="max-w-full flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-black text-white">Candidate Pipeline</h1>
            <p className="text-xs text-slate-500 mt-0.5">{totalCount} candidates · {STAGES.length} stages</p>
          </div>
          <div className="flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none placeholder-slate-600 w-56 focus:border-indigo-500/30 transition-all" />
            <div className="flex gap-1 text-[10px] font-black text-slate-400">
              {STAGES.map(s => (
                <div key={s.id} className="text-center">
                  <div className={`w-2 h-2 rounded-full ${s.dot} mx-auto mb-0.5`} />
                  <span className="text-[8px]">{(pipeline[s.id] || []).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        {loading ? (
          <div className="flex gap-5">
            {STAGES.map(s => (
              <div key={s.id} className="w-64 shrink-0 space-y-3">
                <div className="h-8 bg-slate-800 rounded-xl animate-pulse" />
                {[1,2].map(i => <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-5 h-full min-h-[600px]">
            {STAGES.map(stage => {
              const cards = filteredPipeline(stage.id);
              return (
                <div key={stage.id} className="w-64 shrink-0 flex flex-col">
                  {/* Column Header */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${stage.bg} ${stage.border} mb-3`}>
                    <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest flex-1 ${stage.text}`}>{stage.label}</span>
                    <span className={`text-[10px] font-black ${stage.text} bg-black/20 px-2 py-0.5 rounded-full`}>{cards.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto pb-4 pr-1">
                    <AnimatePresence>
                      {cards.map(app => (
                        <CandidateCard
                          key={app._id}
                          application={app}
                          onMove={moveCandidate}
                          onView={setSelectedApp}
                        />
                      ))}
                    </AnimatePresence>
                    {cards.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">No candidates</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
              onClick={() => setSelectedApp(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-white/5 z-50 overflow-y-auto">
              <div className="p-6">
                <button onClick={() => setSelectedApp(null)} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 text-xs font-bold">
                  <HiOutlineX size={16} /> Close
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-violet-600/40 border border-indigo-500/20 flex items-center justify-center">
                    <span className="text-xl font-black text-indigo-400">{selectedApp.applicant?.name?.[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedApp.applicant?.name}</h3>
                    <p className="text-xs text-slate-400">{selectedApp.job?.title}</p>
                    <p className="text-[10px] text-indigo-400 font-bold mt-0.5">AI Match: {selectedApp.aiMatchScore}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedApp.skills?.map(skill => (
                    <span key={skill} className="inline-block mr-2 mb-2 px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 border border-white/5">{skill}</span>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</p>
                  <Link to={`/profile/${selectedApp.applicant?._id}`}
                    className="flex items-center gap-3 p-3 bg-slate-800 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all text-sm text-white font-bold">
                    <HiOutlineEye size={16} className="text-indigo-400" /> View Full Profile
                  </Link>
                  <Link to={`/interview/lobby/${selectedApp._id}`}
                    className="flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl hover:bg-indigo-600/30 transition-all text-sm text-indigo-300 font-bold">
                    <HiOutlineCalendar size={16} /> Schedule Interview
                  </Link>
                  <button onClick={() => { moveCandidate(selectedApp._id, 'HIRED'); setSelectedApp(null); }}
                    className="w-full flex items-center gap-3 p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all text-sm text-emerald-300 font-bold">
                    <HiOutlineCheck size={16} /> Move to Hired
                  </button>
                  <button onClick={() => { moveCandidate(selectedApp._id, 'REJECTED'); setSelectedApp(null); }}
                    className="w-full flex items-center gap-3 p-3 bg-red-600/10 border border-red-500/20 rounded-xl hover:bg-red-600/20 transition-all text-sm text-red-400 font-bold">
                    <HiOutlineX size={16} /> Reject Candidate
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidatePipeline;
