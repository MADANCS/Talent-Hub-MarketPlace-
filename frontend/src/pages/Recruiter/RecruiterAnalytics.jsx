import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell, PieChart, Pie, Legend
} from 'recharts';
import Sidebar from '../../components/layout/Sidebar';
import {
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineUsers,
  HiOutlineTrendingUp, HiOutlineViewGrid, HiOutlineChatAlt2,
  HiOutlineHome, HiOutlineSparkles
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
const PIE_COLORS    = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-slate-400 font-bold mb-1">{label}</p>
      <p className="text-indigo-400 font-black">{payload[0]?.value} applications</p>
    </div>
  );
};

const RecruiterAnalytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { label: 'Dashboard',    path: '/recruiter/dashboard',    icon: HiOutlineHome },
    { label: 'Analytics',    path: '/recruiter/analytics',    icon: HiOutlineChartBar },
    { label: 'Find Talent',  path: '/recruiter/talent',       icon: HiOutlineUsers },
    { label: 'Pipeline',     path: '/recruiter/pipeline',     icon: HiOutlineViewGrid },
    { label: 'My Jobs',      path: '/recruiter/jobs',         icon: HiOutlineBriefcase },
    { label: 'Messages',     path: '/messages',               icon: HiOutlineChatAlt2 },
  ];

  useEffect(() => {
    userAPI.getRecruiterAnalytics()
      .then(res => setData(res.data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar links={sidebarLinks} />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Analytics...</p>
        </div>
      </main>
    </div>
  );

  // Prepare funnel data
  const funnelData = data ? [
    { name: 'Applied',     value: data.funnel.applied,     fill: '#6366f1' },
    { name: 'Screening',   value: data.funnel.screening,   fill: '#8b5cf6' },
    { name: 'Interviewed', value: data.funnel.interviewed, fill: '#10b981' },
    { name: 'Offered',     value: data.funnel.offered,     fill: '#f59e0b' },
    { name: 'Hired',       value: data.funnel.hired,       fill: '#22c55e' },
  ] : [];

  const kpis = data ? [
    { label: 'Total Applications', value: data.funnel.applied,   icon: HiOutlineUsers,      color: 'indigo' },
    { label: 'Active Jobs',        value: data.activeJobs,        icon: HiOutlineBriefcase,  color: 'emerald' },
    { label: 'Avg Match Score',    value: `${data.avgMatchScore}%`, icon: HiOutlineSparkles, color: 'violet' },
    { label: 'Total Views',        value: data.totalViews,        icon: HiOutlineTrendingUp,  color: 'amber' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={sidebarLinks} />

      <main className="flex-1 overflow-y-auto px-6 py-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <HiOutlineChartBar className="text-violet-400" />
              Hiring Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time insights into your recruitment pipeline</p>
          </motion.div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 hover:border-white/10 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/10 text-${kpi.color}-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={20} />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">{kpi.label}</p>
                <h3 className="text-3xl font-black text-white">{kpi.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Applications Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <HiOutlineTrendingUp className="text-indigo-400" size={16} /> Applications (30 Days)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.appsByDay || []} barSize={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false}
                      interval={4} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Hiring Funnel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <HiOutlineViewGrid className="text-emerald-400" size={16} /> Hiring Funnel
              </h3>
              <div className="space-y-2.5">
                {funnelData.map((stage, i) => {
                  const pct = funnelData[0].value > 0
                    ? Math.round((stage.value / funnelData[0].value) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-black mb-1">
                        <span className="text-slate-400 uppercase tracking-widest">{stage.name}</span>
                        <span style={{ color: stage.fill }}>{stage.value} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stage.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Status Breakdown + Job Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Status Pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <HiOutlineSparkles className="text-violet-400" size={16} /> Application Status
              </h3>
              {data?.statusBreakdown?.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.statusBreakdown} dataKey="count" nameKey="status"
                        cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                        {data.statusBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
              )}
            </motion.div>

            {/* Job Performance Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <HiOutlineBriefcase className="text-amber-400" size={16} /> Job Performance
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-52">
                {data?.jobPerformance?.length > 0 ? data.jobPerformance.map((job, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-white text-xs font-bold truncate">{job.title}</p>
                      <p className="text-slate-500 text-[9px] font-black uppercase">{job.views} views · {job.applications} apps</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-xs font-black">{job.conversionRate}%</p>
                      <p className="text-slate-600 text-[9px]">Conv. Rate</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No jobs posted yet</div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RecruiterAnalytics;
