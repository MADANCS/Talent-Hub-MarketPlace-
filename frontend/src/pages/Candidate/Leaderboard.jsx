import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineChartBar, HiOutlineBriefcase, HiOutlineDocumentText, 
  HiOutlineUserCircle, HiOutlineChat, HiOutlineStar,
  HiOutlineFire, HiOutlineLightningBolt
} from 'react-icons/hi';
import Sidebar from '../../components/layout/Sidebar';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const dashboardLinks = [
    { label: 'Overview', path: '/candidate/dashboard', icon: HiOutlineChartBar },
    { label: 'Applications', path: '/candidate/applications', icon: HiOutlineBriefcase },
    { label: 'Profile', path: '/profile/edit', icon: HiOutlineUserCircle },
    { label: 'Leaderboard', path: '/candidate/leaderboard', icon: HiOutlineStar },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await userAPI.getLeaderboard();
        setLeaderboard(res.data.leaderboard);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Syncing Rankings...</p>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />
      
      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <HiOutlineStar size={160} />
             </div>
             <div className="relative z-10">
               <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                 <HiOutlineStar /> Global Rankings
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Arena</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Battle for the top spot. High-performing candidates gain priority access to exclusive elite job postings.</p>
             </div>
             
             <div className="relative z-10 bg-slate-950/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md min-w-[240px]">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Your Current Status</span>
               <div className="flex items-center justify-between gap-4">
                 <div>
                   <div className="text-2xl font-black text-white font-outfit">{user?.gamification?.rank || 'Initiate'}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Level {user?.gamification?.level || 1} • {user?.gamification?.experience || 0} XP</div>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                   <HiOutlineStar size={24} />
                 </div>
               </div>
             </div>
          </motion.div>

          {/* Table */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Global Rank</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Candidate Profile</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Mastery Level</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Experience Points</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Achievements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((candidate, index) => (
                    <tr 
                      key={candidate._id} 
                      className={`group transition-all ${candidate._id === user?._id ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {index === 0 && <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-sm">#1</div>}
                          {index === 1 && <div className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-400 flex items-center justify-center font-black text-sm">#2</div>}
                          {index === 2 && <div className="w-8 h-8 rounded-full bg-orange-700/20 text-orange-600 flex items-center justify-center font-black text-sm">#3</div>}
                          {index > 2 && <span className="text-slate-500 font-bold ml-2">#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={candidate.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate?.name || 'Unknown')}&background=0088ff&color=fff&bold=true`} 
                              alt={candidate?.name || 'Candidate'} 
                              className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-primary/50 transition-colors"
                            />
                            {index < 3 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">👑</div>}
                          </div>
                          <div>
                            <div className="text-sm font-black text-white group-hover:text-primary transition-colors flex items-center gap-2">
                              {candidate.name} {candidate._id === user?._id && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] uppercase tracking-widest">You</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1">
                               <HiOutlineFire className={index < 3 ? 'text-orange-500' : 'text-slate-600'} /> {candidate.gamification?.rank || 'Initiate'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-white font-outfit">Lvl {candidate.gamification?.level || 1}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-black text-primary font-outfit">{candidate.gamification?.experience || 0}</span>
                          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${(candidate.gamification?.experience % 100) || 10}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end items-center gap-2">
                          {candidate.gamification?.badges?.slice(0, 4).map((badge, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -5, scale: 1.2 }}
                              className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/5 cursor-help"
                              title={badge.name}
                            >
                              {badge.icon}
                            </motion.div>
                          ))}
                          {candidate.gamification?.badges?.length > 4 && (
                            <span className="text-[10px] font-black text-slate-500 ml-2">+{candidate.gamification.badges.length - 4}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
