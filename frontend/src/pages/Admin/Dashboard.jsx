import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  HiOutlineChartPie, HiOutlineShieldCheck, HiOutlineUserGroup, 
  HiOutlineDatabase, HiOutlineTerminal, HiOutlineServer,
  HiOutlineLightningBolt, HiOutlineGlobeAlt, HiOutlineTrendingUp,
  HiOutlineChevronRight, HiOutlineChip, HiOutlineViewGrid,
  HiOutlineCollection, HiOutlineAdjustments, HiOutlineScale,
  HiOutlineCubeTransparent, HiOutlineIdentification, HiOutlineChat, HiOutlineBriefcase,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, PointElement, LineElement, Filler 
} from 'chart.js';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAuditLogs({ limit: 10 })
        ]);
        setStats(statsRes.data.stats);
        setAuditLogs(logsRes.data.logs || []);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dashboardLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: HiOutlineViewGrid },
    { label: 'Users', path: '/admin/users', icon: HiOutlineUserGroup },
    { label: 'Jobs', path: '/admin/jobs', icon: HiOutlineBriefcase },
    { label: 'Security', path: '/admin/security', icon: HiOutlineShieldCheck },
    { label: 'System Logs', path: '/admin/telemetry', icon: HiOutlineTerminal },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Synchronizing System Core...</p>
       </div>
    </div>
  );

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Current'],
    datasets: [{
      label: 'New Users',
      data: [120, 240, 180, 450, 320, 680],
      borderColor: '#0088ff',
      backgroundColor: 'rgba(0, 136, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointBackgroundColor: '#0088ff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      borderWidth: 3,
    }]
  };

  const distributionData = {
    labels: ['Candidates', 'Recruiters', 'Admins'],
    datasets: [{
      data: [stats?.candidatesCount || 0, stats?.recruitersCount || 0, 5],
      backgroundColor: ['#0088ff', '#10b981', '#f43f5e'],
      borderColor: '#0f172a',
      borderWidth: 4,
      hoverOffset: 10
    }]
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

      <main className="flex-1 overflow-y-auto px-8 py-10 relative selection:bg-primary/20 selection:text-primary">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          {/* Admin Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
               <div>
                 <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                   <HiOutlineShieldCheck /> Mission Command Access
                 </div>
                 <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2 leading-tight">Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Center</span></h1>
                 <p className="text-slate-400 font-medium max-w-md leading-relaxed">Real-time telemetry and operational distribution of the talent grid.</p>
               </div>
               
               <div className="flex gap-3">
                 <button className="px-6 py-3 bg-slate-950 border border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:border-white/10 hover:text-white transition-all flex items-center gap-2">
                   <HiOutlineDocumentText className="text-primary" /> Export Data
                 </button>
                 <button className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                   <HiOutlineAdjustments /> Global Config
                 </button>
               </div>
             </div>
          </motion.div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Units', value: stats?.totalUsers || 0, icon: HiOutlineUserGroup, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Active Missions', value: stats?.totalJobs || 0, icon: HiOutlineBriefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Neural Matches', value: stats?.totalApplications || 0, icon: HiOutlineCollection, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
              { label: 'Grid Integrity', value: '99.9%', icon: HiOutlineServer, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white font-outfit tracking-tighter mb-1">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Growth Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl"
            >
              <h2 className="text-xl font-black text-white font-outfit mb-8 flex items-center gap-3">
                <HiOutlineTrendingUp className="text-primary" />
                Unit Acquisition Velocity
              </h2>
              <div className="h-80">
                <Line 
                  data={userGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { borderDash: [2, 4], color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
                      },
                      x: { 
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
            
            {/* User Distribution */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col"
            >
              <h2 className="text-xl font-black text-white font-outfit mb-8 flex items-center gap-3">
                <HiOutlineChartPie className="text-emerald-500" />
                Personnel Distribution
              </h2>
              <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                <div className="w-full max-w-[220px] relative z-10">
                  <Doughnut data={distributionData} options={{ responsive: true, plugins: { legend: { display: false } }, cutout: '75%' }} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-black text-white font-outfit">{stats?.totalUsers || 0}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Active</p>
                </div>
              </div>
              <div className="mt-10 space-y-4">
                {[
                  { label: 'Candidates', color: 'bg-blue-500', value: stats?.candidatesCount || 0 },
                  { label: 'Recruiters', color: 'bg-emerald-500', value: stats?.recruitersCount || 0 },
                  { label: 'Command', color: 'bg-rose-500', value: 5 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${d.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                    </div>
                    <span className="text-sm font-black text-white font-outfit">{d.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* System Activity Log */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
              <h2 className="text-xl font-black text-white font-outfit flex items-center gap-3">
                <HiOutlineTerminal className="text-primary" /> Live Telemetry Feed
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grid Status: Optimized</span>
              </div>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={log._id} 
                  className="p-6 flex items-center gap-8 hover:bg-white/5 transition-all group"
                >
                  <div className="w-24 shrink-0 text-[10px] font-black text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="w-32 shrink-0">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      log.status === 'ERROR' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {log.status || 'INFO'}
                    </span>
                  </div>
                  <div className="w-56 shrink-0 font-black text-white text-xs font-outfit uppercase tracking-tight">{log.action}</div>
                  <div className="flex-1 text-xs text-slate-500 font-medium truncate">{log.details}</div>
                  <div className="w-32 shrink-0 text-[10px] font-black text-slate-700 text-right truncate uppercase tracking-widest">
                    {log.user ? log.user.name : 'System Core'}
                  </div>
                </motion.div>
              )) : (
                <div className="p-20 text-center">
                   <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">No telemetry data detected in this cycle.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
