import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import { 
  HiOutlineBriefcase, HiOutlineUsers, HiOutlinePlus, 
  HiOutlineUserGroup, HiOutlineChat, HiOutlineAdjustments,
  HiOutlineChartBar, HiOutlineEye, HiOutlineTrendingUp,
  HiOutlineChevronRight, HiOutlineExternalLink, HiOutlineSparkles
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion } from 'framer-motion';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          jobAPI.getMyJobs(),
          applicationAPI.getRecruiterApplications({ limit: 5 })
        ]);
        setJobs(jobRes.data.jobs);
        setStats(jobRes.data.stats);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardLinks = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: HiOutlineChartBar },
    { label: 'Jobs', path: '/recruiter/jobs', icon: HiOutlineBriefcase },
    { label: 'Candidates', path: '/recruiter/applications', icon: HiOutlineUsers },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: HiOutlinePlus },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Loading Intelligence...</p>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <h1 className="text-4xl font-black text-white font-outfit tracking-tight">Recruitment HQ</h1>
              <p className="text-slate-400 font-medium mt-1">Managing talent for <span className="text-white font-bold">{user?.company || 'your organization'}</span></p>
            </div>
            <div className="flex gap-4">
              <Link to="/market-intelligence" className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:border-blue-500/50 transition-all flex items-center gap-2">
                <HiOutlineTrendingUp className="text-blue-500" /> Market Data
              </Link>
              <Link to="/recruiter/post-job" className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                <HiOutlinePlus /> Post New Job
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Openings', value: stats?.active || 0, icon: HiOutlineBriefcase, color: 'blue' },
              { label: 'Total Applicants', value: stats?.totalApplications || 0, icon: HiOutlineUsers, color: 'purple' },
              { label: 'Platform Reach', value: (stats?.totalViews || 0).toLocaleString(), icon: HiOutlineEye, color: 'emerald' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (i * 0.1) }}
                className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative"
              >
                <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 text-${stat.color}-400`}>
                  <stat.icon size={120} />
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 flex items-center justify-center mb-6`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-white font-outfit">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity / Jobs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
              <h2 className="text-xl font-black text-white font-outfit tracking-tight flex items-center gap-3">
                <HiOutlineSparkles className="text-blue-400" /> Recent Postings
              </h2>
              <Link to="/recruiter/jobs" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Manage All Jobs</Link>
            </div>
            
            <div className="p-2">
              {jobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Position & ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Talent Count</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {jobs.slice(0, 5).map((job) => (
                        <tr key={job._id} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <Link to={`/jobs/${job._id}`} className="text-sm font-bold text-white hover:text-primary transition-colors">{job.title}</Link>
                              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">{job.location} • {job.jobType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                              <div className={`w-1 h-1 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <HiOutlineUserGroup className="text-slate-600" />
                               <span className="text-sm font-black text-white">{job.applicationCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <Link to={`/recruiter/applications?job=${job._id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-blue-400 uppercase tracking-widest transition-colors">
                              Review Candidates <HiOutlineChevronRight />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 rounded-[24px] bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-white/5 text-slate-600">
                    <HiOutlineBriefcase size={40} />
                  </div>
                  <h3 className="text-white font-bold mb-2">No active job campaigns</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Start your recruitment journey by posting your first position.</p>
                  <Link to="/recruiter/post-job" className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Create New Listing
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
