import { useEffect, useState, lazy, Suspense, Component } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import { 
  HiOutlineUserCircle, HiOutlineBriefcase, HiOutlineChartBar,
  HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineStar, 
  HiOutlineChat, HiOutlineLightningBolt, HiOutlineChevronRight,
  HiOutlineSparkles, HiOutlineFire, HiOutlineBookmark
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { motion } from 'framer-motion';

// Lazy-load widgets so their CJS dependencies (recharts) go through
// Vite's pre-bundled dynamic import path instead of the static bundle.
const ResumeScoreWidget = lazy(() => import('../../components/widgets/ResumeScoreWidget'));
const SkillRadarWidget  = lazy(() => import('../../components/widgets/SkillRadarWidget'));

// Tiny error boundary so a broken widget shows a card, not a full-page crash
class WidgetErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 text-center text-slate-500 text-sm">
          Widget unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use allSettled so one failing endpoint doesn't blank the whole dashboard
        const [matchRes, appRes] = await Promise.allSettled([
          jobAPI.getAIMatches(),
          applicationAPI.getMyApplications()
        ]);

        if (matchRes.status === 'fulfilled') {
          setMatches(matchRes.value.data.matches || []);
        }
        if (appRes.status === 'fulfilled') {
          setStats(appRes.value.data.stats || {});
        }
        // If both fail, show a soft toast (not an error that wipes the UI)
        if (matchRes.status === 'rejected' && appRes.status === 'rejected') {
          toast.error('Could not load dashboard data. Please refresh.');
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const dashboardLinks = [
    { label: 'Overview',     path: '/candidate/dashboard',    icon: HiOutlineChartBar },
    { label: 'Applications', path: '/candidate/applications',  icon: HiOutlineBriefcase },
    { label: 'Saved Jobs',   path: '/candidate/saved-jobs',    icon: HiOutlineBookmark },
    { label: 'Leaderboard',  path: '/candidate/leaderboard',   icon: HiOutlineStar },
    { label: 'Messages',     path: '/messages',                icon: HiOutlineChat },
    { label: 'Profile',      path: '/profile/edit',            icon: HiOutlineUserCircle },
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
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-primary/20 selection:text-primary">
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
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-3xl font-black text-white border border-white/10 overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0] || 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white font-outfit tracking-tight">Mission Control</h1>
                <p className="text-slate-400 font-medium flex items-center gap-2">
                   Welcome back, <span className="text-white font-bold">{user?.name || 'Agent'}</span> 
                   <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                   <span className="text-emerald-500 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest"><HiOutlineFire /> Streak: 12 Days</span>
                </p>
              </div>
            </div>
            <Link to="/profile/edit" className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:border-primary/50 transition-all shadow-2xl hover:shadow-primary/20">
              Update Profile
            </Link>
          </motion.div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* XP & Level - Main KPI */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <HiOutlineStar size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                    Level {user?.gamification?.level || 1}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    {user?.gamification?.rank || 'Initiate'}
                  </div>
                </div>
                <h2 className="text-6xl font-black text-white font-outfit tracking-tighter mb-4">
                  {user?.gamification?.experience || 0} <span className="text-slate-600 text-3xl">XP</span>
                </h2>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(user?.gamification?.experience % 100) || 45}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" 
                   />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">55 XP to reach Level { (user?.gamification?.level || 1) + 1}</p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
               {[
                 { label: 'Applications', value: stats?.applied || 0, icon: HiOutlineBriefcase, color: 'blue' },
                 { label: 'Interviews', value: stats?.interview || 0, icon: HiOutlineChat, color: 'emerald' },
                 { label: 'Match Rating', value: '88%', icon: HiOutlineSparkles, color: 'purple' },
                 { label: 'Global Rank', value: '#412', icon: HiOutlineChartBar, color: 'amber' }
               ].map((stat, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group"
                 >
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-white font-outfit">{stat.value}</h3>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* ── Widgets Row: AI Matches + Badges + Score/Radar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Matches - 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                   <HiOutlineLightningBolt className="text-emerald-400" /> Neural Matches
                 </h2>
                 <Link to="/jobs" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Explore All</Link>
               </div>

               <div className="grid gap-4">
                 {matches && matches.length > 0 ? matches.slice(0, 4).map((match, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    whileHover={{ x: 10 }}
                    className="group bg-slate-900/40 backdrop-blur-xl p-5 rounded-[24px] border border-white/5 hover:border-primary/30 transition-all flex items-center gap-6"
                   >
                     <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-slate-500 border border-white/5 shadow-inner">
                        {match.job?.companyLogo ? <img src={match.job.companyLogo} className="w-full h-full object-cover rounded-2xl" /> : match.job?.company?.[0] || 'C'}
                     </div>
                     <div className="flex-1 min-w-0">
                       <Link to={`/jobs/${match.job?._id}`} className="text-lg font-bold text-white hover:text-primary transition-colors block truncate">
                         {match.job?.title || 'Unknown Job'}
                       </Link>
                       <p className="text-slate-400 text-sm font-medium">{match.job?.company || 'Unknown Company'}</p>
                       <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><HiOutlineLocationMarker /> {match.job?.location || 'Remote'}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><HiOutlineCurrencyDollar /> {match.job?.salaryMin ? `$${match.job.salaryMin/1000}k+` : 'Market'}</span>
                       </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">
                          {match.matchScore}% Match
                        </div>
                        <HiOutlineChevronRight className="text-slate-700 group-hover:text-primary transition-colors" />
                     </div>
                   </motion.div>
                 )) : (
                   <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-[32px] p-12 text-center">
                     <p className="text-slate-600 font-bold italic mb-4">The AI is currently analyzing your profile...</p>
                     <Link to="/profile/edit" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Complete profile to reveal matches</Link>
                   </div>
                 )}
               </div>

               {/* ── Resume Score + Skill Radar (2-col inside AI matches area) ── */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <WidgetErrorBoundary>
                   <Suspense fallback={<div className="rounded-2xl bg-slate-800/40 border border-white/5 h-48 animate-pulse" />}>
                     <ResumeScoreWidget />
                   </Suspense>
                 </WidgetErrorBoundary>
                 <WidgetErrorBoundary>
                   <Suspense fallback={<div className="rounded-2xl bg-slate-800/40 border border-white/5 h-48 animate-pulse" />}>
                     <SkillRadarWidget />
                   </Suspense>
                 </WidgetErrorBoundary>
               </div>
            </div>

            {/* Badges & Achievements - 1 Column */}
            <div className="space-y-6">
               <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight px-2">
                 <HiOutlineStar className="text-amber-400" /> Achievements
               </h2>
               <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 flex flex-col gap-6">
                  <div className="space-y-4">
                    {user?.gamification?.badges?.length > 0 ? user.gamification.badges.map((badge, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-white/5"
                      >
                         <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                           {badge.icon}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-white leading-none mb-1">{badge.name}</h4>
                            <p className="text-slate-500 text-[10px] font-medium leading-tight">{badge.description || 'Awarded for exceptional performance.'}</p>
                         </div>
                      </motion.div>
                    )) : (
                      <div className="py-10 text-center">
                         <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-white/5 text-slate-700">
                           <HiOutlineStar size={32} />
                         </div>
                         <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No badges earned yet</p>
                         <p className="text-slate-500 text-[10px] mt-2">Start applying to unlock rewards</p>
                      </div>
                    )}
                  </div>
                  <Link to="/candidate/leaderboard" className="mt-4 w-full py-4 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-center border border-white/5">
                    View Global Ranking
                  </Link>
               </div>

               {/* Quick Link to Saved Jobs */}
               <Link to="/candidate/saved-jobs"
                 className="flex items-center gap-3 p-5 rounded-[24px] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all group">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <HiOutlineBookmark size={20} />
                 </div>
                 <div>
                   <p className="text-white font-black text-sm">Saved Jobs</p>
                   <p className="text-slate-500 text-[10px] uppercase tracking-widest">View your bookmarks</p>
                 </div>
                 <HiOutlineChevronRight className="ml-auto text-slate-700 group-hover:text-indigo-400 transition-colors" />
               </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
