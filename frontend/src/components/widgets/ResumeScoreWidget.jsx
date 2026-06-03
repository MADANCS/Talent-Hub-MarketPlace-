import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText, HiOutlineLightningBolt, HiOutlineCheckCircle,
  HiOutlineExclamation, HiOutlineChevronRight
} from 'react-icons/hi';

const gradeColors = {
  S: { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  A: { bg: 'from-blue-500 to-indigo-500',  text: 'text-blue-400',    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  B: { bg: 'from-violet-500 to-purple-500', text: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
  C: { bg: 'from-amber-500 to-orange-500',  text: 'text-amber-400',  badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  D: { bg: 'from-red-500 to-rose-500',      text: 'text-red-400',    badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
};

const sectionLabels = {
  contact:    { label: 'Contact Info',    icon: '📋' },
  skills:     { label: 'Skills',          icon: '⚡' },
  experience: { label: 'Experience',      icon: '💼' },
  education:  { label: 'Education',       icon: '🎓' },
  links:      { label: 'Online Presence', icon: '🔗' },
  resume:     { label: 'Resume File',     icon: '📄' },
};

const ResumeScoreWidget = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getResumeScore()
      .then(res => setData(res.data.score))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-800 rounded mb-4" />
      <div className="h-24 bg-slate-800 rounded-2xl" />
    </div>
  );

  if (!data) return null;

  const colors = gradeColors[data.grade] || gradeColors['C'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <HiOutlineDocumentText className="text-indigo-400" size={16} />
          Resume Score
        </h3>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${colors.badge}`}>
          Grade {data.grade}
        </span>
      </div>

      {/* Big Score Ring */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="8" fill="none" />
            <circle
              cx="40" cy="40" r="32"
              stroke="url(#scoreGrad)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - data.percentage / 100)}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-black ${colors.text}`}>{data.percentage}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm mb-1">
            {data.percentage >= 80 ? '🚀 Excellent Profile!' : data.percentage >= 60 ? '✨ Good Progress' : '⚡ Needs Work'}
          </p>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            {data.percentage >= 80
              ? 'Your profile stands out to recruiters.'
              : 'Complete your profile to boost recruiter visibility.'}
          </p>
        </div>
      </div>

      {/* Section Bars */}
      <div className="space-y-2.5">
        {Object.entries(data.sections).map(([key, sec]) => {
          const pct = Math.round((sec.score / sec.max) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {sectionLabels[key]?.icon} {sectionLabels[key]?.label}
                </span>
                <span className={`text-[10px] font-black ${pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    pct === 100 ? 'from-emerald-500 to-teal-500' :
                    pct >= 50  ? 'from-amber-500 to-orange-500' :
                    'from-red-500 to-rose-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Tips */}
      {data.topTips?.length > 0 && (
        <div className="border-t border-white/5 pt-4 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <HiOutlineLightningBolt className="text-amber-400" /> Quick Wins
          </p>
          {data.topTips.slice(0, 3).map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <HiOutlineExclamation className="text-amber-400 shrink-0 mt-0.5" size={12} />
              <p className="text-[10px] text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ResumeScoreWidget;
