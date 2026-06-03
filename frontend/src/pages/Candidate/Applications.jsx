import { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { 
  HiOutlineBriefcase, HiOutlineOfficeBuilding, HiOutlineLocationMarker, 
  HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineUserCircle, HiOutlineChevronRight,
  HiOutlineChatAlt2, HiOutlineChartBar, HiOutlineMail, HiOutlineSparkles,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import CandidateFeedbackModal from './CandidateFeedbackModal';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);

  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        const apps = res.data?.applications || [];
        const st = res.data?.stats || null;
        setApplications(apps);
        setStats(st);
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, []);

  const handleSaveFeedback = async (data) => {
    try {
      await applicationAPI.updateInterviewCandidateFeedback(selectedApp._id, feedbackInterview._id, data);
      toast.success('Thank you for sharing your experience!');
      
      // Refresh applications
      const res = await applicationAPI.getMyApplications();
      setApplications(res.data?.applications || []);
      
      setFeedbackInterview(null);
    } catch (err) {
      toast.error('Failed to log feedback');
    }
  };

  const dashboardLinks = [
    { label: 'Overview', path: '/candidate/dashboard', icon: HiOutlineUserCircle },
    { label: 'Applications', path: '/candidate/applications', icon: HiOutlineBriefcase },
    { label: 'Messages', path: '/messages', icon: HiOutlineMail },
    { label: 'Profile', path: '/profile/edit', icon: HiOutlineUserCircle },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPLIED': return { color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', icon: HiOutlineClock, label: 'Applied' };
      case 'SCREENING': return { color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', icon: HiOutlineSparkles, label: 'Screening' };
      case 'SHORTLISTED': return { color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', icon: HiOutlineCheckCircle, label: 'Shortlisted' };
      case 'INTERVIEW': return { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', icon: HiOutlineChatAlt2, label: 'Interview' };
      case 'TECHNICAL': return { color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', icon: HiOutlineLightningBolt, label: 'Technical' };
      case 'OFFER': return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', icon: HiOutlineCheckCircle, label: 'Offer Received' };
      case 'HIRED': return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', icon: HiOutlineCheckCircle, label: 'Hired' };
      case 'REJECTED': return { color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', icon: HiOutlineXCircle, label: 'Rejected' };
      default: return { color: 'text-slate-400', border: 'border-white/5', bg: 'bg-slate-500/10', icon: HiOutlineClock, label: 'Applied' };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Retrieving Mission History...</p>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

      <main className="flex-1 overflow-y-auto px-8 py-10 relative selection:bg-primary/20 selection:text-primary">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
             <div className="relative z-10">
               <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                 <HiOutlineBriefcase /> Mission Tracking
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Applications</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Monitor the progress of your active applications and upcoming interview protocols.</p>
             </div>
             
             <div className="relative z-10 flex gap-6 bg-slate-950/50 p-6 rounded-[32px] border border-white/5">
                {[
                  { label: 'Applied', val: stats?.applied, color: 'text-white' },
                  { label: 'Shortlisted', val: stats?.shortlisted, color: 'text-primary' },
                  { label: 'Interviews', val: stats?.interview, color: 'text-amber-500' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="text-center px-4">
                      <p className={`text-2xl font-black ${s.color} font-outfit`}>{s.val || 0}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">{s.label}</p>
                    </div>
                    {i < 2 && <div className="w-px h-10 bg-white/5" />}
                  </div>
                ))}
             </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {applications.length > 0 ? applications.map((app, i) => {
                const config = getStatusConfig(app.status);
                const StatusIcon = config.icon;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={app._id} 
                    onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}
                    className="group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 hover:border-primary/50 transition-all shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-slate-950 rounded-[28px] flex items-center justify-center text-2xl font-black text-slate-700 border border-white/5 group-hover:border-primary/30 transition-all group-hover:bg-slate-900">
                       {app.job?.company?.[0] || 'C'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                        <div>
                          <h2 className="text-2xl font-black text-white group-hover:text-primary block mb-2 font-outfit tracking-tight transition-colors">
                            {app.job?.title || 'Unknown Position'}
                          </h2>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <HiOutlineOfficeBuilding className="text-primary" /> {app.job?.company || 'Unknown Entity'}
                          </p>
                          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><HiOutlineLocationMarker /> {app.job?.location || 'Remote'}</span>
                            <span className="flex items-center gap-2"><HiOutlineClock /> {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border} shadow-2xl shadow-blue-500/5`}>
                            <StatusIcon size={14} /> {config.label}
                          </span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                            Status Dossier <HiOutlineChevronRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-slate-900/20 rounded-[40px] border border-dashed border-white/5 shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 text-slate-700">
                    <HiOutlineBriefcase size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white font-outfit mb-4">No Active Missions</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed mb-10">You haven't initialized any application protocols yet. Scan the market for available positions.</p>
                  <Link to="/jobs" className="px-10 py-4 bg-slate-950 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:border-primary transition-all shadow-2xl">
                    Discover Opportunities
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mission Status Modal */}
          <AnimatePresence>
            {isModalOpen && selectedApp && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/90 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-slate-900 border border-white/10 max-w-4xl w-full max-h-[90vh] rounded-[48px] shadow-[0_0_150px_rgba(0,136,255,0.15)] relative overflow-hidden flex flex-col"
                >
                  <div className="p-10 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                    <div>
                      <h4 className="text-3xl font-black text-white font-outfit tracking-tight mb-2">Mission Status Dossier</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedApp?.job?.title}</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedApp?.job?.company}</span>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-3xl border border-white/5 transition-all text-slate-500 hover:text-white">
                      <HiOutlineXCircle size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Progress & Interviews */}
                    <div className="space-y-10">
                       <section>
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <HiOutlineChartBar className="text-primary" /> Progress Matrix
                         </h5>
                         <div className="flex items-center gap-1 bg-slate-950 p-2 rounded-2xl border border-white/5 mb-6">
                           {['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED'].map((st) => (
                             <div 
                              key={st}
                              className={`h-2 flex-1 rounded-full transition-all ${selectedApp.status === st ? 'bg-primary shadow-[0_0_15px_rgba(0,136,255,0.5)]' : 'bg-slate-800'}`}
                             />
                           ))}
                         </div>
                         <div className={`p-6 rounded-3xl border ${getStatusConfig(selectedApp.status).bg} ${getStatusConfig(selectedApp.status).border} flex items-center gap-6`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusConfig(selectedApp.status).bg} border border-white/5`}>
                               {(() => { const Icon = getStatusConfig(selectedApp.status).icon; return <Icon size={24} className={getStatusConfig(selectedApp.status).color} />; })()}
                            </div>
                            <div>
                               <p className="text-white text-lg font-black font-outfit tracking-tight">{getStatusConfig(selectedApp.status).label}</p>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Protocol State</p>
                            </div>
                         </div>
                       </section>

                       <section>
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <HiOutlineLightningBolt className="text-amber-500" /> Active Protocols
                         </h5>
                         {selectedApp.status === 'INTERVIEW' || selectedApp.interviews?.length > 0 ? (
                           <div className="space-y-4">
                             {selectedApp.interviews.map((int, i) => (
                               <div key={i} className="p-6 bg-slate-950 border border-white/5 rounded-[32px] group hover:border-amber-500/30 transition-all">
                                 <div className="flex justify-between items-start mb-4">
                                   <div>
                                     <p className="text-white font-black font-outfit">{int.type} Interview</p>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(int.scheduledAt).toLocaleString()}</p>
                                   </div>
                                   <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">{int.status}</span>
                                 </div>
                                 {int.meetingLink && (int.meetingLink.startsWith('http') && !int.meetingLink.includes(window.location.host)) ? (
                                   <a href={int.meetingLink} target="_blank" rel="noreferrer" className="w-full py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10">
                                     <HiOutlineLightningBolt /> Join External Meeting
                                   </a>
                                 ) : (
                                   <Link to={`/interview/${selectedApp?._id}`} className="w-full py-3 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10">
                                     <HiOutlineLightningBolt /> Join Video Stream
                                   </Link>
                                 )}

                                 {int.status === 'COMPLETED' && !int.candidateRating && (
                                   <button 
                                     onClick={() => setFeedbackInterview(int)}
                                     className="w-full mt-2 py-2 bg-slate-900 border border-white/5 text-slate-400 font-black text-[8px] uppercase tracking-widest rounded-xl hover:text-white hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                                   >
                                     <HiOutlineChatAlt2 /> Share Experience Feedback
                                   </button>
                                 )}

                                 {int.candidateRating && (
                                   <div className="mt-2 flex items-center justify-between px-2">
                                     <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Feedback Logged</span>
                                     <div className="flex gap-1">
                                       {[1,2,3,4,5].map(s => (
                                         <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= int.candidateRating ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                       ))}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="p-10 text-center border border-dashed border-white/5 rounded-[32px]">
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No active interview windows</p>
                           </div>
                         )}
                       </section>
                    </div>

                    {/* Right: Timeline */}
                    <section>
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <HiOutlineClock className="text-primary" /> Deployment History
                      </h5>
                      <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                        {selectedApp.timeline?.slice().reverse().map((tm, i) => (
                          <div key={i} className="relative pl-10 group/tm">
                            <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-slate-950 transition-all ${i === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-slate-800'}`} />
                            <p className={`text-xs font-black uppercase tracking-tight mb-1 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{tm.status}</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-1">{tm.note}</p>
                            <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">{new Date(tm.changedAt).toLocaleDateString()} at {new Date(tm.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        <CandidateFeedbackModal
          isOpen={!!feedbackInterview}
          onClose={() => setFeedbackInterview(null)}
          onSave={handleSaveFeedback}
          jobTitle={selectedApp?.job?.title}
          companyName={selectedApp?.job?.company}
        />
      </main>
    </div>
  );
};

export default CandidateApplications;
