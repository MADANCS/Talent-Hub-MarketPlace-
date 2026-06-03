import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { HiOutlineSparkles, HiOutlineTrendingUp, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-white font-bold">{payload[0]?.payload?.subject}</p>
      <p className="text-indigo-400 font-black">{payload[0]?.value}%</p>
    </div>
  );
};

const SkillRadarWidget = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('radar');

  useEffect(() => {
    userAPI.getSkillRadar()
      .then(res => setData(res.data.radar))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-800 rounded mb-4" />
      <div className="h-48 bg-slate-800 rounded-2xl" />
    </div>
  );

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <HiOutlineSparkles className="text-violet-400" size={16} />
          Skill Radar
        </h3>
        {/* Tab Switcher */}
        <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
          {['radar', 'gaps'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[10px] font-black px-3 py-1.5 rounded-[10px] uppercase tracking-widest transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              }`}>
              {t === 'radar' ? '📡 Chart' : '⚡ Gaps'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'radar' ? (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data.categories}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
              />
              <Radar
                name="You"
                dataKey="candidate"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="Required"
                dataKey="required"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.05}
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
              <span className="w-3 h-0.5 bg-indigo-500 rounded-full inline-block" /> You
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase">
              <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block border-dashed" /> Market
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Missing Skills */}
          {data.missingSkills?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <HiOutlineX size={10} /> Skills to Learn ({data.missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.missingSkills.map(({ skill, frequency }) => (
                  <span key={skill}
                    className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black capitalize">
                    {skill} ({frequency}×)
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Matched Skills */}
          {data.matchedSkills?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <HiOutlineCheck size={10} /> Skills You Have ({data.matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.matchedSkills.map(({ skill, frequency }) => (
                  <span key={skill}
                    className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black capitalize">
                    {skill} ({frequency}×)
                  </span>
                ))}
              </div>
            </div>
          )}
          {!data.missingSkills?.length && !data.matchedSkills?.length && (
            <div className="text-center py-6">
              <HiOutlineTrendingUp size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Apply to jobs to see skill gaps</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SkillRadarWidget;
